const {test}=require('node:test');
const assert=require('node:assert/strict');
const {applyDemoFollowup,decision,reminderPreview}=require('../cobro-engine.js');
const now='2026-10-03';
const base=Object.freeze({id:'DEMO-001',client:'Equipo ficticio',amount:750,due:'2026-09-25'});
const edit=(change={})=>({state:'pending',promise:'',lastContact:'',...change});

test('same unpaid invoice becomes disputed and can resume a direct draft',()=>{
 const paused=applyDemoFollowup(base,edit({state:'disputed'}),now);
 assert.equal(paused.ok,true);assert.equal(decision(paused.value,now).code,'disputed');assert.equal(reminderPreview(paused.value,now),null);
 const resumed=applyDemoFollowup(paused.value,edit(),now);
 assert.equal(resumed.ok,true);assert.equal(reminderPreview(resumed.value,now).stage,'direct');
 for(const key of ['id','client','amount','due'])assert.equal(resumed.value[key],base[key]);
});
test('promise on today pauses, clearing it resumes, expired promise resumes',()=>{
 for(const promise of [now,'2026-10-05']){
  const result=applyDemoFollowup(base,edit({promise}),now);
  assert.equal(result.ok,true);assert.equal(decision(result.value,now).code,'promise');assert.equal(reminderPreview(result.value,now),null);
  const cleared=applyDemoFollowup(result.value,edit(),now);
  assert.equal(cleared.ok,true);assert.equal(Object.hasOwn(cleared.value,'promise'),false);assert.equal(decision(cleared.value,now).code,'remind');
 }
 assert.equal(decision(applyDemoFollowup(base,edit({promise:'2026-10-02'}),now).value,now).code,'remind');
});
test('last contact pauses for less than 72 hours and clears to resume',()=>{
 for(const lastContact of ['2026-10-01','2026-10-02',now]){
  const result=applyDemoFollowup(base,edit({lastContact}),now);
  assert.equal(result.ok,true);assert.equal(decision(result.value,now).code,'cooldown');assert.equal(reminderPreview(result.value,now),null);
  const cleared=applyDemoFollowup(result.value,edit(),now);
  assert.equal(Object.hasOwn(cleared.value,'lastContact'),false);assert.ok(reminderPreview(cleared.value,now));
 }
 assert.equal(decision(applyDemoFollowup(base,edit({lastContact:'2026-09-30'}),now).value,now).code,'remind');
});
test('dispute takes precedence while dates are retained for resuming',()=>{
 const paused=applyDemoFollowup(base,edit({state:'disputed',promise:'2026-10-05',lastContact:'2026-10-02'}),now);
 assert.equal(decision(paused.value,now).code,'disputed');
 const resumed=applyDemoFollowup(paused.value,edit({promise:'2026-10-05',lastContact:'2026-10-02'}),now);
 assert.equal(decision(resumed.value,now).code,'promise');
 const noPromise=applyDemoFollowup(resumed.value,edit({lastContact:'2026-10-02'}),now);
 assert.equal(decision(noPromise.value,now).code,'cooldown');
});
test('editing followup preserves existing stage and due boundaries',()=>{
 for(const [due,code,stage] of [['2026-10-12','wait',null],[now,'wait',null],['2026-10-02','remind','friendly'],['2026-09-26','remind','friendly'],['2026-09-25','remind','direct'],['2026-09-03','remind','direct'],['2026-09-02','review',null]]){
  const result=applyDemoFollowup({...base,due},edit(),now);
  assert.equal(result.ok,true);assert.equal(decision(result.value,now).code,code);assert.equal(reminderPreview(result.value,now)?.stage||null,stage);
 }
});
test('immutable inputs and fixed invoice fields are preserved',()=>{
 const original=Object.freeze({...base,paid:false,disputed:true,promise:'2026-10-05',lastContact:'2026-10-02'});
 const patch=Object.freeze(edit());
 const result=applyDemoFollowup(original,patch,now);
 assert.equal(result.ok,true);assert.notEqual(result.value,original);
 assert.deepEqual(original,{...base,paid:false,disputed:true,promise:'2026-10-05',lastContact:'2026-10-02'});
 assert.deepEqual(patch,edit());assert.equal(result.value.paid,false);
 for(const key of ['id','client','amount','due'])assert.equal(result.value[key],original[key]);
});
test('paid invoice cannot be altered, including stale payment after opening editor',()=>{
 const original={...base};original.paid=true;
 const result=applyDemoFollowup(original,edit({state:'disputed',promise:'2026-10-05'}),now);
 assert.deepEqual(result,{ok:false,error:'Una factura pagada no admite cambios de seguimiento.'});assert.equal(original.disputed,undefined);
 assert.equal(decision(original,now).code,'paid');
});
test('invalid optional dates are rejected even while disputed or paid',()=>{
 for(const state of ['pending','disputed'])for(const paid of [false,true])for(const key of ['promise','lastContact'])for(const value of ['2026-02-30','2026-13-01','2026-2-03','not-a-date','2026-10-03T00:00:00Z',' 2026-10-03 ']){
  assert.deepEqual(applyDemoFollowup({...base,paid},edit({state,[key]:value}),now),{ok:false,error:'Revisá el estado y las fechas de la simulación.'});
 }
});
test('calendar dates distinguish leap day and non-leap day',()=>{
 assert.equal(applyDemoFollowup(base,edit({promise:'2028-02-29'}),now).ok,true);
 assert.equal(applyDemoFollowup(base,edit({promise:'2027-02-29'}),now).ok,false);
});
test('future contact rejected even in dispute and date of today is valid',()=>{
 for(const state of ['pending','disputed'])assert.equal(applyDemoFollowup(base,edit({state,lastContact:'2026-10-04'}),now).ok,false);
 assert.equal(applyDemoFollowup(base,edit({lastContact:now}),now).ok,true);
});
test('changes strictly accept only three string fields without coercion',()=>{
 for(const patch of [null,[],{},edit({state:'paid'}),edit({state:true}),edit({promise:null}),edit({promise:undefined}),edit({lastContact:123}),{...edit(),id:'OTHER'},{...edit(),client:'Other'},Object.assign(Object.create({state:'pending'}),{promise:'',lastContact:''})])assert.equal(applyDemoFollowup(base,patch,now).ok,false);
 let accessed=false;
 const accessor={...edit()};Object.defineProperty(accessor,'state',{get(){accessed=true;return 'pending'}});
 assert.equal(applyDemoFollowup(base,accessor,now).ok,false);assert.equal(accessed,false);
 assert.equal(applyDemoFollowup(base,{...edit(),[Symbol('extra')]:''},now).ok,false);
});
test('bad invoice records or clock return fixed errors without identity',()=>{
 for(const invoice of [null,[],{...base,id:null},{...base,amount:'750'},{...base,due:'2026-02-30'},{...base,paid:'false'},{...base,disputed:1},{...base,unknown:'secret'}])assert.deepEqual(applyDemoFollowup(invoice,edit(),now),{ok:false,error:'Revisá el estado y las fechas de la simulación.'});
 for(const clock of [undefined,123,'2026-02-30'])assert.equal(applyDemoFollowup(base,edit(),clock).ok,false);
 const malicious=new Proxy({}, {getPrototypeOf(){throw Error('PRIVATE-ID')}});
 const result=applyDemoFollowup(malicious,edit(),now);assert.equal(result.ok,false);assert.doesNotMatch(JSON.stringify(result),/PRIVATE-ID|DEMO-001|Equipo ficticio/);
});
