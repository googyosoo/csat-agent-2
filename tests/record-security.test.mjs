import test from "node:test";
import assert from "node:assert/strict";
import { createRecordSecurity } from "../server/record-security.mjs";
// Written before implementation. Red baseline not executed: no Node runner available.
const now=1800000000, email='student@example.com';
const enc=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
const token=(c={},h={})=>[enc({alg:'RS256',...h}),enc({aud:'project',iss:'https://securetoken.google.com/project',sub:'u1',email,exp:now+1000,iat:now-10,auth_time:now-10,...c}),'signature'].join('.');
function setup({options={},user={},status=200,network=false}={}) {
 const calls=[];
 const mw=createRecordSecurity({projectId:'project',apiKey:'test-key',clock:()=>now*1000,fetch:async(url,init)=>{calls.push({url,init});if(network)throw Error('secret upstream');return {ok:status===200,status,json:async()=>({users:[{localId:'u1',email,emailVerified:true,disabled:false,validSince:String(now-100),displayName:'Verified Name',...user}]})};},...options});
 return {calls,run:async(url='/api/analytics',{method='GET',body,authorization='Bearer '+token()}={})=>{const req={originalUrl:url,method,body,headers:{authorization}};const res={statusCode:200,status(n){this.statusCode=n;return this;},json(v){this.body=v;return this;}};let next=0;await mw(req,res,()=>{next++;});return {req,res,next};}};
}
test('missing token/config; public and OPTIONS unchanged',async()=>{
 assert.equal((await setup().run(undefined,{authorization:''})).res.statusCode,401);
 assert.equal((await setup({options:{projectId:'',apiKey:''}}).run()).res.statusCode,503);
 for(const url of ['/api/gemini/other','/api/transformed-questions'])assert.equal((await setup().run(url)).next,1);
 assert.equal((await setup().run('/api/analytics',{method:'OPTIONS',authorization:''})).next,1);
});
test('invalid project/issuer/algorithm/times/size rejected before lookup',async()=>{
 for(const t of [token({aud:'other'}),token({iss:'wrong'}),token({exp:now}),token({iat:now+1}),token({auth_time:now+1}),token({}, {alg:'none'}),'x'.repeat(17000)]){const s=setup();assert.equal((await s.run(undefined,{authorization:'Bearer '+t})).res.statusCode,401);assert.equal(s.calls.length,0);}
 assert.equal((await setup().run(undefined,{authorization:'bearer '+token()})).res.statusCode,401);
});
test('upstream rejects/network failures fail closed and reveal no credentials',async()=>{
 assert.equal((await setup({status:400}).run()).res.statusCode,401);
 for(const s of [setup({network:true}),setup({status:503})]){const r=await s.run();assert.equal(r.res.statusCode,503);assert.doesNotMatch(JSON.stringify(r.res.body),/test-key|signature|secret upstream|student@example/);}
});
test('disabled, unverified, revoked, identity mismatch',async()=>{
 for(const user of [{disabled:true},{emailVerified:false},{validSince:String(now)}])assert.equal((await setup({user}).run()).res.statusCode,403);
 for(const user of [{localId:'other'},{email:'other@example.com'}])assert.equal((await setup({user}).run()).res.statusCode,401);
});
test('admin routes reject students including queries/trailing slashes',async()=>{
 for(const [url,method] of [['/api/gemini/student-report/?x=1','POST'],['/api/transformed-questions/?x=1','POST'],['/api/transformed-questions/1','DELETE'],['/api/transformed-questions','PUT'],['/api/transformed-questions','PATCH']]){const r=await setup().run(url,{method,body:{role:'admin'}});assert.equal(r.res.statusCode,403);assert.equal(r.next,0);}
});
test('mixed bulk and nested cross-user sync rejected before next',async()=>{
 for(const body of [{students:[{email:'victim@example.com'}]},{students:[{email},{email:'victim@example.com'}]},{socraticLogs:[{studentEmail:'victim@example.com'}]},{learningEvents:[{studentEmail:'victim@example.com'}]},{students:[{email,socraticLogs:[{studentEmail:'victim@example.com'}]}]},{students:[{email,learningEvents:[{studentEmail:'victim@example.com'}]}]}]){const r=await setup().run('/api/analytics/sync?x=1',{method:'POST',body});assert.equal(r.res.statusCode,403);assert.equal(r.next,0);}
});
test('malformed arrays/types, limits and dangerous keys rejected',async()=>{
 for(const body of [{students:{}},{students:[null]},{students:[{email,socraticLogs:'bad'}]},{socraticLogs:[{}]},{students:Array(501).fill({email})},JSON.parse('{"__proto__":{"admin":true}}')]){const r=await setup().run('/api/analytics/sync',{method:'POST',body});assert.equal(r.res.statusCode,400);assert.equal(r.next,0);}
});
test('own sync normalizes verified identity and strips authority',async()=>{
 const r=await setup().run('/api/analytics/sync/',{method:'POST',body:{students:[{email,id:'spoof',name:'spoof',uid:'spoof',role:'admin',admin:true,socraticLogs:[{studentEmail:email,question:'Why?'}]}],learningEvents:[{studentEmail:email,type:'practice'}]}});
 assert.equal(r.next,1);const s=r.req.body.students[0];assert.equal(s.id,'u1');assert.equal(s.name,'Verified Name');for(const k of ['uid','role','admin'])assert.equal(s[k],undefined);assert.equal(s.socraticLogs[0].question,'Why?');assert.equal(r.req.verifiedUser.isAdmin,false);
});
test('read scopes records/nested logs and removes global class counts',async()=>{
 const r=await setup().run('/api/analytics/summary?all=true');r.res.json({students:[{email,socraticLogs:[{studentEmail:email},{studentEmail:'other@example.com'}]},{email:'other@example.com'}],socraticLogs:[{studentEmail:email},{studentEmail:'other@example.com'}],learningEvents:[{studentEmail:'other@example.com'}],count:99,socraticCount:99,classCounts:{A:99},totalStudents:99});
 const b=r.res.body;assert.equal(b.students.length,1);assert.equal(b.students[0].socraticLogs.length,1);assert.equal(b.learningEvents.length,0);assert.equal(b.count,1);assert.equal(b.socraticCount,1);assert.equal(b.classCounts,undefined);assert.equal(b.totalStudents,undefined);
});
test('sync response omits unsupported global counters without injecting arrays',async()=>{
 const r=await setup().run('/api/analytics/sync',{method:'POST',body:{students:[{email}]}});r.res.json({success:true,count:77,socraticCount:45});assert.deepEqual(r.res.body,{success:true});
});
test('admins full read/mutations and explicit test allowlist',async()=>{
 for(const admin of ['sitech3@simin.hs.kr','hongjinwoo@simin.hs.kr','test-admin@example.com']){const s=setup({user:{email:admin},options:admin.startsWith('test-')?{adminEmails:[admin]}:{}});for(const url of ['/api/analytics','/api/gemini/student-report/','/api/transformed-questions/1']){const r=await s.run(url,{method:'DELETE',authorization:'Bearer '+token({email:admin})});assert.equal(r.next,1);const payload={students:[{email:'other@example.com'}],count:99};r.res.json(payload);assert.equal(r.res.body,payload);}}
});
test('fixed Google endpoint, exact token body, abort signal and no cache',async()=>{
 const s=setup();await s.run();await s.run();assert.equal(s.calls.length,2);const c=s.calls[0];assert.equal(c.url,'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=test-key');assert.deepEqual(JSON.parse(c.init.body),{idToken:token()});assert.equal(c.init.method,'POST');assert.ok(c.init.signal);
});
test('case-insensitive Express routes remain protected',async()=>{
 for(const [url,method] of [['/API/ANALYTICS/DATA?all=1','GET'],['/api/GEMINI/STUDENT-REPORT/','POST'],['/API/TRANSFORMED-QUESTIONS/1','PATCH']]){
  const missing=await setup().run(url,{method,authorization:''});assert.equal(missing.res.statusCode,401);assert.equal(missing.next,0);
  if(method!=='GET')assert.equal((await setup().run(url,{method})).res.statusCode,403);
 }
 const sync=await setup().run('/API/ANALYTICS/SYNC/',{method:'POST',body:{students:[{email:'other@example.com'}]}});assert.equal(sync.res.statusCode,403);assert.equal(sync.next,0);
});

