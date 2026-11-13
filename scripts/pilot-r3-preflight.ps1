#requires -Version 5.1
# Fixed Development target; SELECT-only capture. Password only in transient child environment.
[CmdletBinding()]
param([Security.SecureString]$DatabasePassword,[switch]$NoPrompt,
 [string]$PsqlPath='C:\Program Files\PostgreSQL\18\bin\psql.exe',
 [string]$SslRootCert='.local/cloud-preflight/prod-supabase.cer')
$ErrorActionPreference='Stop'
$repo=Split-Path -Parent $PSScriptRoot
$ProjectRef='hhgxrjqkuwdgurphopok'
$PoolerHost='aws-1-ap-southeast-2.pooler.supabase.com'
$reportDir=Join-Path $repo '.local/pilot-r3-preflight'
$report=[ordered]@{projectRef=$ProjectRef;checkedAt=[DateTime]::UtcNow.ToString('o');status='BLOCKED';reason=$null}
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
function Invoke-Captured([string]$Executable, [string[]]$Arguments, [string]$InputSql = '') {
    $start = [Diagnostics.ProcessStartInfo]::new()
    $start.FileName=$Executable; $start.WorkingDirectory=$repo; $start.UseShellExecute=$false
    $start.RedirectStandardInput=$true; $start.RedirectStandardOutput=$true; $start.RedirectStandardError=$true
    $start.CreateNoWindow=$true
    $start.StandardOutputEncoding=[Text.Encoding]::UTF8
    $start.StandardErrorEncoding=[Text.Encoding]::UTF8
    $start.Arguments=($Arguments | ForEach-Object { ConvertTo-NativeArgument $_ }) -join ' '
    foreach($key in @($start.EnvironmentVariables.Keys)) {
        if($key -match '^PG' -or $key -in @('SUPABASE_DB_PASSWORD','SUPABASE_ACCESS_TOKEN','SUPABASE_YES','NODE_DEBUG','DEBUG')) { $start.EnvironmentVariables.Remove($key) | Out-Null }
    }
    $start.EnvironmentVariables['PGHOST']=$PoolerHost
    $start.EnvironmentVariables['PGHOSTADDR']=$script:ipv4
    $start.EnvironmentVariables['PGPORT']='5432'; $start.EnvironmentVariables['PGDATABASE']='postgres'
    $start.EnvironmentVariables['PGUSER']='postgres.'+$ProjectRef
    $start.EnvironmentVariables['PGSSLMODE']='verify-full'; $start.EnvironmentVariables['PGSSLROOTCERT']=$SslRootCert
    $start.EnvironmentVariables['PGCONNECT_TIMEOUT']='15'
    $start.EnvironmentVariables['PGOPTIONS']='-c default_transaction_read_only=on -c search_path=pg_catalog'
    $start.EnvironmentVariables['PGCLIENTENCODING']='UTF8'
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

try {
 Push-Location -LiteralPath $repo
 try {
  $auditText=& node scripts/pilot-r3-preflight.mjs --audit
  if($LASTEXITCODE -ne 0) { throw 'Local package/SQL audit failed. No connection attempted.' }
  $audit=$auditText | ConvertFrom-Json
 } finally { Pop-Location }
 if($audit.status -ne 'PASS' -or $audit.projectRef -ne $ProjectRef) { throw 'Local audit identity failed.' }
 $urlLine=Get-Content -LiteralPath (Join-Path $repo '.env.local') | Where-Object {$_ -match '^\s*NEXT_PUBLIC_SUPABASE_URL\s*='} | Select-Object -First 1
 $publicUrl=[uri](($urlLine -split '=',2)[1].Trim().Trim('"').Trim("'"))
 if($publicUrl.Scheme -ne 'https' -or $publicUrl.Host -cne ($ProjectRef+'.supabase.co') -or $publicUrl.UserInfo -or -not $publicUrl.IsDefaultPort) { throw 'Development public URL mismatch. No connection attempted.' }
 if(-not [IO.Path]::IsPathRooted($SslRootCert)) { $SslRootCert=Join-Path $repo $SslRootCert }
 if(-not (Test-Path -LiteralPath $SslRootCert) -or -not (Test-Path -LiteralPath $PsqlPath)) { throw 'Trusted project CA or psql missing. No TLS downgrade.' }
 New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
 if(-not $DatabasePassword) {
  if($NoPrompt) { throw 'Secure local database credential required. No Cloud connection attempted.' }
  $DatabasePassword=Read-Host 'Development DB password (secure local input only)' -AsSecureString
 }
 if(-not $DatabasePassword.Length) { throw 'Empty credential. No connection attempted.' }
 $script:ipv4=([Net.Dns]::GetHostAddresses($PoolerHost) | Where-Object AddressFamily -eq InterNetwork | Select-Object -First 1).IPAddressToString
 if(-not $script:ipv4) { throw 'IPv4 Session Pooler resolution failed.' }
 foreach($property in $audit.sqlHashes.PSObject.Properties) {
  if((Get-FileHash -LiteralPath (Join-Path $repo $property.Name) -Algorithm SHA256).Hash.ToLowerInvariant() -cne $property.Value) { throw 'Audited SQL changed before connection.' }
 }
 $result=Invoke-Captured $PsqlPath @('-X','-w','-A','-t','-q','-v','ON_ERROR_STOP=1','-P','pager=off','-f',(Join-Path $repo 'supabase/verification/pilot_r3_readonly_preflight.sql'))
 foreach($property in $audit.sqlHashes.PSObject.Properties) {
  if((Get-FileHash -LiteralPath (Join-Path $repo $property.Name) -Algorithm SHA256).Hash.ToLowerInvariant() -cne $property.Value) { throw 'Audited SQL changed during capture.' }
 }
 $frames=@($result.Out.Trim() -split '\r?\n' | Where-Object {$_} | ForEach-Object { $_ | ConvertFrom-Json })
 if($frames.Count -ne 6 -or $frames[0].identity.database -ne 'postgres' -or $frames[0].identity.role -ne 'postgres' -or $frames[0].identity.read_only -ne 'on') { throw 'Capture identity/shape failed; no result accepted.' }
 $resultFile=Join-Path $reportDir 'result.txt'
 [IO.File]::WriteAllText($resultFile,$result.Out,(New-Object Text.UTF8Encoding($false)))
 $report['resultSha256']=(Get-FileHash -LiteralPath $resultFile -Algorithm SHA256).Hash.ToLowerInvariant()
 $report['audit']=$audit
 $report['tlsMode']='verify-full'
 $report['status']='CAPTURED_REVIEW_REQUIRED'
 Write-Host 'CAPTURED: fixed Development READ ONLY SQL finished. Metadata/collision review required; no import authorized.'
} catch {
 # Do not print raw native errors, connection parameters or exception values.
 $report['reason']='Configuration, credential, TLS or SQL verification failed. Stop; no wider retry or Cloud fix.'
 $safeReasons=@(
  'Local package/SQL audit failed. No connection attempted.',
  'Local audit identity failed.',
  'Development public URL mismatch. No connection attempted.',
  'Trusted project CA or psql missing. No TLS downgrade.',
  'Secure local database credential required. No Cloud connection attempted.',
  'Empty credential. No connection attempted.',
  'IPv4 Session Pooler resolution failed.',
  'Audited SQL changed before connection.',
  'Audited SQL changed during capture.',
  'Capture identity/shape failed; no result accepted.',
  'TLS verification failed; provide the trusted CA with -SslRootCert. No downgrade attempted.',
  'Database authentication failed. Re-enter the password only at the secure local prompt.',
  'The command attempted a write and was blocked by database READ ONLY.',
  'Connection/SQL/CLI command failed; raw output suppressed to protect credentials.',
  'Connection/command timeout; raw output suppressed.'
 )
 if($safeReasons -ccontains $_.Exception.Message) { $report['reason']=$_.Exception.Message }
 if($NoPrompt -and -not $DatabasePassword) { $report['reason']='Secure local database credential required. No Cloud connection attempted.' }
 Write-Host ('BLOCKED: '+$report.reason)
} finally {
 if($DatabasePassword) { $DatabasePassword.Dispose() }
 New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
 $report | ConvertTo-Json -Depth 30 | Set-Content -Encoding utf8 -LiteralPath (Join-Path $reportDir 'capture.json')
}
if($report.status -ne 'CAPTURED_REVIEW_REQUIRED') { exit 2 }
Push-Location -LiteralPath $repo
try {
 & node scripts/pilot-r3-preflight.mjs --review
 if($LASTEXITCODE -ne 0) { exit 2 }
} finally { Pop-Location }
