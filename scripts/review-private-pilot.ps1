# Local Windows viewer only. No DB/network/export or human-approval writes.
[CmdletBinding()]
param([switch]$PrepareOnly)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
try {
    $repo = Split-Path -Parent $PSScriptRoot
    $root = Join-Path $repo 'content/pilot-hsk1/v1'
    $privateDir = Join-Path $repo '.local/pilot-hsk1/v1/private'
    $privateFile = Join-Path $privateDir 'answers.json'
    function Read-LocalJson([string]$file) {
        return (Get-Content -LiteralPath $file -Raw -Encoding UTF8 | ConvertFrom-Json)
    }
    function Hash-File([string]$file) {
        return (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLowerInvariant()
    }
    $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value
    if (-not (Get-Acl -LiteralPath $privateDir).AreAccessRulesProtected) { throw 'ACL' }
    foreach ($file in @($privateDir, $privateFile, (Join-Path $privateDir 'author.mjs'))) {
        if (((Get-Item -LiteralPath $file).Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'Reparse point' }
        $rules = @((Get-Acl -LiteralPath $file).Access)
        if ($rules.Count -eq 0) { throw 'No ACL' }
        foreach ($rule in $rules) {
            $sid = $rule.IdentityReference.Translate([System.Security.Principal.SecurityIdentifier]).Value
            if ($sid -ne $identity -and $sid -ne 'S-1-5-18') { throw 'ACL' }
        }
    }
    $manifest = Read-LocalJson (Join-Path $root 'manifest.json')
    if ($manifest.draft_revision -isnot [int] -or $manifest.draft_revision -lt 2) { throw 'Revision' }
    $snapshotFile = Join-Path $repo ('docs/human-review/pilot-hsk1-r{0}/SOURCE_SNAPSHOT.json' -f $manifest.draft_revision)
    $snapshot = Read-LocalJson $snapshotFile
    if ($snapshot.draft_revision -ne $manifest.draft_revision -or
        $manifest.import_authorized -ne $false -or $manifest.publish_authorized -ne $false) { throw 'Revision' }
    $expected = @('manifest.json', 'vocabulary.json', 'grammar.json', 'rights-manifest.json')
    foreach ($i in 1..4) { $expected += ('lessons/lesson-0{0}.json' -f $i); $expected += ('quizzes/lesson-0{0}.json' -f $i) }
    if (@($snapshot.files).Count -ne 12 -or @($snapshot.files.path | Select-Object -Unique).Count -ne 12) { throw 'Snapshot set' }
    foreach ($file in $snapshot.files) {
        if ($expected -notcontains [string]$file.path) { throw 'Path' }
        $full = Join-Path $root $file.path
        if (((Get-Item -LiteralPath $full).Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0 -or
            (Hash-File $full) -ne $file.sha256) { throw 'Source changed' }
    }
    if ((Hash-File (Join-Path $root 'manifest.json')) -ne $snapshot.manifest_sha256) { throw 'Manifest' }
    $canonical = ConvertTo-Json -InputObject @($snapshot.files | ForEach-Object { [ordered]@{path=[string]$_.path;sha256=[string]$_.sha256} }) -Compress
    $hasher = [Security.Cryptography.SHA256]::Create()
    try { $digest = -join ($hasher.ComputeHash([Text.Encoding]::UTF8.GetBytes($canonical)) | ForEach-Object { $_.ToString('x2') }) } finally { $hasher.Dispose() }
    if ($digest -ne $snapshot.package_snapshot_sha256) { throw 'Snapshot digest' }
    $privateInitialHash = Hash-File $privateFile
    $answers = Read-LocalJson $privateFile
    if ((Hash-File $privateFile) -ne $privateInitialHash) { throw 'Private source changed' }
    if ($answers.package_revision -ne $manifest.draft_revision -or $answers.package_id -ne $manifest.package_id -or
        $answers.review_state -ne 'pending_review' -or $null -ne $answers.human_reviewer -or
        $null -ne $answers.human_reviewed_at -or @($answers.keys).Count -ne 24 -or
        @($answers.keys.question_id | Select-Object -Unique).Count -ne 24 -or
        @($answers.quiz_bindings).Count -ne 4 -or @($answers.quiz_bindings.quiz_id | Select-Object -Unique).Count -ne 4) { throw 'Private revision' }
    $items = New-Object 'System.Collections.Generic.List[object]'
    foreach ($i in 1..4) {
        $file = 'quizzes/lesson-0{0}.json' -f $i
        $quiz = Read-LocalJson (Join-Path $root $file)
        $binding = @($answers.quiz_bindings | Where-Object { $_.quiz_id -eq $quiz.quiz.id })
        if ($binding.Count -ne 1 -or $binding[0].revision -ne $quiz.quiz.revision -or
            $binding[0].public_sha256 -ne (Hash-File (Join-Path $root $file))) { throw 'Private binding' }
        foreach ($question in $quiz.questions) {
            $key = @($answers.keys | Where-Object { $_.question_id -eq $question.id })
            if ($key.Count -ne 1 -or $key[0].correct_index -isnot [int] -or
                $key[0].correct_index -lt 0 -or $key[0].correct_index -ge @($question.choices).Count -or
                [string]::IsNullOrWhiteSpace($key[0].explanation_vi)) { throw 'Private coverage' }
            $items.Add([PSCustomObject]@{Label=('L{0}-Q{1} / {2}' -f $i,$question.sort_order,$question.id);Question=$question;Key=$key[0]})
        }
    }
    if ($items.Count -ne 24 -or @($items | ForEach-Object {$_.Question.id} | Select-Object -Unique).Count -ne 24) { throw 'Question coverage' }
    if ($PrepareOnly) {
        Write-Output 'PASS: local snapshot/ACL/private bindings; 24 questions. No private values displayed; human review PENDING.'
        exit 0
    }
    if ([Threading.Thread]::CurrentThread.ApartmentState -ne 'STA') { throw 'STA required' }
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    $form = New-Object Windows.Forms.Form
    $form.Text = ('HanLearn private review - LOCAL ONLY - revision {0}' -f $manifest.draft_revision)
    $form.Size = New-Object Drawing.Size(1000,750)
    $form.StartPosition = 'CenterScreen'
    $notice = New-Object Windows.Forms.Label
    $notice.Text = 'Authorized local review only. No recording, screen sharing, copy or export. Close when finished.'
    $notice.SetBounds(16,12,950,35)
    $ack = New-Object Windows.Forms.CheckBox
    $ack.Text = 'Authority has been confirmed separately; I am reviewing privately on this machine.'
    $ack.SetBounds(16,50,950,30)
    $choice = New-Object Windows.Forms.ComboBox
    $choice.DropDownStyle = 'DropDownList'
    $choice.SetBounds(16,90,950,30)
    $choice.Enabled = $false
    foreach ($item in $items) { [void]$choice.Items.Add($item.Label) }
    $box = New-Object Windows.Forms.TextBox
    $box.Multiline = $true; $box.ReadOnly = $true; $box.ScrollBars = 'Vertical'
    $box.ShortcutsEnabled = $false
    $box.ContextMenuStrip = New-Object Windows.Forms.ContextMenuStrip
    $box.Font = New-Object Drawing.Font('Microsoft YaHei',12)
    $box.SetBounds(16,132,950,560)
    $ack.Add_CheckedChanged({ $choice.Enabled = $ack.Checked; if (-not $ack.Checked) {$box.Clear();$choice.SelectedIndex=-1} })
    $choice.Add_SelectedIndexChanged({
        if (-not $ack.Checked -or $choice.SelectedIndex -lt 0) { return }
        if ((Hash-File $privateFile) -ne $privateInitialHash) {
            $box.Clear()
            [void][Windows.Forms.MessageBox]::Show('BLOCKED: private store changed. Close and revalidate; do not sign this session.')
            $form.Close()
            return
        }
        $item = $items[$choice.SelectedIndex]
        $lines = @($item.Label, '', [string]$item.Question.prompt, '')
        for ($j=0; $j -lt $item.Question.choices.Count; $j++) { $lines += ('{0}. {1}' -f [char](65+$j),$item.Question.choices[$j]) }
        $lines += ''
        $lines += ('PRIVATE - intended choice: {0}' -f [char](65+$item.Key.correct_index))
        $lines += ''
        $lines += 'PRIVATE - explanation:'
        $lines += [string]$item.Key.explanation_vi
        $box.Text = $lines -join [Environment]::NewLine
    })
    $form.Controls.AddRange(@($notice,$ack,$choice,$box))
    try { [void]$form.ShowDialog() } finally { $box.Clear();$form.Dispose();$items.Clear();$answers=$null }
    if ((Hash-File $privateFile) -ne $privateInitialHash) { throw 'Private source changed' }
    Write-Output 'Closed local viewer. No decisions saved; human review remains PENDING.'
} catch {
    Write-Output 'BLOCKED: private viewer checks failed. Values suppressed; check local ACL, source snapshot, bindings and STA mode.'
    exit 2
}
