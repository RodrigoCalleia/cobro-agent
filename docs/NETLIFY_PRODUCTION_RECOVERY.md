# Netlify production recovery

## Purpose

Recover the existing public Rondacobro demo when GitHub `main` is newer than the artifact assigned to the production domain. This procedure uses the existing Netlify project only. It must not create another account/site, change plans, enable forms, invoke functions, or promote a pull-request preview.

## Current incident boundary — 2026-10-10

- Expected source: GitHub `main` at or after `0eb50975a06a263b21df72a099c5f20e301c6acf`.
- Public domain: https://cobro-agent-rodrigo.netlify.app/
- Observed production still identifies itself as `Cobro · prototipo` and `cobro.`.
- The expected source identifies itself as `Rondacobro · simulación B2B` and `rondacobro.`.
- GitHub has no Actions runs, check runs or commit statuses proving a production deploy for the current main.
- PR #8 is an old, draft, diverged feature branch. Its deploy preview must not be promoted.

## Authenticated inspection

In the existing Netlify project `cobro-agent-rodrigo`:

1. Open **Project configuration → Build & deploy → Continuous deployment**.
2. Confirm the connected repository is exactly `RodrigoCalleia/cobro-agent`.
3. Confirm the production branch is exactly `main`.
4. Confirm deploys are not stopped or locked to an older deploy.
5. Confirm the build command and publish directory still match `netlify.toml`; do not add form handling, environment activation flags or new secrets.
6. Open **Deploys** and identify the deploy currently published to production. Record its deploy ID and source commit.
7. If a completed deploy from current `main` exists but is not published, publish that exact production-branch deploy. Never publish a `deploy-preview-8` artifact.
8. Otherwise trigger a clear-cache production deploy from current `main`. Stop if the selected source commit is not current main or a descendant.

## Build acceptance

Before publication, require:

- repository tests finish successfully;
- static build produces the expected two public assets: `index.html` and `cobro-engine.js`;
- no contact form, checkout or real-data route is added to the public assets;
- the pilot-interest function remains unconditional `503/unavailable`;
- no operator repair runtime is connected to a route or scheduler.

## Public acceptance

After Netlify reports the production deploy as published, refresh the public domain in a separate session and verify:

- title: `Rondacobro · simulación B2B`;
- brand: `rondacobro.`;
- eyebrow: `Seguimiento B2B en una sola vista`;
- product-status card: `Estado del producto` / `Demo interactiva`;
- workspace heading: `Tu tablero de seguimiento`;
- actions: `Agregar factura`, `Reiniciar`, `Exportar JSON`;
- desktop and mobile layouts expose the fictional invoice simulation without broken assets;
- no contact capture, email delivery, payment, storage or repair control is visible or executed.

Record the production deploy ID, exact commit, publication time and observed markers before declaring recovery complete.

## Fail-closed rules

- Do not publish any PR preview.
- Do not change the production branch away from `main`.
- Do not enable capture, forms, storage, repair jobs, email or payment.
- Do not call the disabled capture endpoint merely to test it.
- If the deploy source cannot be bound to current `main`, stop and record the mismatch.
