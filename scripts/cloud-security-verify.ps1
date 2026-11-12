#requires -Version 5.1
[CmdletBinding()]
param([Security.SecureString]$DatabasePassword,[switch]$NoPrompt,
 [string]$PsqlPath='C:\Program Files\PostgreSQL\18\bin\psql.exe',
 [string]$SslRootCert='.local/cloud-preflight/prod-supabase.cer')
$ErrorActionPreference='Stop'
$repo=Split-Path -Parent $PSScriptRoot
$ProjectRef='hhgxrjqkuwdgurphopok'
$PoolerHost='aws-1-ap-southeast-2.pooler.supabase.com'
$reportDir=Join-Path $repo '.local/cloud-security'
$report=[ordered]@{projectRef=$ProjectRef;status='BLOCKED';reason=$null}
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

try {
 $urlLine=Get-Content -LiteralPath (Join-Path $repo '.env.local') | Where-Object {$_ -match '^\s*NEXT_PUBLIC_SUPABASE_URL\s*='} | Select-Object -First 1
 $publicUrl=[uri](($urlLine -split '=',2)[1].Trim().Trim('"').Trim("'"))
 if($publicUrl.Scheme -ne 'https' -or $publicUrl.Host -cne ($ProjectRef+'.supabase.co') -or $publicUrl.UserInfo) { throw 'Development public URL mismatch.' }
 if(-not [IO.Path]::IsPathRooted($SslRootCert)) { $SslRootCert=Join-Path $repo $SslRootCert }
 if(-not (Test-Path -LiteralPath $SslRootCert) -or -not (Test-Path -LiteralPath $PsqlPath)) { throw 'Trusted CA or psql missing.' }
 $script:ipv4=([Net.Dns]::GetHostAddresses($PoolerHost) | Where-Object AddressFamily -eq InterNetwork | Select-Object -First 1).IPAddressToString
 if(-not $script:ipv4) { throw 'IPv4 Session Pooler resolution failed.' }
 New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
 if(-not $DatabasePassword) {
  if($NoPrompt) { throw 'Secure local database credential required. No Cloud action taken.' }
  $DatabasePassword=Read-Host 'Development DB password (secure local input only)' -AsSecureString
 }
 if(-not $DatabasePassword.Length) { throw 'Empty credential.' }
 $identity=Invoke-ReadOnlySql "select json_build_object('database',current_database(),'role',current_user,'read_only',current_setting('transaction_read_only'));"
 if($identity.database -ne 'postgres' -or $identity.role -ne 'postgres' -or $identity.read_only -ne 'on') { throw 'Backend identity/read-only assertion failed.' }
 $report['identity']=$identity
 $platform=Invoke-ReadOnlySql (Get-Content -Raw -LiteralPath (Join-Path $repo 'supabase/verification/cloud_platform_security.sql'))
 $platform | ConvertTo-Json -Depth 40 | Set-Content -Encoding utf8 -LiteralPath (Join-Path $reportDir 'platform.json')
 $manifest=Invoke-ReadOnlySql (Get-Content -Raw -LiteralPath (Join-Path $repo 'supabase/verification/cloud_schema_manifest.sql'))
 $manifest | ConvertTo-Json -Depth 40 | Set-Content -Encoding utf8 -LiteralPath (Join-Path $reportDir 'schema.json')
 $report['status']='CAPTURED_REVIEW_REQUIRED'
 Write-Host 'PASS read-only catalog/body/event-trigger capture. No database changes. Local review required.'
} catch {
 $safe=$_.Exception.Message
 if($safe -match 'postgres(?:ql)?://|sb_secret_|sbp_|password=') { $safe='Potentially sensitive diagnostic suppressed.' }
 $report['reason']=$safe
 Write-Host ('BLOCKED: '+$safe)
} finally {
 if($DatabasePassword) { $DatabasePassword.Dispose() }
 New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
 $report | ConvertTo-Json -Depth 30 | Set-Content -Encoding utf8 -LiteralPath (Join-Path $reportDir 'capture.json')
}
if($report.status -ne 'CAPTURED_REVIEW_REQUIRED') { exit 2 }
