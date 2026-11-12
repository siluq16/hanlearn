import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
const files = readdirSync('supabase/migrations').filter(f => f.endsWith('.sql')).sort();
const sql = '-- GENERATED from ordered supabase/migrations. Fresh install only; do not apply twice.\n' + files.map(f => `\n-- Migration: ${f}\n${readFileSync(`supabase/migrations/${f}`, 'utf8').replace(/^\uFEFF/, '').trim()}\n`).join('');
if (process.argv.includes('--check')) {
  if (readFileSync('docs/postgres_schema.sql', 'utf8') !== sql) throw Error('SQL snapshot out of date');
} else writeFileSync('docs/postgres_schema.sql', sql);
