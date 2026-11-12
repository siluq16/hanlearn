#requires -Version 5.1
[CmdletBinding()]
param(
    [string]$ProjectRef = 'hhgxrjqkuwdgurphopok',
    [string]$PoolerHost = 'aws-1-ap-southeast-2.pooler.supabase.com',
    [string]$PsqlPath = 'C:\Program Files\PostgreSQL\18\bin\psql.exe',
    [string]$SslRootCert = '.local/cloud-preflight/prod-supabase.cer',
    [Security.SecureString]$DatabasePassword,
    [switch]$NoPrompt
)
$ErrorActionPreference = 'Stop'
$approvedRef = 'hhgxrjqkuwdgurphopok'
$approvedHost = 'aws-1-ap-southeast-2.pooler.supabase.com'
$repo = Split-Path -Parent $PSScriptRoot
$reportDir = Join-Path $repo '.local/cloud-preflight'
$report = [ordered]@{ projectRef=$ProjectRef; host=$PoolerHost; port=5432; preflight='BLOCKED'; migrationList='NOT_RUN'; dryRun='NOT_RUN'; conclusion='BLOCKED'; reason=$null }
$expectedVersions = 1..6 | ForEach-Object { '20261112000' + $_ }

function Save-Report {
    New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
    $report | ConvertTo-Json -Depth 15 | Set-Content -Encoding utf8 -LiteralPath (Join-Path $reportDir 'result.json')
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
function Invoke-Captured([string]$Executable, [string[]]$Arguments, [string]$InputSql = '', [switch]$Cli) {
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
    $start.EnvironmentVariables['PGOPTIONS']='-c default_transaction_read_only=on'
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
        if(-not $process.WaitForExit(60000)) { $process.Kill(); throw 'Connection/command timeout; raw output suppressed.' }
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
    $wrapped="BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;`nSET LOCAL lock_timeout='5s';`nSET LOCAL statement_timeout='30s';`n$Sql`nROLLBACK;`n"
    $result=Invoke-Captured $PsqlPath @('-X','-w','-A','-t','-q','-v','ON_ERROR_STOP=1','-P','pager=off') $wrapped
    try { return $result.Out.Trim() | ConvertFrom-Json }
    catch { throw 'Unexpected preflight result format; raw output suppressed.' }
}
try {
    if($ProjectRef -cne $approvedRef -or $PoolerHost -cne $approvedHost) { throw 'Target differs from the explicitly approved Development project/session pooler.' }
    if(-not (Test-Path -LiteralPath $PsqlPath)) { throw 'psql not found; install PostgreSQL client or supply -PsqlPath.' }
    if($SslRootCert -ne 'system' -and -not [IO.Path]::IsPathRooted($SslRootCert)) { $SslRootCert=Join-Path $repo $SslRootCert }
    if($SslRootCert -ne 'system' -and -not (Test-Path -LiteralPath $SslRootCert)) { throw 'Trusted Supabase CA file missing. Download the Server root certificate from the approved project Dashboard to .local/cloud-preflight/prod-supabase.cer, or supply -SslRootCert.' }
    $envPath=Join-Path $repo '.env.local'
    if(-not (Test-Path -LiteralPath $envPath)) { throw 'Missing .env.local; target cannot be cross-checked.' }
    $urlLine=Get-Content -LiteralPath $envPath | Where-Object { $_ -match '^\s*NEXT_PUBLIC_SUPABASE_URL\s*=' } | Select-Object -First 1
    if(-not $urlLine) { throw 'Missing public project URL for target verification.' }
    $publicUrl=[uri](($urlLine -split '=',2)[1].Trim().Trim('"').Trim("'"))
    if($publicUrl.Scheme -ne 'https' -or $publicUrl.Host -cne ($ProjectRef+'.supabase.co') -or $publicUrl.UserInfo) { throw 'Public project URL does not match the approved Development ref.' }
    $script:ipv4=([Net.Dns]::GetHostAddresses($PoolerHost) | Where-Object AddressFamily -eq InterNetwork | Select-Object -First 1).IPAddressToString
    if(-not $script:ipv4) { throw 'Session Pooler has no resolved IPv4 address.' }
    $files=@(Get-ChildItem (Join-Path $repo 'supabase/migrations/*.sql') | Sort-Object Name)
    $versions=@($files | ForEach-Object { ($_.Name -split '_',2)[0] })
    if(($versions -join ',') -cne ($expectedVersions -join ',')) { throw 'Expected migration set changed. Review the local files before execution.' }
    $report['migrations']=@($files.Name)
    $report['migrationHashes']=@($files | ForEach-Object { @{file=$_.Name;sha256=(Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName).Hash} })
    Write-Host "Verified Development ref, public URL, Session Pooler port 5432 and IPv4 route: $ProjectRef"
    if(-not $DatabasePassword) {
        if($NoPrompt) { throw 'No secure local database credential supplied. Re-run interactively; never paste the password into chat.' }
        $DatabasePassword=Read-Host 'Development database password (secure local input only)' -AsSecureString
    }
    if($DatabasePassword.Length -eq 0) { throw 'No database password supplied.' }
    # Establish a read-only, TLS-verified identity before inspecting any application schema.
    $report['preflight']='RUNNING'
    $identity=Invoke-ReadOnlySql "select json_build_object('database',current_database(),'role',current_user,'read_only',current_setting('transaction_read_only'),'pooler_to_database_ssl',(select ssl from pg_stat_ssl where pid=pg_backend_pid()),'ref',nullif(current_setting('supabase.project_ref',true),''));"
    $report['connectionIdentity']=$identity
    # With a pooler, pg_stat_ssl describes the backend leg, NOT libpq -> pooler.
    # Successful libpq connection with explicit verify-full + the supplied CA is
    # the client TLS guarantee. -X and the controlled PG* environment prevent overrides.
    $report['clientTls']=[ordered]@{ mode='verify-full'; authenticatedConnection=$true; caSha256=if($SslRootCert -eq 'system'){'system'}else{(Get-FileHash -Algorithm SHA256 -LiteralPath $SslRootCert).Hash} }
    $identityFailures=@()
    if($identity.database -ne 'postgres') { $identityFailures+='database' }
    if($identity.role -ne 'postgres') { $identityFailures+='role' }
    if($identity.read_only -ne 'on') { $identityFailures+='read_only' }
    if($identityFailures.Count) { throw ('Database identity assertion failed: '+($identityFailures -join ', ')) }
    if($identity.ref -and $identity.ref -cne $ProjectRef) { throw 'Server project reference mismatch.' }
    $snapshot=Invoke-ReadOnlySql (Get-Content -Raw -LiteralPath (Join-Path $repo 'supabase/verification/cloud_preflight.sql'))
    $report['snapshot']=$snapshot
    if($snapshot.identity.server_version_num -lt 150000 -or $snapshot.identity.transaction_read_only -ne 'on') { throw 'Unsupported server version or READ ONLY assertion failed.' }
    foreach($p in $snapshot.prerequisites.PSObject.Properties) { if($p.Value -ne $true) { throw "Missing prerequisite: $($p.Name)" } }
    $privateFunctions=@($snapshot.functions | Where-Object schema -eq 'private')
    if(@($snapshot.relation_conflicts).Count -or @($snapshot.function_conflicts).Count -or @($snapshot.private_objects).Count -or $privateFunctions.Count -or $snapshot.private_schema_manageable -ne $true) { throw 'Existing application/private objects or schema ownership conflict with the unapplied baseline. No dry-run attempted.' }
    $history=@()
    if($snapshot.migration_history_present) {
        $history=@(Invoke-ReadOnlySql "select coalesce(json_agg(version order by version),'[]'::json) from supabase_migrations.schema_migrations;")
    }
    $report['remoteVersions']=$history
    if($history.Count) { throw 'Remote migration history is no longer empty. Review history before dry-run.' }
    $report['preflight']='PASS'
    Write-Host 'PASS: read-only preflight, prerequisites, empty migration history and no baseline collisions.'
    $suffix=if($env:PROCESSOR_ARCHITECTURE -eq 'ARM64'){'windows-arm64'}else{'windows-x64'}
    $cli=Join-Path $repo "node_modules/@supabase/cli-$suffix/bin/supabase.exe"
    if(-not (Test-Path -LiteralPath $cli)) { throw 'Pinned Supabase CLI missing; run npm ci.' }
    # No colon/password in userinfo: CLI 3.1.0 falls back to child PGPASSWORD.
    # The database startup option enforces READ ONLY even for a CLI implementation regression.
    $target='postgresql://postgres.'+$ProjectRef+'@'+$PoolerHost+':5432/postgres?sslmode=verify-full&options=-c%20default_transaction_read_only%3Don'
    $report['migrationList']='RUNNING'
    $listed=Invoke-Captured $cli @('migration','list',"--remote=$target",'--agent=yes') '' -Cli
    $listText=$listed.Out+"`n"+$listed.Err
    foreach($v in $expectedVersions) { if($listText -notmatch [regex]::Escape($v)) { throw 'CLI migration list does not contain the expected local set.' } }
    $report['migrationList']='PASS'
    $report['dryRun']='RUNNING'
    $dry=Invoke-Captured $cli @('db','push',"--remote=$target",'--dry-run','--skip-vault','--agent=yes') '' -Cli
    $dryText=$dry.Out+"`n"+$dry.Err
    $planned=@([regex]::Matches($dryText,'\b[0-9]{12,14}_[A-Za-z0-9_]+\.sql') | ForEach-Object Value | Sort-Object -Unique)
    if(($planned -join ',') -cne (($files.Name | Sort-Object) -join ',')) { throw 'Dry-run plan differs from the six reviewed migration filenames.' }
    if($dryText -notmatch 'DRY RUN|"dryRun"\s*:\s*true') { throw 'CLI did not confirm dry-run mode.' }
    $report['dryRun']='PASS'; $report['plannedMigrations']=$planned; $report['conclusion']='READY'
    Write-Host 'PASS: dry-run plans exactly the six reviewed migrations. STOP: nothing was applied.'
} catch {
    foreach($stage in @('preflight','migrationList','dryRun')) { if($report[$stage] -eq 'RUNNING') { $report[$stage]='FAIL' } }
    # Only helper-authored diagnostics; never print the native exception/command line or raw output.
    $safe=$_.Exception.Message
    if($safe -match 'postgres(?:ql)?://|sb_secret_|sbp_|password=') { $safe='Command failed; potentially sensitive diagnostic suppressed.' }
    $report['reason']=$safe
    Write-Host "BLOCKED: $safe"
} finally {
    if($DatabasePassword) { $DatabasePassword.Dispose() }
    Save-Report
}
if($report.conclusion -ne 'READY') { exit 2 }
