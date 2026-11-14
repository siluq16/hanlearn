#requires -Version 5.1
# Fixed Development target; SELECT-only capture. Password only in transient child environment.
[CmdletBinding()]
param([Security.SecureString]$DatabasePassword,[Security.SecureString]$OwnerAuthEmail,[switch]$NoPrompt,[switch]$SecurityPosture,[switch]$ResolveImportBlockers,
 [string]$PsqlPath='C:\Program Files\PostgreSQL\18\bin\psql.exe',
 [string]$SslRootCert='.local/cloud-preflight/prod-supabase.cer')
$ErrorActionPreference='Stop'
$env:PSModulePath=(Join-Path $PSHOME 'Modules')+';'+$env:PSModulePath
$repo=Split-Path -Parent $PSScriptRoot
$ProjectRef='hhgxrjqkuwdgurphopok'
$PoolerHost='aws-1-ap-southeast-2.pooler.supabase.com'
$postureFile=Join-Path $repo 'supabase/verification/pilot_r3_security_posture.sql'
$postureSha='78f8989ddf71d672c9a23d694d1405e0232c144e55d6ce8298b6af067550b828'
$reportDir=Join-Path $repo '.local/pilot-r3-preflight'
if($ResolveImportBlockers){$reportDir=Join-Path $repo '.local/pilot-r3-blockers'}
$sessionProbe=Join-Path $repo 'supabase/verification/pilot_import_session_probe.sql'
$sessionProbeSha='534b3db397ddab518d6bff48e6772a48bb5d2af4f15be899be7d970c954613e5'
$thresholdProbe=Join-Path $repo 'supabase/verification/pilot_import_threshold_probe.sql'
$thresholdProbeSha='3d4dd47bdad8e92b1467a36abbb8ac8b6416b1c1d3584d638be7822ec45be565'
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
function Invoke-Captured([string]$Executable, [string[]]$Arguments, [string]$InputSql = '',[switch]$SyntheticProbe) {
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
        if($SyntheticProbe){
            $state=if($errorText -match '(?:ERROR|FATAL):\s+([A-Z0-9]{5})'){$Matches[1]}else{$null}
            return [pscustomobject]@{Out=$output;ExitCode=$process.ExitCode;SqlState=$state}
        }
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
 if($SecurityPosture -and (Get-FileHash -LiteralPath $postureFile -Algorithm SHA256).Hash.ToLowerInvariant() -cne $postureSha) { throw 'Read-only security posture SQL hash mismatch. No connection attempted.' }
 if($ResolveImportBlockers -and (Get-FileHash -LiteralPath $sessionProbe -Algorithm SHA256).Hash.ToLowerInvariant() -cne $sessionProbeSha){throw 'Session probe hash mismatch. No connection attempted.'}
 if($ResolveImportBlockers -and (Get-FileHash -LiteralPath $thresholdProbe -Algorithm SHA256).Hash.ToLowerInvariant() -cne $thresholdProbeSha){throw 'Session threshold probe hash mismatch. No connection attempted.'}
 New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
 if($ResolveImportBlockers){
  $sid=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value
  $null=& icacls.exe $reportDir '/inheritance:r' '/grant:r' ('*'+$sid+':(OI)(CI)F') '*S-1-5-18:(OI)(CI)F'
  if($LASTEXITCODE -ne 0){throw 'Private capture ACL setup failed.'}
  foreach($rule in (Get-Acl -LiteralPath $reportDir).Access){if($rule.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value -notin @($sid,'S-1-5-18')){throw 'Private capture ACL rejected.'}}
  $auth=Get-Content -Raw -LiteralPath (Join-Path $repo '.local/acceptance/auth-owner.json') | ConvertFrom-Json
  if($auth.status -ne 'PASS' -or $auth.projectRef -cne $ProjectRef -or $auth.role -ne 'Owner' -or -not @($auth.checks | Where-Object {$_.name -eq 'real-auth-identity' -and $_.status -eq 'PASS'}).Count){throw 'Existing owner Auth evidence missing.'}
  if(-not $OwnerAuthEmail -and (Test-Path -LiteralPath (Join-Path $reportDir 'capture.json'))){
   $old=Get-Content -Raw -LiteralPath (Join-Path $reportDir 'capture.json') | ConvertFrom-Json
   $known=@($old.ownerIdentity.allowlist | Where-Object {$_.owner_reference_match -and $_.confirmed})
   if($old.projectRef -ceq $ProjectRef -and $old.tlsMode -eq 'verify-full' -and $old.ownerIdentified -eq $true -and $known.Count -eq 1){$OwnerAuthEmail=ConvertTo-SecureString -String $known[0].email -AsPlainText -Force}
  }
  if(-not $OwnerAuthEmail){if($NoPrompt){throw 'Owner identity reference required.'};$OwnerAuthEmail=Read-Host 'Email of the previously Auth-verified owner (hidden)' -AsSecureString}
 }
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
 if($ResolveImportBlockers){
  $emailPtr=[IntPtr]::Zero
  try{
   $emailPtr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($OwnerAuthEmail)
   $email=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($emailPtr).Trim()
   if($email.Length -gt 254 -or $email -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$'){throw 'Owner email reference invalid.'}
   $encodedEmail=[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($email))
  }finally{if($emailPtr -ne [IntPtr]::Zero){[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($emailPtr)};$email=$null}
  $identitySql=@"
BEGIN READ ONLY;
SET LOCAL statement_timeout='15s';
SELECT jsonb_build_object('identity',jsonb_build_object('database',current_database(),'role',current_user,'read_only',current_setting('transaction_read_only')),
 'owner_matches',(SELECT count(*) FROM auth.users WHERE lower(email)=lower(convert_from(decode('$encodedEmail','base64'),'UTF8'))),
 'allowlist',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',u.id,'email',u.email,'confirmed',u.email_confirmed_at IS NOT NULL,
 'owner_reference_match',lower(u.email)=lower(convert_from(decode('$encodedEmail','base64'),'UTF8')),
 'created_at',u.created_at,'provider',u.raw_app_meta_data->>'provider',
 'has_profile',EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=u.id),
 'progress_rows',(SELECT count(*) FROM public.lesson_progress p WHERE p.user_id=u.id),
 'quiz_attempt_rows',(SELECT count(*) FROM public.quiz_attempts a WHERE a.user_id=u.id),
 'srs_card_rows',(SELECT count(*) FROM public.review_cards c WHERE c.user_id=u.id)) ORDER BY u.created_at),'[]'::jsonb)
 FROM private.allowed_learners a JOIN auth.users u ON u.id=a.user_id));
