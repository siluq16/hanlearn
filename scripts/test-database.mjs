import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const url=process.env.HANLEARN_TEST_DATABASE_URL;
assert(url,'Set HANLEARN_TEST_DATABASE_URL to a disposable local database');
const parsed=new URL(url);
assert(['127.0.0.1','localhost','[::1]'].includes(parsed.hostname),'Only loopback test DB allowed');
assert(process.env.HANLEARN_ALLOW_DB_TESTS==='yes','Set HANLEARN_ALLOW_DB_TESTS=yes to authorize synthetic fixtures in disposable DB');
const fallback='C:/Program Files/PostgreSQL/18/bin/psql.exe';
const psql=process.env.HANLEARN_PSQL || (existsSync(fallback)?fallback:'psql');
const args=['-X',url,'-v','ON_ERROR_STOP=1','-Atq'];
function run(sql){ return execFileSync(psql,args,{input:sql,encoding:'utf8',stdio:['pipe','pipe','pipe']}); }
const base=spawnSync(psql,[...args,'-f','supabase/tests/contracts.sql'],{encoding:'utf8'});
if(base.status!==0) throw Error(base.stderr || base.error?.message || 'SQL contracts failed');
const assertions=(base.stderr.match(/NOTICE:  PASS:/g)||[]).length;
console.log(`PASS ${assertions} SQL assertions (authorization, transitions, quiz, history, plans, analytics, rollback)`);
if(existsSync('supabase/tests/sprint1.sql')) {
 const sprint=spawnSync(psql,[...args,'-f','supabase/tests/sprint1.sql'],{encoding:'utf8'});
 if(sprint.status!==0) throw Error(sprint.stderr || sprint.error?.message || 'Sprint 1 SQL failed');
 console.log(`PASS ${(sprint.stderr.match(/NOTICE:  PASS:/g)||[]).length} Sprint 1 query/authorization SQL assertions`);
}

const uid='e0000000-0000-0000-0000-000000000001';
const study=spawnSync(psql,[...args,'-f','supabase/tests/study_confirmation.sql'],{encoding:'utf8'});
if(study.status!==0) throw Error(study.stderr || study.error?.message || 'Study confirmation SQL failed');
console.log(`PASS ${(study.stderr.match(/NOTICE:  PASS:/g)||[]).length} study confirmation SQL assertions (disposable native/Auth shim only)`);
const vid='d0000000-0000-0000-0000-000000000001';
const cid='c0000000-0000-0000-0000-000000000001';
const auth=`set local role authenticated; select set_config('request.jwt.claim.sub','${uid}',true);`;
function review(key,rating=3){return `select public.submit_review('${cid}',${rating},null,0,'${key}');`;}
function asyncQuery(sql, onOutput){
 const p=spawn(psql,args,{stdio:['pipe','pipe','pipe']}); let out='',err='';
 p.stdout.on('data',d=>{out+=d;onOutput?.(out);});p.stderr.on('data',d=>err+=d);
 p.stdin.end(sql);
 return new Promise((resolve,reject)=>{p.on('error',reject);p.on('close',code=>resolve({code,out,err}));});
}
async function race(firstKey,secondKey,secondRating){
 run(`update public.review_cards set state='new',step=0,interval_days=0,ease_factor=2.5,repetitions=0,lapses=0,consecutive_successes=0,version=0,due_at=clock_timestamp()-interval '1 day' where id='${cid}';`);
 let readyResolve; const ready=new Promise(r=>readyResolve=r);
 // First transaction holds its real RPC locks while second connection attempts the operation.
 const one=asyncQuery(`begin;${auth}${review(firstKey)}select pg_sleep(1);commit;`,out=>{if(out.includes('algorithmVersion'))readyResolve();});
 const wait=await Promise.race([ready.then(()=>true),one.then(()=>false)]);
 assert(wait,'First concurrent transaction did not return review receipt');
 const started=Date.now();
 const two=asyncQuery(`begin;${auth}${review(secondKey,secondRating)}commit;`);
 const results=await Promise.all([one,two]);
 assert(Date.now()-started>=600,'Second connection did not wait for the first transaction lock');
 return results;
}
assert.equal(run(`select count(*) from auth.users where id='${uid}';`).trim(),'0','Fixture UUID already exists; use a clean disposable DB');
try {
 run(`begin;
 insert into auth.users(id,email,email_confirmed_at) values('${uid}','concurrency@example.invalid',now());
 insert into private.allowed_learners values('${uid}');
 insert into public.vocabulary(id,simplified,pinyin_marked,meaning_vi,status,review_status,source_uri,content_license,reviewed_by,reviewed_at)
 values('${vid}','CONCURRENCY-FIXTURE','test','Test only','published','approved','urn:hanlearn:test','self-authored','test',now());
 insert into public.review_cards(id,user_id,vocabulary_id,card_type) values('${cid}','${uid}','${vid}','hanzi_to_vi');commit;`);
 let [a,b]=await race('f0000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001',3);
 assert.equal(a.code,0,a.err);assert.equal(b.code,0,b.err);
 const receipt=x=>JSON.parse(x.out.split('\n').find(l=>l.startsWith('{')));
 assert.deepEqual(receipt(a),receipt(b));
 assert.equal(run(`select count(*) from public.review_events where user_id='${uid}';`).trim(),'1');
 console.log('PASS concurrent identical retry: one event, same persisted receipt');
 [a,b]=await race('f0000000-0000-0000-0000-000000000002','f0000000-0000-0000-0000-000000000003',3);
 assert.equal(a.code,0,a.err);assert.notEqual(b.code,0);assert.match(b.err,/stale_card_version/);
 assert.equal(run(`select version||':'||repetitions from public.review_cards where id='${cid}';`).trim(),'1:1');
 console.log('PASS concurrent different keys: one update, stale version conflict');
 [a,b]=await race('f0000000-0000-0000-0000-000000000004','f0000000-0000-0000-0000-000000000004',4);
 assert.equal(a.code,0,a.err);assert.notEqual(b.code,0);assert.match(b.err,/idempotency_conflict/);
 console.log('PASS concurrent changed payload: conflict');
} finally {
 run(`begin;set local hanlearn.account_erasure='on';delete from public.review_events where user_id='${uid}';
 delete from public.card_lifecycle_events where user_id='${uid}';delete from public.review_cards where user_id='${uid}';
 delete from public.vocabulary where id='${vid}';delete from private.allowed_learners where user_id='${uid}';
 delete from auth.users where id='${uid}';commit;`);
}
console.log('PASS database suite; synthetic concurrency fixture removed');
