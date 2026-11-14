#requires -Version 5.1
[CmdletBinding()]
param([ValidateSet('Owner','Outsider','LearnerB')][string]$Role='Owner',[switch]$ReadOnlyCatalog)
$ErrorActionPreference='Stop'
$repo=Split-Path -Parent $PSScriptRoot
$email=$null; $password=$null; $emailPtr=[IntPtr]::Zero; $passwordPtr=[IntPtr]::Zero
$process=[Diagnostics.Process]::new()
try {
    $email=Read-Host ($Role+' Auth email (hidden local input)') -AsSecureString
    $password=Read-Host ($Role+' Auth password (hidden local input)') -AsSecureString
    if(-not $email.Length -or -not $password.Length) { throw 'Empty credentials.' }
    $start=[Diagnostics.ProcessStartInfo]::new()
    $start.FileName=(Get-Command node -ErrorAction Stop).Source
    $start.Arguments='--experimental-strip-types scripts/acceptance-auth.mjs'
    $start.WorkingDirectory=$repo; $start.UseShellExecute=$false; $start.CreateNoWindow=$true
    $start.RedirectStandardOutput=$true; $start.RedirectStandardError=$true
    foreach($name in @($start.EnvironmentVariables.Keys)) {
        if($name -match '^HANLEARN_TEST_|^PG|SECRET|TOKEN|PASSWORD|DEBUG') { $start.EnvironmentVariables.Remove($name) | Out-Null }
    }
    $emailPtr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($email)
    $passwordPtr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
    $start.EnvironmentVariables['HANLEARN_ACCEPTANCE_EMAIL']=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($emailPtr)
    $start.EnvironmentVariables['HANLEARN_ACCEPTANCE_PASSWORD']=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPtr)
    $start.EnvironmentVariables['HANLEARN_ACCEPTANCE_ROLE']=$Role
    if($ReadOnlyCatalog){$start.EnvironmentVariables['HANLEARN_ACCEPTANCE_MODE']='CATALOG_READ'}
    $process.StartInfo=$start; $process.Start() | Out-Null
    $out=$process.StandardOutput.ReadToEndAsync(); $err=$process.StandardError.ReadToEndAsync()
    if(-not $process.WaitForExit(600000)) { $process.Kill(); throw 'Acceptance timeout. Check ignored safe result only.' }
    $safeOutput=$out.GetAwaiter().GetResult(); $null=$err.GetAwaiter().GetResult()
    try {
        $summary=$safeOutput.Trim() | ConvertFrom-Json
        if(@('PASS','FAIL','BLOCKED') -contains $summary.status){Write-Host ('Acceptance '+$Role+': '+$summary.status+' ('+[int]$summary.checks+' checks).')}
    }catch{Write-Host 'Safe summary unavailable; inspect the ignored result file.'}
    $prefix=if($ReadOnlyCatalog){'live-read-'}else{'auth-'}
    Write-Host ('Acceptance finished for '+$Role+'. Review .local/acceptance/'+$prefix+$Role.ToLower()+'.json; no credentials printed.')
    if($process.ExitCode -ne 0) { exit 2 }
} catch { Write-Host 'BLOCKED: local Auth acceptance could not finish. No raw diagnostics printed.'; exit 2 }
finally {
    if($start) { $start.EnvironmentVariables.Remove('HANLEARN_ACCEPTANCE_EMAIL') | Out-Null; $start.EnvironmentVariables.Remove('HANLEARN_ACCEPTANCE_PASSWORD') | Out-Null }
    if($emailPtr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($emailPtr) }
    if($passwordPtr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPtr) }
    if($email) { $email.Dispose() }; if($password) { $password.Dispose() }; $process.Dispose()
}
