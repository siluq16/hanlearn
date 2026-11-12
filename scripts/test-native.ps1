param([string]$PgBin = 'C:\Program Files\PostgreSQL\18\bin')
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $repo
$testRoot = Join-Path $repo '.local'
$data = Join-Path $testRoot 'pgdata'
New-Item -ItemType Directory -Force -Path $testRoot | Out-Null
if (-not (Test-Path -LiteralPath (Join-Path $data 'PG_VERSION'))) {
    & (Join-Path $PgBin 'initdb.exe') -D $data -U postgres -A trust --encoding=UTF8 --locale=C
    if ($LASTEXITCODE -ne 0) { throw 'initdb failed' }
}
$database = 'hanlearn_test_' + (Get-Date -Format 'yyyyMMddHHmmss')
& (Join-Path $PgBin 'pg_ctl.exe') -D $data -l (Join-Path $testRoot 'postgres.log') -o '-h 127.0.0.1 -p 55439' -w start
if ($LASTEXITCODE -ne 0) { throw 'Cannot start isolated PostgreSQL; check port 55439' }
try {
    $psql = Join-Path $PgBin 'psql.exe'
    & $psql -X -h 127.0.0.1 -p 55439 -U postgres -d postgres -v ON_ERROR_STOP=1 -c "create database $database"
    if ($LASTEXITCODE -ne 0) { throw 'Create database failed' }
    $env:HANLEARN_PSQL = $psql
    $env:HANLEARN_TEST_DATABASE_URL = "postgresql://postgres@127.0.0.1:55439/$database"
    $env:HANLEARN_ALLOW_DB_TESTS = 'yes'
    & $psql -X $env:HANLEARN_TEST_DATABASE_URL -v ON_ERROR_STOP=1 -1 -f supabase/tests/native_auth_shim.sql
    if ($LASTEXITCODE -ne 0) { throw 'Auth shim failed' }
    Get-ChildItem supabase/migrations/*.sql | Sort-Object Name | ForEach-Object {
        & $psql -X $env:HANLEARN_TEST_DATABASE_URL -v ON_ERROR_STOP=1 -1 -q -f $_.FullName
        if ($LASTEXITCODE -ne 0) { throw "Migration failed: $($_.Name)" }
        Write-Output "PASS migration: $($_.Name)"
    }
    node scripts/test-database.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Database tests failed' }
    & $psql -X $env:HANLEARN_TEST_DATABASE_URL -Atq -c 'select version()'
} finally {
    & (Join-Path $PgBin 'pg_ctl.exe') -D $data -m fast -w stop
    if ($LASTEXITCODE -ne 0) { Write-Warning 'Check isolated PostgreSQL shutdown manually' }
}