ROLLBACK;
"@
  $result=Invoke-Captured $PsqlPath @('-X','-w','-A','-t','-q','-v','ON_ERROR_STOP=1','-P','pager=off','-f','-') $identitySql
  $identity=$result.Out.Trim() | ConvertFrom-Json
  if($identity.identity.database -ne 'postgres' -or $identity.identity.role -ne 'postgres' -or $identity.identity.read_only -ne 'on'){throw 'Owner capture identity mismatch.'}
  $report['ownerIdentity']=$identity
  $report['ownerReferenceBasis']='Owner-supplied reference email for previously verified Auth account; auth summary intentionally has no persisted UUID/email. No new login performed.'
  $report['ownerIdentified']=($identity.owner_matches -eq 1 -and @($identity.allowlist | Where-Object {$_.owner_reference_match -and $_.confirmed}).Count -eq 1)
  $probe=Invoke-Captured $PsqlPath @('-X','-w','-A','-t','-q','-v','ON_ERROR_STOP=1','-P','pager=off','-f',$sessionProbe) '' -SyntheticProbe
  $stages=@($probe.Out.Trim() -split '\r?\n' | Where-Object {$_ -match '^\{'} | ForEach-Object {$_ | ConvertFrom-Json})
  $strictAttempt=[ordered]@{sqlState=$probe.SqlState;exitCode=$probe.ExitCode;stages=$stages}
  $probeKind='STRICT_SETTINGS';$selectedProbe=$sessionProbe;$selectedSha=$sessionProbeSha
  if($probe.SqlState -ceq '42501'){
   # Supported session-only alternative: PostgreSQL LOG/ERROR/FATAL are below PANIC.
   # No permission failure is hidden; the strict attempt is retained in private capture.
   $probeKind='SESSION_MESSAGE_THRESHOLD';$selectedProbe=$thresholdProbe;$selectedSha=$thresholdProbeSha
   $probe=Invoke-Captured $PsqlPath @('-X','-w','-A','-t','-q','-v','ON_ERROR_STOP=1','-P','pager=off','-f',$thresholdProbe) '' -SyntheticProbe
   $stages=@($probe.Out.Trim() -split '\r?\n' | Where-Object {$_ -match '^\{'} | ForEach-Object {$_ | ConvertFrom-Json})
  }
  $guard=@($stages | Where-Object {$_.stage -eq 'guard_verified'})
  $bind=@($stages | Where-Object {$_.stage -eq 'bind_canary'})
  $safe=($probe.ExitCode -eq 3 -and $probe.SqlState -ceq '22P02' -and $guard.Count -eq 1 -and $guard[0].logging_guard_pass -eq $true -and $guard[0].read_only -eq 'on' -and $bind.Count -eq 1 -and $bind[0].bound_text -eq $true -and $bind[0].pid -eq $guard[0].pid -and $guard[0].pid -eq $stages[0].pid)
  if((Get-FileHash -LiteralPath $sessionProbe -Algorithm SHA256).Hash.ToLowerInvariant() -cne $sessionProbeSha){throw 'Session probe changed during execution.'}
  if((Get-FileHash -LiteralPath $selectedProbe -Algorithm SHA256).Hash.ToLowerInvariant() -cne $selectedSha){throw 'Selected probe changed during execution.'}
  $report['tlsMode']='verify-full';$report['sessionProbeSha256']=$selectedSha;$report['sessionProbeKind']=$probeKind
  $report['sessionProbe']=[ordered]@{status=$(if($safe){'SAFE_SESSION_GUARD_VERIFIED'}else{'BLOCKED'});exitCode=$probe.ExitCode;sqlState=$probe.SqlState;stages=$stages;strictAttempt=$strictAttempt;lastStage=$(if($stages.Count){$stages[-1].stage}else{'NONE'});limits=@('Synthetic only; no real keys or writes.','No provider/pooler log search performed.','Import must run identical safeguards before keys on its own physical connection.')}
  $report['status']='BLOCKERS_CAPTURED'
  Write-Host ('Owner identified: '+$report.ownerIdentified+'; allowlist count: '+@($identity.allowlist).Count+'; session logging: '+$report.sessionProbe.status)
  Write-Host 'Private identities saved only in ignored restricted .local/pilot-r3-blockers/capture.json. No allowlist change or import executed.'
  return
 }
 $readArguments=@('-X','-w','-A','-t','-q','-v','ON_ERROR_STOP=1','-P','pager=off','-f',(Join-Path $repo 'supabase/verification/pilot_r3_readonly_preflight.sql'))
 if($SecurityPosture){$readArguments+=@('-f',$postureFile)}
 $result=Invoke-Captured $PsqlPath $readArguments
 foreach($property in $audit.sqlHashes.PSObject.Properties) {
  if((Get-FileHash -LiteralPath (Join-Path $repo $property.Name) -Algorithm SHA256).Hash.ToLowerInvariant() -cne $property.Value) { throw 'Audited SQL changed during capture.' }
 }
 $frames=@($result.Out.Trim() -split '\r?\n' | Where-Object {$_} | ForEach-Object { $_ | ConvertFrom-Json })
 $expectedFrames=if($SecurityPosture){7}else{6}
 if($frames.Count -ne $expectedFrames -or $frames[0].identity.database -ne 'postgres' -or $frames[0].identity.role -ne 'postgres' -or $frames[0].identity.read_only -ne 'on') { throw 'Capture identity/shape failed; no result accepted.' }
 if($SecurityPosture){
  if((Get-FileHash -LiteralPath $postureFile -Algorithm SHA256).Hash.ToLowerInvariant() -cne $postureSha -or $frames[-1].security_posture.read_only -ne 'on' -or $frames[-1].security_posture.role -ne 'postgres'){throw 'Read-only security posture capture rejected.'}
  $report['securityPostureSqlHash']=$postureSha
  $report['securityPosture']=$frames[-1].security_posture
  $report['securityPostureReview']='REQUIRED: match actual owner, inspect logging/pooler and HTTP private exposure; counts alone are not approval.'
 }
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
 if($OwnerAuthEmail) { $OwnerAuthEmail.Dispose() }
 New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
 $report | ConvertTo-Json -Depth 30 | Set-Content -Encoding utf8 -LiteralPath (Join-Path $reportDir 'capture.json')
}
if($report.status -ne 'CAPTURED_REVIEW_REQUIRED') { exit 2 }
Push-Location -LiteralPath $repo
try {
 & node scripts/pilot-r3-preflight.mjs --review
 if($LASTEXITCODE -ne 0) { exit 2 }
} finally { Pop-Location }
