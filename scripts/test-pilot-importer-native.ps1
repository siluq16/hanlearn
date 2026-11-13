#requires -Version 5.1
# Always a new loopback-only cluster/database. Never reuse a configured database or .env.
param([switch]$ProtectedDelivery)
$ErrorActionPreference='Stop'
$env:PSModulePath=(Join-Path $PSHOME 'Modules')+';'+$env:PSModulePath
$repo=Split-Path -Parent $PSScriptRoot
$bin='C:\Program Files\PostgreSQL\18\bin'
$run=[Guid]::NewGuid().ToString('N')
$data=Join-Path $repo ('.local/pilot-importer/cluster-'+$run)
$database='hanlearn_import_r3_'+$run
$nonce=[Guid]::NewGuid().ToString('N')
$started=$false
$names=@('PGHOST','PGHOSTADDR','PGPORT','PGDATABASE','PGUSER','PGPASSWORD','PGSERVICE','PGSERVICEFILE','PGOPTIONS','PGSSLMODE','PGCLIENTENCODING','PGPASSFILE','HANLEARN_IMPORT_DATABASE','HANLEARN_IMPORT_NONCE','HANLEARN_IMPORT_LOCAL_ONLY')
$saved=@{}
foreach($name in $names){$saved[$name]=[Environment]::GetEnvironmentVariable($name);[Environment]::SetEnvironmentVariable($name,$null)}
function Invoke-PgCtl([string]$operation) {
 $arguments=if($operation -eq 'start') {
  '-D "'+$data+'" -l "'+(Join-Path $data 'fixture.log')+'" -o "-h 127.0.0.1 -p 55449 -c log_statement=none -c log_min_error_statement=panic -c log_parameter_max_length_on_error=0 -c log_error_verbosity=terse -c log_min_messages=panic" -w start'
 } else { '-D "'+$data+'" -m fast -w stop' }
 # Do not capture a pipe inherited by the background server or use Start-Process -Wait (tree wait).
 $process=Start-Process -FilePath (Join-Path $bin 'pg_ctl.exe') -ArgumentList $arguments -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $data ($operation+'.out')) -RedirectStandardError (Join-Path $data ($operation+'.err'))
 try { $null=$process.Handle; if(-not $process.WaitForExit(60000)){throw 'PG_CTL_TIMEOUT'}; $process.Refresh(); if($process.ExitCode -ne 0){throw 'PG_CTL_FAILED'} }
 finally {$process.Dispose()}
}
try {
 Push-Location -LiteralPath $repo
 $null=& node scripts/pilot-r3-preflight.mjs --audit
 if($LASTEXITCODE -ne 0){throw 'LOCAL_FREEZE_OR_MIGRATION_HASH_FAILED'}
 $expected=Get-Content supabase/verification/expected_schema.json -Raw -Encoding UTF8 | ConvertFrom-Json
 $migrationFiles=@(Get-ChildItem supabase/migrations/*.sql | Sort-Object Name)
 if($migrationFiles.Count -ne 6 -or @(Compare-Object @($expected.migrationHashes.file) @($migrationFiles.Name)).Count -ne 0){throw 'EXACT_SIX_MIGRATIONS_REQUIRED'}
 $env:PGCLIENTENCODING='UTF8';$env:PGHOSTADDR='127.0.0.1';$env:PGSSLMODE='disable';$env:PGPASSFILE=Join-Path $data 'absent-passfile'
 $output=& (Join-Path $bin 'initdb.exe') -D $data -U postgres -A trust --encoding=UTF8 --locale=C 2>&1
 if($LASTEXITCODE -ne 0){throw 'INITDB_FAILED'}
 Invoke-PgCtl 'start'
 $started=$true
 $psql=Join-Path $bin 'psql.exe'
 $base=@('-X','-w','-h','127.0.0.1','-p','55449','-U','postgres','-v','ON_ERROR_STOP=1','-v','VERBOSITY=sqlstate','-q')
 $output=& $psql @base -d postgres -c "CREATE DATABASE $database" 2>&1
 if($LASTEXITCODE -ne 0){throw 'CREATE_DISPOSABLE_DATABASE_FAILED'}
 $output=& $psql @base -d $database -1 -f supabase/tests/native_auth_shim.sql 2>&1
 if($LASTEXITCODE -ne 0){throw 'NATIVE_AUTH_SHIM_FAILED'}
 foreach($file in $migrationFiles) {
  $output=& $psql @base -d $database -1 -f $file.FullName 2>&1
  if($LASTEXITCODE -ne 0){throw 'DISPOSABLE_MIGRATION_FAILED'}
 }
 $output=& $psql @base -d $database -c "CREATE SCHEMA importer_fixture; CREATE TABLE importer_fixture.guard(token text NOT NULL); INSERT INTO importer_fixture.guard VALUES('$nonce');" 2>&1
 if($LASTEXITCODE -ne 0){throw 'DISPOSABLE_SENTINEL_FAILED'}
 $env:HANLEARN_IMPORT_DATABASE=$database;$env:HANLEARN_IMPORT_NONCE=$nonce;$env:HANLEARN_IMPORT_LOCAL_ONLY='SYNTHETIC_DISPOSABLE'
 if($ProtectedDelivery){ & node --experimental-strip-types scripts/test-protected-delivery.mjs }
 else{ & node --experimental-strip-types scripts/test-pilot-importer-db.mjs }
 if($LASTEXITCODE -ne 0){throw 'LOCAL_IMPORTER_DATABASE_TESTS_FAILED'}
} finally {
 if($started -or (Test-Path -LiteralPath (Join-Path $data 'postmaster.pid'))){try{Invoke-PgCtl 'stop'}catch{Write-Warning 'Check this new fixture cluster shutdown locally.'}}
 foreach($name in $names){[Environment]::SetEnvironmentVariable($name,$saved[$name])}
 Pop-Location
}