test('own singular activity records normalize verified names, including nested forms',async()=>{
 for(const key of ['socraticLog','learningEvent']){
  const r=await setup().run('/api/analytics/sync',{method:'POST',body:{[key]:{studentEmail:email,studentName:'Spoof Name',type:'practice'},students:[{email,[key]:{studentEmail:email,studentName:'Nested Spoof'}}]}});
  assert.equal(r.next,1);assert.equal(r.req.body[key].studentEmail,email);assert.equal(r.req.body[key].studentName,'Verified Name');assert.equal(r.req.body.students[0][key].studentName,'Verified Name');assert.equal(r.req.body[key].type,'practice');
 }
 const embedded=await setup().run('/api/analytics/sync',{method:'POST',body:{metadata:{studentEmail:email,studentName:'Spoof'}}});assert.equal(embedded.req.body.metadata.studentName,'Verified Name');
});
test('singular activities reject missing/malformed owner and cross-user before next',async()=>{
 for(const key of ['socraticLog','learningEvent']){
  for(const value of [{},null,[],false,'bad',{studentEmail:12}]){
   const r=await setup().run('/api/analytics/sync',{method:'POST',body:{[key]:value}});assert.equal(r.res.statusCode,400);assert.equal(r.next,0);
  }
  for(const body of [{[key]:{studentEmail:'other@example.com'}},{students:[{email,[key]:{studentEmail:'other@example.com'}}]}]){
   const r=await setup().run('/api/analytics/sync',{method:'POST',body});assert.equal(r.res.statusCode,403);assert.equal(r.next,0);
  }
 }
});
test('exact own student/activity metrics survive without global or nested class leakage',async()=>{
 const metrics={loginCount:4,totalDwellTimeMinutes:12.5,completedPassagesCount:3,transformedQuestionsGenerated:6,quizAccuracyPercentage:80,socraticQuestionsCount:7};
 const other='other@example.com';const r=await setup().run();
 r.res.json({...metrics,classCounts:{A:99},students:[{email,...metrics,classCounts:{A:99},classAverage:90,metadata:{...metrics,classCounts:{A:99}},socraticLogs:[{studentEmail:email,...metrics,classStats:{A:99}},{studentEmail:other,...metrics}],learningEvent:{studentEmail:email,...metrics,classSummary:{A:99}}},{email:other,...metrics}],learningEvents:[{studentEmail:email,...metrics,classCounts:{A:99}},{studentEmail:other,...metrics}]});
 const b=r.res.body;assert.equal(b.students.length,1);assert.equal(b.learningEvents.length,1);assert.equal(b.students[0].socraticLogs.length,1);
 for(const record of [b.students[0],b.students[0].socraticLogs[0],b.students[0].learningEvent,b.learningEvents[0]]){
  for(const [key,value] of Object.entries(metrics))assert.equal(record[key],value);
  for(const key of ['classCounts','classAverage','classStats','classSummary'])assert.equal(record[key],undefined);
 }
 for(const key of Object.keys(metrics)){assert.equal(b[key],undefined);assert.equal(b.students[0].metadata[key],undefined);}
 assert.equal(b.classCounts,undefined);assert.equal(b.count,1);assert.equal(b.socraticCount,1);
});
