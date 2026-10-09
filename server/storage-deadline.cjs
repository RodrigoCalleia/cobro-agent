'use strict';
const {performance} = require('node:perf_hooks');

class StorageDeadlineError extends Error {
  constructor() { super('Private storage deadline exceeded'); }
}

// One budget per logical operation, including all SDK retries and response
// bodies. The race bounds the caller even if transport ignores cancellation.
async function withStorageDeadline(operation, fetchImpl, timeoutMs) {
  const controller = new AbortController();
  const deadline = performance.now() + timeoutMs;
  const error = new StorageDeadlineError();
  let closed = false;
  const check = () => {
    if (closed || performance.now() >= deadline) {
      controller.abort(error);
      throw error;
    }
  };
  let timer;
  const expired = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort(error);
      reject(error);
    }, timeoutMs);
  });
  const guardResponse = response => {
    // Preserve native Response receivers while checking asynchronous body reads.
    return new Proxy(response, {
      get(target, property) {
        const value = Reflect.get(target, property, target);
        if (property === 'clone') return (...args) => {
          check();
          const copy = value.apply(target, args);
          check();
          return guardResponse(copy);
        };
        if (['json', 'text', 'arrayBuffer', 'blob', 'formData'].includes(property)) {
          return async (...args) => {
            check();
            const body = await value.apply(target, args);
            check();
            return body;
          };
        }
        return typeof value === 'function' ? value.bind(target) : value;
      }
    });
  };
  const guardedFetch = async (input, options = {}) => {
    check();
    const signal = options.signal ?
      AbortSignal.any([options.signal, controller.signal]) : controller.signal;
    const response = await fetchImpl(input, {...options, signal});
    check();
    return guardResponse(response);
  };
  try {
    return await Promise.race([
      Promise.resolve().then(() => operation(guardedFetch, check)).then(result => {
        check();
        return result;
      }),
      expired
    ]);
  } catch (failure) {
    if (controller.signal.aborted || performance.now() >= deadline) throw error;
    throw failure;
  } finally {
    closed = true;
    clearTimeout(timer);
    controller.abort(error);
  }
}

module.exports = {withStorageDeadline, StorageDeadlineError};

