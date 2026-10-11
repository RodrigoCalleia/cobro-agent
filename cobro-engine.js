/* Shared deterministic demo rules; no email delivery or persistence. */
(function (root) {
'use strict';
const date=v=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(v||''))return NaN;const n=Date.parse(v+'T00:00:00Z');return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===v?n:NaN};
function decision(i,now){
 if(!Number.isFinite(i.amount)||i.amount<=0||!Number.isFinite(date(i.due))||!Number.isFinite(date(now)))return {code:'invalid',label:'Revisar datos'};
 if(i.paid)return {code:'paid',label:'Pagada'};
 if(i.disputed)return {code:'disputed',label:'Pausada por disputa'};
 if(i.promise){if(!Number.isFinite(date(i.promise)))return {code:'invalid',label:'Revisar promesa'};if(date(i.promise)>=date(now))return {code:'promise',label:'Esperar promesa'};}
 const days=Math.floor((date(now)-date(i.due))/86400000);
 if(days<=0)return {code:'wait',label:'Esperar vencimiento'};
 if(i.lastContact){if(!Number.isFinite(date(i.lastContact)))return {code:'invalid',label:'Revisar contacto'};if(date(now)-date(i.lastContact)<3*86400000)return {code:'cooldown',label:'Esperar 72 horas'};}
 if(days>30)return {code:'review',label:'Requiere revisión'};
 return {code:'remind',label:days<=7?'Recordatorio amable':'Seguimiento directo',days};
}

function applyDemoFollowup(invoice, changes, now) {
 const invalid=()=>({ok:false,error:'Revisá el estado y las fechas de la simulación.'});
 try {
  // Only plain demo records and explicit primitive fields; do not coerce form data.
  const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&(Object.getPrototypeOf(v)===Object.prototype||Object.getPrototypeOf(v)===null);
  if(!plain(invoice)||!plain(changes)||typeof now!=='string'||!Number.isFinite(date(now)))return invalid();
  const fields=Object.getOwnPropertyDescriptors(changes),keys=Reflect.ownKeys(fields);
  if(keys.length!==3||!['state','promise','lastContact'].every(k=>Object.hasOwn(fields,k)&&Object.hasOwn(fields[k],'value')&&typeof fields[k].value==='string'))return invalid();
  const values={state:fields.state.value,promise:fields.promise.value,lastContact:fields.lastContact.value};
  if(!['pending','disputed'].includes(values.state))return invalid();
  for(const key of ['promise','lastContact'])if(values[key]!==''&&!Number.isFinite(date(values[key])))return invalid();
  if(values.lastContact!==''&&date(values.lastContact)>date(now))return invalid();
  const record=Object.getOwnPropertyDescriptors(invoice),allowed=['id','client','amount','due','promise','paid','disputed','lastContact'];
  if(!Reflect.ownKeys(record).every(k=>allowed.includes(k)&&Object.hasOwn(record[k],'value')))return invalid();
  const original={...invoice};
  if(typeof original.id!=='string'||!original.id.trim()||typeof original.client!=='string'||!original.client.trim()||!Number.isFinite(original.amount)||original.amount<=0||typeof original.due!=='string'||!Number.isFinite(date(original.due)))return invalid();
  if(['paid','disputed'].some(k=>original[k]!==undefined&&typeof original[k]!=='boolean'))return invalid();
  if(original.paid)return {ok:false,error:'Una factura pagada no admite cambios de seguimiento.'};
  const value={...original,disputed:values.state==='disputed'};
  for(const key of ['promise','lastContact']){if(values[key]==='')delete value[key];else value[key]=values[key];}
  return {ok:true,value};
 } catch {
  return invalid();
 }
}

const money=n=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'USD'}).format(n);
function reminderPreview(invoice, now) {
 if(typeof invoice.id!=='string'||!invoice.id.trim()||typeof invoice.client!=='string'||!invoice.client.trim())return null;
 const d=decision(invoice, now);
 if(d.code!=='remind')return null;
 const greeting='Hola, equipo de '+invoice.client+'.';
 const details='La factura '+invoice.id+' por '+money(invoice.amount)+' venció el '+invoice.due+'.';
 const paid='Si ya la abonaron, por favor compartan el comprobante para conciliarla.';
 if(d.days<=7)return {
  stage:'friendly',
  subject:'Recordatorio de factura '+invoice.id,
  body:greeting+'\n\nLes acercamos un recordatorio amable. '+details+'\n\n¿Podrían confirmar si está programada para pago? '+paid+'\n\nGracias.'
 };
 return {
  stage:'direct',
  subject:'Fecha de pago pendiente · factura '+invoice.id,
  body:greeting+'\n\n'+details+' Lleva '+d.days+' días vencida.\n\nNecesitamos una fecha concreta de pago para planificar el seguimiento. ¿Podrían confirmarla o indicar si hay algún inconveniente que debamos revisar? '+paid+'\n\nGracias.'
 };
}
const api=Object.freeze({decision,money,reminderPreview,applyDemoFollowup});
if(typeof module==='object'&&module.exports)module.exports=api;
else root.CobroEngine=api;
})(globalThis);
