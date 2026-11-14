#requires -Version 5.1
# Internal pipe-only DPAPI storage for the dedicated test account, never learners.
param([ValidateSet('Read','Write')][string]$Operation,[switch]$Fixture)
$ErrorActionPreference='Stop'
$phase='PIPE'
try {
 if($env:HANLEARN_INTERNAL_SESSION_PIPE -ne '1' -or -not [Console]::IsOutputRedirected){throw 'Internal pipe required'}
 $env:PSModulePath=(Join-Path $PSHOME 'Modules')+';'+$env:PSModulePath
 Add-Type -AssemblyName System.Security
 $directory=Join-Path (Split-Path -Parent $PSScriptRoot) '.local/development'
 if($Fixture){$directory=Join-Path (Split-Path -Parent $PSScriptRoot) '.local/development-store-fixture'}
 $file=Join-Path $directory 'test-account.dpapi'
 $sid=[Security.Principal.WindowsIdentity]::GetCurrent().User
 $system=[Security.Principal.SecurityIdentifier]::new('S-1-5-18')
 function Protect-Path([string]$Path,[bool]$IsDirectory) {
  # Change only the DACL, preserving owner/SACL; Set-Acl may request SeSecurityPrivilege.
  $rights=if($IsDirectory){'(OI)(CI)F'}else{'F'}
  $null=& icacls.exe $Path '/inheritance:r' '/grant:r' ('*'+$sid.Value+':'+$rights) ('*'+$system.Value+':'+$rights) 2>&1
  if($LASTEXITCODE -ne 0){throw 'Private ACL setup failed'}
 }
 if($Operation -eq 'Write'){
  $phase='DIRECTORY_ACL'
  if(-not [Console]::IsInputRedirected){throw 'Input pipe required'}
  $null=New-Item -ItemType Directory -Force -Path $directory
  Protect-Path $directory $true
 }
 foreach($path in @($directory,$file)){
  $phase='CHECK_ACL'
  if(Test-Path -LiteralPath $path){
   if((Get-Item -LiteralPath $path).Attributes -band [IO.FileAttributes]::ReparsePoint){throw 'Reparse path'}
   foreach($rule in (Get-Acl -LiteralPath $path).Access){if($rule.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value -notin @($sid.Value,$system.Value)){throw 'Private ACL required'}}
  }
 }
 if($Operation -eq 'Write'){
  $phase='INPUT'
  $reader=[IO.StreamReader]::new([Console]::OpenStandardInput(),[Text.UTF8Encoding]::new($false))
  $text=$reader.ReadToEnd();if($text.Length -gt 100000 -or -not $text){throw 'Input size'}
  $bytes=[Text.Encoding]::UTF8.GetBytes($text)
  try{$phase='ENCRYPT';$encrypted=[Security.Cryptography.ProtectedData]::Protect($bytes,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser);$phase='WRITE';[IO.File]::WriteAllBytes($file,$encrypted);Protect-Path $file $false}
  finally{[Array]::Clear($bytes,0,$bytes.Length);$text=$null}
  [Console]::Write('{"status":"SAVED"}')
 }else{
  $plain=[Security.Cryptography.ProtectedData]::Unprotect([IO.File]::ReadAllBytes($file),$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)
  try{[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false);[Console]::Write([Text.Encoding]::UTF8.GetString($plain))}
  finally{[Array]::Clear($plain,0,$plain.Length)}
 }
}catch{[Console]::Error.WriteLine('DEVELOPMENT_SESSION_'+$phase+'_'+$_.Exception.GetType().Name);exit 2}
