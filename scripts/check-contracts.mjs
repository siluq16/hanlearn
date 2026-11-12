import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
execFileSync(process.execPath, ['scripts/sync-schema.mjs', '--check']);
const required = ['MVP_SCOPE', 'DOMAIN_CONTRACTS', 'SRS_SPEC', 'SECURITY_MODEL', 'TEST_PLAN'];
for (const name of required) assert(existsSync(`docs/${name}.md`), `Missing ${name}`);
for (const file of ['README.md','AGENTS.md', ...readdirSync('docs').filter(f=>f.endsWith('.md')).map(f=>`docs/${f}`)]) {
  const content=readFileSync(file,'utf8');
  assert(!content.includes('HanLearn_PRD_Architecture.md') && !content.includes('HanLearn_postgres_schema.sql'), `Stale paths: ${file}`);
}
const sql=readFileSync('docs/postgres_schema.sql','utf8');
for (const match of sql.matchAll(/create function public\.[\s\S]*?\$\$;/g)) {
  assert(/security invoker/i.test(match[0]), 'Public RPC must be invoker');
  assert(!/security definer/i.test(match[0]), 'Public definer prohibited');
}
assert(!/references public\.review_cards[^;]*on delete cascade/i.test(sql));
assert(sql.includes('request_fingerprint') && sql.includes('p_expected_version'));
console.log('PASS repository contracts/snapshot checks (static only; not SQL or RLS execution)');
