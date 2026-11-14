#requires -Version 5.1
param([switch]$Setup)
$ErrorActionPreference='Stop'
$repo=Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $repo
$admin=$null;$database=$null;$p=$null
try {
 if(-not $Setup){& node --experimental-strip-types scripts/test-development-learning.mjs;exit $LASTEXITCODE}
 $admin=Read-Host 'Development secret/service-role API key (hidden; setup only)' -AsSecureString
 $database=Read-Host 'Development database password (hidden; setup only)' -AsSecureString
 if(-not $admin.Length -or -not $database.Length){throw 'Empty credential'}
 $start=[Diagnostics.ProcessStartInfo]::new()
 $start.FileName=(Get-Command node).Source;$start.Arguments='--experimental-strip-types scripts/development.mjs --setup'
 $start.WorkingDirectory=$repo;$start.UseShellExecute=$false;$start.CreateNoWindow=$true
 $start.RedirectStandardInput=$true;$start.RedirectStandardOutput=$true;$start.RedirectStandardError=$true
 foreach($key in @($start.EnvironmentVariables.Keys)){if($key -match '^PG|SECRET|TOKEN|PASSWORD|DEBUG'){$start.EnvironmentVariables.Remove($key) | Out-Null}}
 $p=[Diagnostics.Process]::new();$p.StartInfo=$start
 $encoding=[Console]::InputEncoding
 try{[Console]::InputEncoding=[Text.UTF8Encoding]::new($false);$null=$p.Start()}finally{[Console]::InputEncoding=$encoding}
 $output=$p.StandardOutput.ReadToEndAsync();$errors=$p.StandardError.ReadToEndAsync()
 $a=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($admin);$d=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($database)
 try{$payload=@{adminKey=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($a);databasePassword=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($d)} | ConvertTo-Json -Compress}
 finally{[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($a);[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($d)}
 $bytes=[Text.Encoding]::UTF8.GetBytes($payload);$payload=$null
 try{$p.StandardInput.BaseStream.Write($bytes,0,$bytes.Length);$p.StandardInput.BaseStream.Close()}finally{[Array]::Clear($bytes,0,$bytes.Length)}
 if(-not $p.WaitForExit(120000)){$p.Kill();throw 'Setup outcome requires inspection; do not create another account'}
 $safe=$output.GetAwaiter().GetResult();$null=$errors.GetAwaiter().GetResult()
 $result=$safe.Trim() | ConvertFrom-Json
 [ordered]@{status=$result.status;code=$result.code;existingLearnersChanged=$result.existingLearnersChanged} | ConvertTo-Json -Compress
 if($p.ExitCode -ne 0){exit 2}
 & node --experimental-strip-types scripts/test-development-learning.mjs
 exit $LASTEXITCODE
}catch{Write-Host 'DEVELOPMENT_SETUP_STOPPED; diagnostics suppressed. No automatic retry or account deletion.';exit 2}
finally{if($admin){$admin.Dispose()};if($database){$database.Dispose()};if($p){$p.Dispose()};Pop-Location}
