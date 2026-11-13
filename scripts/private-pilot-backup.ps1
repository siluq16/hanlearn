#requires -Version 5.1
# Local only. Passwords are entered directly into 7-Zip's native hidden prompts.
[CmdletBinding()]
param([switch]$NoPrompt,[switch]$VerifyExisting)
$ErrorActionPreference='Stop'
$repo=Split-Path -Parent $PSScriptRoot
$approvedBackupRoot='D:\nam4\prj\backup'
$sevenZip='D:\Program\7-Zip\7z.exe'
$privateRoot=Join-Path $repo '.local/pilot-hsk1/v1/private'
$resultPath=Join-Path $repo '.local/pilot-hsk1/private-backup-result.json'
$result=[ordered]@{status='BACKUP_PENDING';checkedAt=[DateTime]::UtcNow.ToString('o');backupRoot=$approvedBackupRoot;archive=$null;sourceFiles=0;matchedFiles=0;privateFiles=0;encryptedHeader=$false;cleanup='NOT_CREATED';reason=$null}
function Assert-PlainPath([string]$path) {
 $item=Get-Item -LiteralPath $path -Force
 while($item) {
  if(($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'REPARSE' }
  if($item -is [IO.DirectoryInfo]) { $item=$item.Parent } else { $item=$item.Directory }
 }
}
function Protect-Directory([string]$path) {
 $owner=[Security.Principal.WindowsIdentity]::GetCurrent().User
 $acl=New-Object Security.AccessControl.DirectorySecurity
 $acl.SetAccessRuleProtection($true,$false)
 $acl.SetOwner($owner)
 foreach($sid in @($owner,(New-Object Security.Principal.SecurityIdentifier('S-1-5-18')))) {
  $acl.AddAccessRule((New-Object Security.AccessControl.FileSystemAccessRule($sid,'FullControl','ContainerInherit,ObjectInherit','None','Allow')))
 }
 Set-Acl -LiteralPath $path -AclObject $acl
 foreach($rule in (Get-Acl -LiteralPath $path).Access) {
  if($rule.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value -notin @($owner.Value,'S-1-5-18')) { throw 'ACL' }
 }
}
function File-Hash([string]$path) { return (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash }
try {
 Assert-PlainPath $privateRoot
 Assert-PlainPath $approvedBackupRoot
 if([IO.Path]::GetFullPath($approvedBackupRoot).TrimEnd('\') -ine 'D:\nam4\prj\backup') { throw 'DESTINATION' }
 if(-not (Test-Path -LiteralPath $sevenZip)) { throw 'SEVENZIP' }
 $existingArchive=$null
 if($VerifyExisting) {
  $previous=Get-Content -LiteralPath $resultPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $existingArchive=[IO.Path]::GetFullPath([string]$previous.archive)
  $archiveParent=Split-Path -Parent $existingArchive
  if((Split-Path -Parent $archiveParent) -ine $approvedBackupRoot -or
     (Split-Path -Leaf $archiveParent) -notmatch '^hanlearn-pilot-r3-[a-f0-9]{32}$' -or
     (Split-Path -Leaf $existingArchive) -cne 'private-pilot-r3.7z') { throw 'DESTINATION' }
  Assert-PlainPath $existingArchive
 }
 $result['toolVersion']=(Get-Item -LiteralPath $sevenZip).VersionInfo.FileVersion
 Push-Location -LiteralPath $repo
 try {
  $null=& node scripts/pilot-r3-preflight.mjs --audit
  if($LASTEXITCODE -ne 0) { throw 'FREEZE' }
 } finally { Pop-Location }
 $identity=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value
 if(-not (Get-Acl -LiteralPath $privateRoot).AreAccessRulesProtected) { throw 'ACL' }
 $privateFiles=@(Get-ChildItem -LiteralPath $privateRoot -Force -File)
 if($privateFiles.Count -ne 11 -or @(Get-ChildItem -LiteralPath $privateRoot -Force -Directory).Count -ne 0) { throw 'SOURCE_SET' }
 foreach($entry in @((Get-Item -LiteralPath $privateRoot))+$privateFiles) {
  Assert-PlainPath $entry.FullName
  foreach($rule in (Get-Acl -LiteralPath $entry.FullName).Access) {
   if($rule.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value -notin @($identity,'S-1-5-18')) { throw 'ACL' }
  }
 }
 $sourceRoot='content/pilot-hsk1/v1/'
 $snapshot=Get-Content -LiteralPath (Join-Path $repo 'docs/human-review/pilot-hsk1-r3/SOURCE_SNAPSHOT.json') -Raw -Encoding UTF8 | ConvertFrom-Json
 $sources=@($privateFiles | ForEach-Object {'.local/pilot-hsk1/v1/private/'+$_.Name})
 $sources+=@($snapshot.files | ForEach-Object {$sourceRoot+$_.path})
 $sources+=@('content/pilot-hsk1/v1/README.md','content/pilot-hsk1/v1/REVIEW_CHECKLIST.md',
  'docs/human-review/pilot-hsk1-r3/SOURCE_SNAPSHOT.json',
  'docs/human-review/pilot-hsk1-r3/REVIEW_REGISTER.template.json',
  'docs/human-review/pilot-hsk1-r3/REVIEW_REGISTER.template.csv',
  '.local/pilot-hsk1/official-syllabus.pdf','.local/pilot-hsk1/source-pages.json')
 if($sources.Count -ne 30 -or @($sources | Select-Object -Unique).Count -ne 30) { throw 'SOURCE_SET' }
 $before=@{}
 foreach($relative in $sources) {
  $original=Join-Path $repo $relative
  Assert-PlainPath $original
  $before[$relative]=File-Hash $original
 }
 $result.sourceFiles=$sources.Count
 $result.privateFiles=$privateFiles.Count
 if($NoPrompt -or -not [Environment]::UserInteractive) { throw 'PROMPT_REQUIRED' }
 $workParent=Join-Path $repo '.local/pilot-backup-r3-work'
 New-Item -ItemType Directory -Force -Path $workParent | Out-Null
 Assert-PlainPath $workParent
 $work=Join-Path $workParent ([Guid]::NewGuid().ToString('N'))
 New-Item -ItemType Directory -Path $work | Out-Null
 Protect-Directory $work
 $payload=Join-Path $work 'payload'
 $restore=Join-Path $work 'restore'
 New-Item -ItemType Directory -Path $payload,$restore | Out-Null
 if(-not $VerifyExisting) {
  foreach($relative in $sources) {
   $copy=Join-Path $payload $relative
   New-Item -ItemType Directory -Force -Path (Split-Path -Parent $copy) | Out-Null
   Copy-Item -LiteralPath (Join-Path $repo $relative) -Destination $copy
   if((File-Hash $copy) -cne $before[$relative]) { throw 'STAGING_COMPARE' }
  }
  $destination=Join-Path $approvedBackupRoot ('hanlearn-pilot-r3-'+[Guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $destination | Out-Null
  Protect-Directory $destination
  $archive=Join-Path $destination 'private-pilot-r3.7z'
  if(Test-Path -LiteralPath $archive) { throw 'EXISTS' }
 } else { $archive=$existingArchive }
 $result.archive=$archive
 $result.cleanup='RETAINED_RESTRICTED'
 Write-Host 'Enter the same backup password at 7-Zip hidden prompts. Never put it in chat/args/files.'
 if(-not $VerifyExisting) {
  Push-Location -LiteralPath $payload
  try {
   & $sevenZip a -t7z -mhe=on -p -bd -bb0 -y $archive '.\*'
   if($LASTEXITCODE -ne 0) { throw 'ARCHIVE_CREATE' }
  } finally { Pop-Location }
 }
 & node (Join-Path $repo 'scripts/private-backup-header.mjs') $archive
 if($LASTEXITCODE -ne 0) { throw 'ENCRYPTION' }
 $result.encryptedHeader=$true
 # For encrypted reads, omit -p entirely: empty -p is treated as an empty password.
 & $sevenZip t -bd -bb0 $archive
 if($LASTEXITCODE -ne 0) { throw 'ARCHIVE_TEST' }
 & $sevenZip x -bd -bb0 -y ('-o'+$restore) $archive
 if($LASTEXITCODE -ne 0) { throw 'ARCHIVE_RESTORE' }
 $restored=@(Get-ChildItem -LiteralPath $restore -File -Recurse -Force)
 if($restored.Count -ne $sources.Count) { throw 'RESTORE_COUNT' }
 foreach($relative in $sources) {
  $original=Join-Path $repo $relative
  $recovered=Join-Path $restore $relative
  Assert-PlainPath $recovered
  if((File-Hash $recovered) -cne $before[$relative] -or (File-Hash $original) -cne $before[$relative]) { throw 'RESTORE_COMPARE' }
  $result.matchedFiles++
 }
 $result.status='BACKUP_VERIFIED'
 # Delete only helper-created plaintext copies after success. Never delete source/archive.
 $resolvedWork=[IO.Path]::GetFullPath($work)
 $resolvedParent=[IO.Path]::GetFullPath($workParent).TrimEnd('\')+'\'
 if(-not $resolvedWork.StartsWith($resolvedParent,[StringComparison]::OrdinalIgnoreCase) -or
    (Split-Path -Parent $resolvedWork) -ine $resolvedParent.TrimEnd('\') -or
    (Split-Path -Leaf $resolvedWork) -notmatch '^[a-f0-9]{32}$') { throw 'CLEANUP_BOUNDARY' }
 try {
  Remove-Item -LiteralPath $resolvedWork -Recurse -Force
  $result.cleanup='REMOVED_HELPER_PLAINTEXT_ONLY'
 } catch { $result.cleanup='RETAINED_RESTRICTED' }
} catch {
 $result.status='BACKUP_PENDING'
 $reason=$_.Exception.Message
 $allowed=@('REPARSE','DESTINATION','SEVENZIP','FREEZE','ACL','SOURCE_SET','PROMPT_REQUIRED','STAGING_COMPARE','EXISTS','ARCHIVE_CREATE','ENCRYPTION','ARCHIVE_TEST','ARCHIVE_RESTORE','RESTORE_COUNT','RESTORE_COMPARE','CLEANUP_BOUNDARY')
 $result.reason=if($allowed -ccontains $reason){$reason}else{'LOCAL_BACKUP_STEP_FAILED_DETAILS_SUPPRESSED'}
} finally {
 # Hash maps stay in this process only; never serialize them.
 $before=$null
 $result | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $resultPath -Encoding UTF8
 Write-Output ($result.status+': files='+$result.sourceFiles+'; matched='+$result.matchedFiles+'; private='+$result.privateFiles+'; reason='+$result.reason)
}
if($result.status -ne 'BACKUP_VERIFIED') { exit 2 }
