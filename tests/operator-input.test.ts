import { expect, it } from "vitest";
import { spawnSync } from "node:child_process";

it.skipIf(process.platform !== "win32")(
  "delivers synthetic JSON as UTF-8 even when the terminal uses UTF-16",
  () => {
    // Extract only the actual transport function; never execute the operator entry.
    const script = `
$ErrorActionPreference='Stop'
$ast=[Management.Automation.Language.Parser]::ParseFile((Join-Path (Get-Location) 'scripts/pilot-development-import.ps1'),[ref]$null,[ref]$null)
foreach($name in @('Write-OperatorInput','Start-OperatorProcess')){
 $fn=$ast.Find({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst] -and $n.Name -eq $name},$true)
 if(-not $fn){throw 'Missing transport'}
 Invoke-Expression $fn.Extent.Text
}
[Console]::InputEncoding=[Text.Encoding]::Unicode
$payload='{"password":"synthetic-测试","ipv4":"127.0.0.1"}'
$code="let b=[];process.stdin.on('data',x=>b.push(x));process.stdin.on('end',()=>{let s=Buffer.concat(b).toString('utf8');let ok=false;try{let j=JSON.parse(s);ok=j.password==='synthetic-测试'&&j.ipv4==='127.0.0.1'}catch{}console.log(JSON.stringify({valid:ok}))})"
foreach($mode in @('legacy','utf8')){
 $start=[Diagnostics.ProcessStartInfo]::new()
 $start.FileName=(Get-Command node).Source
 $start.Arguments='-e "'+$code+'"'
 $start.UseShellExecute=$false;$start.CreateNoWindow=$true
 $start.RedirectStandardInput=$true;$start.RedirectStandardOutput=$true
 $p=[Diagnostics.Process]::new();$p.StartInfo=$start
 if($mode -eq 'legacy'){$null=$p.Start()}else{Start-OperatorProcess $p}
 if($mode -eq 'legacy'){$p.StandardInput.Write($payload);$p.StandardInput.Close()}
 else{Write-OperatorInput $p.StandardInput.BaseStream $payload}
 $p.StandardOutput.ReadToEnd();$p.WaitForExit();$p.Dispose()
}
`;
    const result = spawnSync(
      "powershell",
      [
        "-NoProfile",
        "-EncodedCommand",
        Buffer.from(script, "utf16le").toString("base64"),
      ],
      { encoding: "utf8", windowsHide: true, timeout: 15000 },
    );
    expect(result.status).toBe(0);
    expect(
      result.stdout
        .trim()
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => JSON.parse(line)),
    ).toEqual([{ valid: false }, { valid: true }]);
  },
);
