/* Shared deterministic demo rules; no email delivery or persistence. */
(function (root) {
'use strict';
function decision(i,now){
 const date=v=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(v||''))return NaN;const n=Date.parse(v+'T00:00:00Z');return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===v?n:NaN};
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
const api=Object.freeze({decision,money,reminderPreview});
if(typeof module==='object'&&module.exports)module.exports=api;
else root.CobroEngine=api;
})(globalThis);
