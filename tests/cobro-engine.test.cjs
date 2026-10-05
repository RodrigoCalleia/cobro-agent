const {test}=require('node:test');
const assert=require('node:assert/strict');
const {decision,reminderPreview,money}=require('../cobro-engine.js');
const now='2026-10-03';
const base={id:'TEST-001',client:'Equipo ficticio',amount:750,due:'2026-10-02'};

for(const [days,due,stage] of [[1,'2026-10-02','friendly'],[7,'2026-09-26','friendly'],[8,'2026-09-25','direct'],[30,'2026-09-03','direct']]){
 test(`preview uses ${stage} at ${days} overdue days`,()=>{
  const i={...base,due},d=decision(i,now),p=reminderPreview(i,now);
  assert.equal(d.days,days);assert.equal(p.stage,stage);
  assert.equal(d.label,stage==='friendly'?'Recordatorio amable':'Seguimiento directo');
  assert.ok(p.subject.includes(i.id));
  for(const value of [i.client,i.id,i.due,money(i.amount)])assert.ok(p.body.includes(value));
  assert.ok(p.body.includes('Si ya la abonaron'));
  if(stage==='friendly'){assert.match(p.body,/recordatorio amable/);assert.doesNotMatch(p.body,/fecha concreta/);}
  else {assert.ok(p.body.includes(days+' días vencida'));assert.match(p.body,/fecha concreta de pago/);assert.match(p.body,/inconveniente/);}
 });
}
test('stages produce different subjects and bodies',()=>{
 const friendly=reminderPreview(base,now),direct=reminderPreview({...base,due:'2026-09-25'},now);
 assert.notEqual(friendly.subject,direct.subject);assert.notEqual(friendly.body,direct.body);
});
for(const [name,change] of [['missing id',{id:undefined}],['blank id',{id:'  '}],['missing client',{client:undefined}],['blank client',{client:'  '}],['non-string identity',{id:123,client:456}]])test(`no preview: ${name}`,()=>assert.equal(reminderPreview({...base,...change},now),null));
const blocked=[
 ['paid',{paid:true},'paid'],
 ['dispute',{disputed:true},'disputed'],
 ['promise today',{promise:now},'promise'],
 ['future promise',{promise:'2026-10-05'},'promise'],
 ['recent contact',{lastContact:'2026-10-02'},'cooldown'],
 ['two day contact',{lastContact:'2026-10-01'},'cooldown'],
 ['due today',{due:now},'wait'],
 ['future due',{due:'2026-10-12'},'wait'],
 ['31 days overdue',{due:'2026-09-02'},'review'],
 ['invalid amount',{amount:0},'invalid'],
 ['invalid due',{due:'2026-02-30'},'invalid'],
 ['invalid promise',{promise:'bad-date'},'invalid'],
 ['invalid contact',{lastContact:'bad-date'},'invalid']
];
for(const [name,change,code] of blocked)test(`no preview: ${name}`,()=>{
 const i={...base,...change};assert.equal(decision(i,now).code,code);assert.equal(reminderPreview(i,now),null);
});
test('invalid simulation date blocks preview',()=>assert.equal(reminderPreview(base,'2026-02-30'),null));
test('expired promise allows the appropriate stage',()=>assert.equal(reminderPreview({...base,due:'2026-09-25',promise:'2026-10-02'},now).stage,'direct'));
test('exactly 72 hours since contact allows preview',()=>assert.equal(reminderPreview({...base,lastContact:'2026-09-30'},now).stage,'friendly'));
test('preview rechecks state and does not mutate invoice',()=>{
 const i={...base},copy={...i};assert.ok(reminderPreview(i,now));assert.deepEqual(i,copy);
 i.paid=true;assert.equal(reminderPreview(i,now),null);
});
