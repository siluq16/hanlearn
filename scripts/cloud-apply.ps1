#requires -Version 5.1
[CmdletBinding()]
param(
    [switch]$ApplyApprovedSix,
    [Security.SecureString]$DatabasePassword,
    [switch]$NoPrompt,
    [string]$PsqlPath='C:\Program Files\PostgreSQL\18\bin\psql.exe',
    [string]$SslRootCert='.local/cloud-preflight/prod-supabase.cer'
)
$ErrorActionPreference='Stop'
$ProjectRef='hhgxrjqkuwdgurphopok'
$PoolerHost='aws-1-ap-southeast-2.pooler.supabase.com'
$repo=Split-Path -Parent $PSScriptRoot
$reportDir=Join-Path $repo '.local/cloud-apply'
$script:applyGate=$false
$report=[ordered]@{projectRef=$ProjectRef;precheck='BLOCKED';apply='NOT_RUN';verification='NOT_RUN';conclusion='BLOCKED';reason=$null}
$approved=[ordered]@{
    '202611120001_catalog.sql'='A2454231EFE7334EA6B2B9417D4EDDD8143E47BB8B0367EAE8C6CBFC3868B154'
    '202611120002_srs.sql'='8C88E6D1158B4E9455E146F9B910AB2C51A22625D713631A4A9F8AEACF6650F8'
    '202611120003_quiz.sql'='D80152B6BC2B27874D3D2B196449BB0D6A43584EF16EA26E027EF038F01B8C7C'
    '202611120004_plans_sessions.sql'='3D7E11CDC230E6C0577ACC905261BC2DDCB168FFD8615E8DDF795A13C083EDDF'
    '202611120005_learner_access.sql'='3912E078FB61936342B1BB3423DD34028D04AFC9C91766F4F6F6AC10DD4CB26C'
    '202611120006_catalog_queries.sql'='14201CAE8A6823A43A621B55953B5610C631B628F1FE73E59F1BDD49934A7FC7'
}
function Save-ApplyReport {
    New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
    $report | ConvertTo-Json -Depth 30 | Set-Content -Encoding utf8 -LiteralPath (Join-Path $reportDir 'result.json')
}
function Assert-ApprovedFiles {
    $files=@(Get-ChildItem (Join-Path $repo 'supabase/migrations/*.sql') | Sort-Object Name)
    if(($files.Name -join ',') -cne (($approved.Keys | Sort-Object) -join ',')) { throw 'Migration filename set differs from the approved six.' }
    foreach($file in $files) { if((Get-FileHash -Algorithm SHA256 -LiteralPath $file.FullName).Hash -cne $approved[$file.Name]) { throw ('Approved migration hash changed: '+$file.Name) } }
}
function ConvertTo-NativeArgument([string]$Value) {
    # Windows CommandLineToArgvW quoting; no shell, expansion, or credential args.
    $quoted='"'; $slashes=0
    foreach($character in $Value.ToCharArray()) {
        if($character -eq '\') { $slashes++; continue }
        if($character -eq '"') { $quoted+=('\' * (2*$slashes+1))+'"' }
        else { $quoted+=('\' * $slashes)+$character }
        $slashes=0
    }
    return $quoted+('\' * (2*$slashes))+'"'
}
function Invoke-Captured([string]$Executable, [string[]]$Arguments, [string]$InputSql = '', [switch]$Cli, [switch]$MigrationWrite) {
    $start = [Diagnostics.ProcessStartInfo]::new()
    $start.FileName=$Executable; $start.WorkingDirectory=$repo; $start.UseShellExecute=$false
    $start.RedirectStandardInput=$true; $start.RedirectStandardOutput=$true; $start.RedirectStandardError=$true
    $start.CreateNoWindow=$true
    $start.Arguments=($Arguments | ForEach-Object { ConvertTo-NativeArgument $_ }) -join ' '
    foreach($key in @($start.EnvironmentVariables.Keys)) {
        if($key -match '^PG' -or $key -in @('SUPABASE_DB_PASSWORD','SUPABASE_ACCESS_TOKEN','SUPABASE_YES','NODE_DEBUG','DEBUG')) { $start.EnvironmentVariables.Remove($key) | Out-Null }
    }
    $start.EnvironmentVariables['PGHOST']=$PoolerHost
    $start.EnvironmentVariables['PGHOSTADDR']=$script:ipv4
    $start.EnvironmentVariables['PGPORT']='5432'; $start.EnvironmentVariables['PGDATABASE']='postgres'
    $start.EnvironmentVariables['PGUSER']='postgres.'+$ProjectRef
    $start.EnvironmentVariables['PGSSLMODE']='verify-full'; $start.EnvironmentVariables['PGSSLROOTCERT']=$SslRootCert
    # CLI uses Node's trusted roots when no CA path is supplied; libpq supports the
    # special 'system' value, while CLI treats sslrootcert as a file path.
    if($Cli -and $SslRootCert -eq 'system') { $start.EnvironmentVariables.Remove('PGSSLROOTCERT') | Out-Null }
    $start.EnvironmentVariables['PGCONNECT_TIMEOUT']='15'
    if($MigrationWrite) {
        $allowed=@('db','push',"--remote=$script:writeTarget",'--skip-vault','--yes','--agent=yes')
        if(-not $script:applyGate -or (($Arguments -join '|') -cne ($allowed -join '|'))) { throw 'Unapproved write command rejected.' }
    } else { $start.EnvironmentVariables['PGOPTIONS']='-c default_transaction_read_only=on' }
    $start.EnvironmentVariables['DO_NOT_TRACK']='1'; $start.EnvironmentVariables['NO_COLOR']='1'
    $ptr=[IntPtr]::Zero; $process=[Diagnostics.Process]::new()
    try {
        $ptr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($DatabasePassword)
        $start.EnvironmentVariables['PGPASSWORD']=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
        $process.StartInfo=$start
        $process.Start() | Out-Null
        $stdout=$process.StandardOutput.ReadToEndAsync(); $stderr=$process.StandardError.ReadToEndAsync()
        if($InputSql) { $process.StandardInput.Write($InputSql) }
        $process.StandardInput.Close()
        if(-not $process.WaitForExit(300000)) { $process.Kill(); throw 'Connection/command timeout; raw output suppressed.' }
        $output=$stdout.GetAwaiter().GetResult(); $errorText=$stderr.GetAwaiter().GetResult()
        if($process.ExitCode -ne 0) {
            $kind = if($errorText -match 'certificate|SSL|TLS|root.crt') {'TLS verification failed; provide the trusted CA with -SslRootCert. No downgrade attempted.'}
                elseif($errorText -match 'password authentication|28P01|no password') {'Database authentication failed. Re-enter the password only at the secure local prompt.'}
                elseif($errorText -match '403|privileges') {'Cloud endpoint denied access (403).'}
                elseif($errorText -match 'read.only|25006') {'The command attempted a write and was blocked by database READ ONLY.'}
                elseif($errorText -match 'config|workspace') {'CLI workspace/configuration missing or invalid.'}
                else {'Connection/SQL/CLI command failed; raw output suppressed to protect credentials.'}
            throw $kind
        }
        return [pscustomobject]@{ Out=$output; Err=$errorText }
    } finally {
        $start.EnvironmentVariables.Remove('PGPASSWORD') | Out-Null
        if($ptr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
        $process.Dispose()
    }
}
function Invoke-ReadOnlySql([string]$Sql) {
    $wrapped="BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;`nSET LOCAL lock_timeout='5s';`nSET LOCAL statement_timeout='30s';`nSET LOCAL search_path=pg_catalog;`n$Sql`nROLLBACK;`n"
    $result=Invoke-Captured $PsqlPath @('-X','-w','-A','-t','-q','-v','ON_ERROR_STOP=1','-P','pager=off') $wrapped
    try { return $result.Out.Trim() | ConvertFrom-Json }
    catch { throw 'Unexpected preflight result format; raw output suppressed.' }
}
function Read-MigrationHistory {
    $state=Invoke-ReadOnlySql "select json_build_object('present',to_regclass('supabase_migrations.schema_migrations') is not null);"
    if(-not $state.present) { return }
    $rows=Invoke-ReadOnlySql "select coalesce(json_agg(json_build_object('version',version,'name',name) order by version),'[]'::json) from supabase_migrations.schema_migrations;"
    # PowerShell 5.1 ConvertFrom-Json may preserve the JSON array as one pipeline
    # object. Emit each row explicitly so history/report counts remain accurate.
    foreach($row in $rows) { Write-Output $row }
}
try {
    if(-not $ApplyApprovedSix) { throw 'Explicit execution flag -ApplyApprovedSix required; existing approval covers only the pinned six migrations.' }
    Assert-ApprovedFiles
    $baselinePath=Join-Path $repo '.local/cloud-preflight/result.json'
    $baseline=Get-Content -Raw -LiteralPath $baselinePath | ConvertFrom-Json
    if($baseline.projectRef -cne $ProjectRef -or $baseline.preflight -ne 'PASS' -or $baseline.dryRun -ne 'PASS' -or @($baseline.remoteVersions).Count) { throw 'Approved preflight baseline missing, changed, or not PASS.' }
    foreach($entry in $baseline.migrationHashes) { if(-not $approved.Contains($entry.file) -or $approved[$entry.file] -cne $entry.sha256) { throw 'Preflight hash differs from approval.' } }
    if(@($baseline.migrationHashes).Count -ne 6) { throw 'Preflight must pin six hashes.' }
    $expectedPath=Join-Path $repo 'supabase/verification/expected_schema.json'
    if((Get-FileHash -Algorithm SHA256 -LiteralPath $expectedPath).Hash -cne '0117A7924AB3AC85B06F5FCBDCDE328D5C1D8405B8D182B27EA66B162AFBABCA') { throw 'Verification reference changed; review before apply.' }
    $urlLine=Get-Content -LiteralPath (Join-Path $repo '.env.local') | Where-Object {$_ -match '^\s*NEXT_PUBLIC_SUPABASE_URL\s*='} | Select-Object -First 1
    $publicUrl=[uri](($urlLine -split '=',2)[1].Trim().Trim('"').Trim("'"))
    if($publicUrl.Scheme -ne 'https' -or $publicUrl.Host -cne ($ProjectRef+'.supabase.co') -or $publicUrl.UserInfo) { throw 'Public URL does not match approved Development project.' }
    if(-not [IO.Path]::IsPathRooted($SslRootCert)) { $SslRootCert=Join-Path $repo $SslRootCert }
    if(-not (Test-Path -LiteralPath $SslRootCert) -or -not (Test-Path -LiteralPath $PsqlPath)) { throw 'Trusted CA or psql missing.' }
    $script:ipv4=([Net.Dns]::GetHostAddresses($PoolerHost) | Where-Object AddressFamily -eq InterNetwork | Select-Object -First 1).IPAddressToString
    if(-not $script:ipv4) { throw 'IPv4 Session Pooler resolution failed.' }
    $package=Get-Content -Raw -LiteralPath (Join-Path $repo 'node_modules/supabase/package.json') | ConvertFrom-Json
    if($package.version -cne '3.1.0') { throw 'Expected pinned CLI v3.1.0.' }
    $suffix=if($env:PROCESSOR_ARCHITECTURE -eq 'ARM64'){'windows-arm64'}else{'windows-x64'}
    $cli=Join-Path $repo "node_modules/@supabase/cli-$suffix/bin/supabase.exe"
    if(-not (Test-Path -LiteralPath $cli)) { throw 'Pinned CLI executable missing.' }
    New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
    Write-Host ('Approved target/files verified: '+$ProjectRef+' (six unchanged migrations).')
    if(-not $DatabasePassword) {
        if($NoPrompt) { throw 'Secure local database credential required. No Cloud action taken.' }
        $DatabasePassword=Read-Host 'Development DB password (secure local input only)' -AsSecureString
    }
    if(-not $DatabasePassword.Length) { throw 'Empty credential.' }
    $report['precheck']='RUNNING'
    $identity=Invoke-ReadOnlySql "select json_build_object('database',current_database(),'role',current_user,'read_only',current_setting('transaction_read_only'),'project_ref_setting',nullif(current_setting('supabase.project_ref',true),''));"
    $report['identity']=$identity
    if($identity.database -ne 'postgres' -or $identity.role -ne 'postgres' -or $identity.read_only -ne 'on' -or ($identity.project_ref_setting -and $identity.project_ref_setting -cne $ProjectRef)) { throw 'Fresh backend identity/read-only assertion failed.' }
    $snapshot=Invoke-ReadOnlySql (Get-Content -Raw -LiteralPath (Join-Path $repo 'supabase/verification/cloud_preflight.sql'))
    if(@($snapshot.relation_conflicts).Count -or @($snapshot.function_conflicts).Count -or @($snapshot.private_objects).Count -or @($snapshot.functions | Where-Object schema -eq 'private').Count -or -not $snapshot.private_schema_manageable) { throw 'Fresh schema differs from approved empty baseline.' }
    foreach($p in $snapshot.prerequisites.PSObject.Properties) { if($p.Value -ne $true) { throw ('Missing fresh prerequisite: '+$p.Name) } }
    $before=@(Read-MigrationHistory)
    $report['historyBefore']=$before
    if($before.Count) { throw 'Remote history changed unexpectedly. STOP: apply not attempted.' }
    $readTarget='postgresql://postgres.'+$ProjectRef+'@'+$PoolerHost+':5432/postgres?sslmode=verify-full&options=-c%20default_transaction_read_only%3Don'
    $listed=Invoke-Captured $cli @('migration','list',"--remote=$readTarget",'--agent=yes') '' -Cli
    $listText=$listed.Out+[Environment]::NewLine+$listed.Err
    foreach($name in $approved.Keys) { if($listText -notmatch [regex]::Escape(($name -split '_',2)[0])) { throw 'Fresh migration list differs.' } }
    $dry=Invoke-Captured $cli @('db','push',"--remote=$readTarget",'--dry-run','--skip-vault','--agent=yes') '' -Cli
    $dryText=$dry.Out+[Environment]::NewLine+$dry.Err
    $planned=@([regex]::Matches($dryText,'\b[0-9]{12,14}_[A-Za-z0-9_]+\.sql') | ForEach-Object Value | Sort-Object -Unique)
    if(($planned -join ',') -cne (($approved.Keys | Sort-Object) -join ',') -or $dryText -notmatch 'DRY RUN|"dryRun"\s*:\s*true') { throw 'Fresh dry-run plan differs from approval.' }
    $report['plannedMigrations']=$planned
    # Last history/hash checks immediately before the single authorized write command.
    Assert-ApprovedFiles
    $immediate=@(Read-MigrationHistory)
    if($immediate.Count) { throw 'Remote history changed immediately before apply. STOP.' }
    $report['precheck']='PASS'; $report['apply']='RUNNING'
    Save-ApplyReport
    $script:writeTarget='postgresql://postgres.'+$ProjectRef+'@'+$PoolerHost+':5432/postgres?sslmode=verify-full'
    $script:applyGate=$true
    Write-Host 'Applying exactly the approved six via CLI db push --skip-vault. No seed/custom roles.'
    $applied=Invoke-Captured $cli @('db','push',"--remote=$script:writeTarget",'--skip-vault','--yes','--agent=yes') '' -Cli -MigrationWrite
    $script:applyGate=$false
    $report['apply']='PASS'; $report['verification']='RUNNING'
    $after=@(Read-MigrationHistory)
    $report['historyAfter']=$after
    $expectedVersions=@($approved.Keys | ForEach-Object {($_ -split '_',2)[0]} | Sort-Object)
    if((@($after.version) -join ',') -cne ($expectedVersions -join ',')) { throw 'Post-apply history does not exactly match the approved six. No repair attempted.' }
    $report['migrationResults']=@($after | ForEach-Object { @{version=$_.version;name=$_.name;status='PASS'} })
    $manifest=Invoke-ReadOnlySql (Get-Content -Raw -LiteralPath (Join-Path $repo 'supabase/verification/cloud_schema_manifest.sql'))
    $manifest | ConvertTo-Json -Depth 30 | Set-Content -Encoding utf8 -LiteralPath (Join-Path $reportDir 'schema.json')
    $node=(Get-Command node -ErrorAction Stop).Source
    Push-Location -LiteralPath $repo
    try {
        & $node scripts/verify-schema.mjs
        $schemaExit=$LASTEXITCODE
        $report['schemaVerification']=Get-Content -Raw -LiteralPath (Join-Path $reportDir 'schema-verification.json') | ConvertFrom-Json
        if($schemaExit -ne 0) { throw 'Schema catalog differs from the reviewed native reference. No manual repair attempted.' }
        & $node scripts/check-private-api.mjs
        $apiExit=$LASTEXITCODE
        $report['privateApi']=Get-Content -Raw -LiteralPath (Join-Path $reportDir 'private-api.json') | ConvertFrom-Json
        if($apiExit -ne 0) { throw 'Private Data API exposure not verified. No configuration changed.' }
    } finally { Pop-Location }
    $report['verification']='PASS'; $report['conclusion']='MIGRATED_AND_VERIFIED'
    Write-Host 'PASS six migrations + read-only catalog/private API verification. STOP: no user, allowlist entry, content or Sprint 2 work created.'
} catch {
    $script:applyGate=$false
    foreach($stage in @('precheck','apply','verification')) { if($report[$stage] -eq 'RUNNING') { $report[$stage]='FAIL' } }
    $safe=$_.Exception.Message
    if($safe -match 'postgres(?:ql)?://|sb_secret_|sbp_|password=') { $safe='Potentially sensitive diagnostic suppressed.' }
    $report['reason']=$safe
    # Read-only status after a failed apply, never retry or repair.
    if($report.apply -eq 'FAIL' -and $DatabasePassword) {
        try { $report['historyAfter']=@(Read-MigrationHistory) } catch { $report['historyReadback']='UNAVAILABLE' }
    }
    Write-Host ('STOPPED: '+$safe)
} finally {
    if($DatabasePassword) { $DatabasePassword.Dispose() }
    Save-ApplyReport
}
if($report.conclusion -ne 'MIGRATED_AND_VERIFIED') { exit 2 }
