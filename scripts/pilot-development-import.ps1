#requires -Version 5.1
# Default is an offline plan. Apply switch must only be used AFTER explicit write approval.
[CmdletBinding()]
param([switch]$ApplyApprovedInvitePilot)
$ErrorActionPreference='Stop'
$repo=Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $repo
$secret=$null;$ptr=[IntPtr]::Zero;$process=$null
$phase='CREDENTIAL_PROMPT';$credentialDelivered=$false
function Start-OperatorProcess([Diagnostics.Process]$Child) {
 # .NET Framework has no StandardInputEncoding property. Process.Start captures
 # Console.InputEncoding and can emit its BOM before the first stdin write.
 $previousEncoding=[Console]::InputEncoding
 try{[Console]::InputEncoding=New-Object Text.UTF8Encoding($false);$null=$Child.Start()}
 finally{[Console]::InputEncoding=$previousEncoding}
}
function Write-OperatorInput([IO.Stream]$Stream,[string]$Json) {
 # Bypass Console.InputEncoding / StreamWriter preambles (Windows terminals vary).
 $bytes=(New-Object Text.UTF8Encoding($false)).GetBytes($Json)
 try{$Stream.Write($bytes,0,$bytes.Length);$Stream.Flush()}
 finally{[Array]::Clear($bytes,0,$bytes.Length);$Stream.Close()}
}
try{
 if(-not $ApplyApprovedInvitePilot){& node --experimental-strip-types scripts/pilot-development-import.mjs --preview;exit $LASTEXITCODE}
 $secret=Read-Host 'Approved Development import DB password (hidden)' -AsSecureString
 if(-not $secret.Length){throw 'Empty credential'}
 $phase='RESOLVE_IPV4'
 $ipv4=([Net.Dns]::GetHostAddresses('aws-1-ap-southeast-2.pooler.supabase.com') | Where-Object AddressFamily -eq InterNetwork | Select-Object -First 1).IPAddressToString
 if(-not $ipv4){throw 'IPv4 required'}
 $start=[Diagnostics.ProcessStartInfo]::new()
 $start.FileName=(Get-Command node).Source
 $start.Arguments='--experimental-strip-types scripts/pilot-development-import.mjs --apply-approved-invite'
 $start.WorkingDirectory=$repo;$start.UseShellExecute=$false;$start.CreateNoWindow=$true
 $start.RedirectStandardInput=$true;$start.RedirectStandardOutput=$true;$start.RedirectStandardError=$true
 foreach($key in @($start.EnvironmentVariables.Keys)){if($key -match '^PG|^SUPABASE_|^DEBUG$|^NODE_DEBUG$'){$start.EnvironmentVariables.Remove($key) | Out-Null}}
 $phase='START_OPERATOR'
 $process=[Diagnostics.Process]::new();$process.StartInfo=$start;Start-OperatorProcess $process
 $out=$process.StandardOutput.ReadToEndAsync();$err=$process.StandardError.ReadToEndAsync()
 $ptr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
 $payload=@{password=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr);ipv4=$ipv4} | ConvertTo-Json -Compress
 $phase='DELIVER_CREDENTIAL'
 Write-OperatorInput $process.StandardInput.BaseStream $payload
 $payload=$null;$credentialDelivered=$true
 $phase='WAIT_OPERATOR'
 if(-not $process.WaitForExit(300000)){$process.Kill();throw 'Outcome requires read-only verification'}
 $safe=$out.GetAwaiter().GetResult();$null=$err.GetAwaiter().GetResult()
 $phase='READ_SAFE_RECEIPT'
 if([string]::IsNullOrWhiteSpace($safe)){throw 'No safe child receipt; outcome unknown'}
 $receipts=@()
 foreach($line in ($safe -split '\r?\n' | Where-Object {$_})){
  $r=$line | ConvertFrom-Json
  # Explicit output projection; never echo raw child diagnostics or arbitrary fields.
  $receipt=[ordered]@{status=$r.status;stage=$r.stage;code=$r.code;draftCommitted=$r.draftCommitted;committedKeys=$r.committedKeys;publicRows=$r.publicRows;promotedEntities=$r.promotedEntities;verifiedRlsReaders=$r.verifiedRlsReaders}
  $receipts+=,$receipt
  $receipt | ConvertTo-Json -Compress
 }
 $resultDirectory=Join-Path $repo '.local/pilot-r3-development-import'
 $null=New-Item -ItemType Directory -Force -Path $resultDirectory
 $receipts | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $resultDirectory ('result-'+[guid]::NewGuid().ToString('N')+'.json')) -Encoding UTF8
 if($process.ExitCode -ne 0){exit 2}
}catch{
 $status=if($credentialDelivered){'STOP_VERIFY_OUTCOME'}else{'BLOCKED_BEFORE_WRITE'}
 $failure=[ordered]@{status=$status;stage=$phase;code='OPERATOR_WRAPPER_FAILED';errorType=$_.Exception.GetType().Name;automaticRetry=$false}
 $failure | ConvertTo-Json -Compress | Write-Host
 try{
  $resultDirectory=Join-Path $repo '.local/pilot-r3-development-import'
  $null=New-Item -ItemType Directory -Force -Path $resultDirectory
  $failure | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $resultDirectory ('result-'+[guid]::NewGuid().ToString('N')+'.json')) -Encoding UTF8
 }catch{Write-Host 'SAFE_RECEIPT_SAVE_FAILED; retain the sanitized status above.'}
 exit 2
}
finally{
 if($ptr -ne [IntPtr]::Zero){[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)}
 if($secret){$secret.Dispose()};if($process){$process.Dispose()};Pop-Location
}
