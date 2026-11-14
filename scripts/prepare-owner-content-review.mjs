// Offline public-only reader. No server, private store, authorization or publication writes.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import {
  loadPilot,
  syntheticDelivery,
  validateImport,
} from "./pilot-r3-importer.mjs";

const packet = "docs/human-review/pilot-hsk1-r3/";
const sources = [
  ["catalog", "Curriculum và nguồn", packet + "CATALOG_AND_RIGHTS.md"],
  ["vocabulary", "44 từ vựng", packet + "VOCABULARY.md"],
  ["grammar", "12 điểm ngữ pháp", packet + "GRAMMAR.md"],
  ["lessons", "4 bài / 29 sections", packet + "LESSONS.md"],
  ["quizzes", "4 quiz / 24 câu công khai", packet + "QUIZZES.md"],
  ["ai", "Báo cáo AI hỗ trợ", "docs/HANLEARN_HSK1_R3_CONTENT_REVIEW.md"],
];
export function escapeText(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
// Limited plain-text Markdown presentation; never executes HTML, links or embedded media.
export function renderDocument(text) {
  let table = false;
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    if (line.trim().startsWith("|")) {
      if (!table) {
        out.push('<div class="table"><table>');
        table = true;
      }
      const cells = line
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|");
      if (cells.every((c) => /^\s*:?-+:?\s*$/.test(c))) continue;
      out.push(
        "<tr>" +
          cells.map((c) => "<td>" + escapeText(c.trim()) + "</td>").join("") +
          "</tr>",
      );
      continue;
    }
    if (table) {
      out.push("</table></div>");
      table = false;
    }
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading)
      out.push(
        `<h${heading[1].length}>${escapeText(heading[2])}</h${heading[1].length}>`,
      );
    else if (line.trim()) out.push("<p>" + escapeText(line) + "</p>");
  }
  if (table) out.push("</table></div>");
  return out.join("\n");
}
export function buildOwnerReviewPage() {
  const pkg = loadPilot();
  validateImport(pkg, syntheticDelivery(pkg));
  const snapshot = JSON.parse(
    fs.readFileSync(packet + "SOURCE_SNAPSHOT.json", "utf8"),
  );
  const docs = sources.map(([id, title, filename]) => {
    const bytes = fs.readFileSync(filename);
    return {
      id,
      title,
      filename,
      sha: createHash("sha256").update(bytes).digest("hex"),
      text: bytes.toString("utf8"),
    };
  });
  const groups = [
    "curriculum",
    "vocabulary",
    "grammar",
    "lessons",
    "quizzes",
    "questions",
  ];
  const script = `const notes=[];
const form=document.querySelector('form'), result=document.querySelector('#result');
document.querySelector('#now').onclick=()=>{form.elements.when.value=new Date().toISOString()};
form.onsubmit=e=>{e.preventDefault();
 const group=form.elements.group.value, scope=form.elements.scope.value.trim(), when=form.elements.when.value.trim();
 if(!scope||!form.elements.seen.checked||!/(Z|[+-]\\d{2}:\\d{2})$/.test(when)||!Number.isFinite(Date.parse(when))||Date.parse(when)>Date.now()){
 result.textContent='Chưa ghi: nhập phạm vi đã thực sự xem, thời điểm ISO8601 có múi giờ không ở tương lai và xác nhận đã xem.';return;}
 const line=group+' | '+scope+' | '+when+' | VIEWED_NOT_APPROVED';
 notes.push(line); const li=document.createElement('li');li.textContent=line;document.querySelector('#notes').append(li);
 result.textContent='Đã ghi trong bộ nhớ trang; chưa lưu bền vững, chưa approve hoặc cập nhật overlay.';
 form.elements.seen.checked=false;form.elements.scope.value='';form.elements.when.value='';};
document.querySelector('#download').onclick=()=>{
 if(!notes.length){result.textContent='Chưa có ghi nhận để tải.';return;}
 const header=document.querySelector('#binding').textContent;
 const blob=new Blob([header+'\\nOwner viewing notes only; not publication approval or independent language certification.\\n'+notes.join('\\n')],{type:'text/plain;charset=utf-8'});
 const url=URL.createObjectURL(blob), a=document.createElement('a');a.href=url;a.download='hanlearn-r3-owner-viewing-notes.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};`;
  const scriptSha = createHash("sha256").update(script).digest("base64");
  return `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-${scriptSha}'; style-src 'unsafe-inline'; connect-src 'none'; img-src 'none'; form-action 'none'; base-uri 'none'">
<title>HanLearn — Owner content review r3 offline</title><style>
body{font:17px/1.7 system-ui,sans-serif;color:#0f172a;background:#f8fafc;margin:0}main{max-width:1100px;margin:auto;padding:20px}section,form{background:white;padding:20px;border:1px solid #cbd5e1;border-radius:12px;margin:20px 0}nav{display:flex;gap:10px;flex-wrap:wrap}a{color:#1d4ed8}label{display:block;margin:12px 0}input,select,textarea,button{font:inherit;max-width:100%;box-sizing:border-box}textarea{width:100%;min-height:90px}input[type=text]{width:100%}button{padding:10px;min-height:44px;margin:5px;border:1px solid #64748b;border-radius:8px;background:#eff6ff;color:#0f172a;cursor:pointer}.table{overflow:auto}table{border-collapse:collapse;min-width:600px}td{border:1px solid #cbd5e1;padding:8px;vertical-align:top}p,li{overflow-wrap:anywhere}summary{cursor:pointer;font-weight:600;padding:12px}small{overflow-wrap:anywhere}:focus-visible{outline:3px solid #2563eb}h1{font-size:1.6rem}
</style><main><h1>HSK 1 r3 — Owner content review offline</h1>
<p>AI-assisted review là bằng chứng hỗ trợ, không phải independent language certification. Xem nội dung thực tế; không tự biến AI review thành human PASS. Trang không kết nối mạng, không đọc đáp án, không sửa nội dung hoặc metadata.</p>
<p id="binding">hanlearn-pilot-hsk1-v1 | r3 | manifest ${snapshot.manifest_sha256} | snapshot ${snapshot.package_snapshot_sha256}</p>
<nav aria-label="Tài liệu review">${docs.map((d) => `<a href="#${d.id}">${escapeText(d.title)}</a>`).join(" ")}</nav>
<section><h2>Kết quả đối chiếu kỹ thuật</h2><p>L3-Q4 có hai lựa chọn: hợp lệ theo Zod và CHECK 2–6; giữ r3. Cả bốn quiz: 6 câu, RPC đạt khi correct × 100 ≥ questionCount × 80, tức cần 5/6 (83,33%). Không có threshold riêng trong quiz metadata; không dùng React để chấm. Không suy ra private keys hoặc giải thích đúng từ review câu hỏi công khai.</p>
<p>Bài 3: học lượt A (6 từ) → nghỉ/ôn → lượt B (6 từ) → ôn → lượt C (3 từ). Có thể chia hai buổi; ghi thời gian và chỗ quá tải thực tế. Đây là hướng dẫn review, không sửa ước tính hay source frozen. Giữ hội thoại Bài 1–2; chưa có lỗi rõ buộc sửa.</p></section>
${docs.map((d) => `<section id="${d.id}"><h2>${escapeText(d.title)}</h2><small>${escapeText(d.filename)} | SHA-256 ${d.sha}</small>${renderDocument(d.text)}</section>`).join("\n")}
<form><h2>Ghi nhận phần đã trực tiếp xem</h2><p>Không cần chữ ký hoặc authorization JSON. Ghi theo nhóm hoặc stable IDs; chỉ ghi phạm vi thực tế, không nhập đáp án/explanations hoặc secrets. Ghi nhận ở đây chưa là PASS/approval và không tự cập nhật 159 records hay overlay. Có thể gửi ghi nhận qua chat sau khi xem.</p>
<label>Nhóm <select name="group">${groups.map((g) => `<option>${g}</option>`).join("")}</select></label>
<label>Phạm vi đã xem và nhận xét/NEEDS_FIX (nêu IDs nếu chỉ xem từng mục)<textarea name="scope" required maxlength="4000"></textarea></label>
<label>Thời điểm xem thực tế (ISO8601 có múi giờ)<input name="when" type="text" placeholder="YYYY-MM-DDTHH:mm:ss+07:00" required></label><button id="now" type="button">Dùng thời điểm hiện tại</button>
<label><input name="seen" type="checkbox" required> Tôi đã trực tiếp xem đúng phạm vi vừa ghi.</label>
<button type="submit">Ghi phần đã xem</button><button id="download" type="button">Tải ghi chú .txt</button><p id="result" role="status" aria-live="polite">Chưa có ghi nhận. Notes chỉ ở bộ nhớ; tải xuống trước khi đóng/reload.</p><ul id="notes"></ul></form>
<p>Syllabus: đối chiếu đúng bản 11/2025, triển khai 07/2026 và phạm vi các headword/category đã kiểm tra; hiện chỉ có machine evidence, không tự điền verified_at. Nguồn trực tiếp chưa rõ vẫn chưa xác minh; personal use không là quyền phân phối.</p></main><script>${script}</script></html>`;
}
if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  try {
    if (process.argv.length !== 2) throw Error("arguments_rejected");
    const html = buildOwnerReviewPage();
    const output = ".local/owner-content-review/index.html";
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, html);
    console.log(
      "PASS: offline public review page ready: " + path.resolve(output),
    );
    console.log(
      "Open locally in browser; notes require explicit download. No approval changed.",
    );
  } catch {
    console.error(
      "FAIL: public review preparation rejected; no private data read.",
    );
    process.exitCode = 1;
  }
}
