# Private answer-store backup — HSK 1 Pilot r3

2026-11-13, Asia/Saigon. **BACKUP_VERIFIED.** Archive thật đã tạo, đọc lại bằng `7z t`, giải mã/restore trong ACL hạn chế và so sánh **30/30 files PASS**, gồm đủ **11 private files**. Kết luận áp dụng cho archive thành công được ghi bên dưới; các attempts cũ không được tự nâng thành verified.

## Inventory và phạm vi bảo vệ

Private root `.local/pilot-hsk1/v1/private/`: **11 files**. Directory tắt kế thừa ACL; directory + 11 files chỉ current Windows owner/SYSTEM, không reparse points. Git ignore áp dụng; không private paths được stage/commit. Không công bố tài khoản/SID, password, answer values, explanations hoặc private integrity digests.

| File                              | Vai trò phục hồi                                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `answers.json`                    | **Bắt buộc:** 24 private records/explanations, package r3 metadata và 4 quiz bindings. Không tái tạo bằng suy đoán từ public choices. |
| `owner-acceptance-r3.md`          | **Bắt buộc:** quyết định owner hiện có với exact public revision/hashes; không ký lại hoặc sửa khi backup/restore.                    |
| `answers-before-r3.json`          | Lịch sử trước thay đổi r3; không dùng thay current store.                                                                             |
| `answers-before-remediation.json` | Lịch sử authoring cũ; không dùng thay current store.                                                                                  |
| `author.mjs`                      | Private authoring source chứa dữ liệu riêng; chỉ giữ lịch sử, không chạy lại để restore.                                              |
| `remediation.mjs`                 | Private remediation trail; không replay lên source hiện tại.                                                                          |
| `fix-ai-r3.mjs`                   | Private r3 fix/binding trail; không replay khi phục hồi.                                                                              |
| `quality-audit.mjs`               | Private audit helper/source cần giữ restricted.                                                                                       |
| `verify-remediation.mjs`          | Private verification/history helper.                                                                                                  |
| `verify-ai-r3.mjs`                | Private r3 verification/history helper.                                                                                               |
| `ai-review-r2-input.md`           | Protected AI input có gợi ý lời giải; bản này khớp raw ignored input, không cần đưa bản raw ngoài private vào gói public.             |

Để phục hồi đủ context theo đúng version, helper chọn **30 files**:

- Toàn bộ 11 private files trên.
- 12 public JSON files trong SOURCE_SNAPSHOT r3: manifest, vocabulary, grammar, rights manifest, 4 lessons, 4 quizzes.
- README và REVIEW_CHECKLIST của package: 2 files.
- SOURCE_SNAPSHOT r3 và hai REVIEW_REGISTER JSON/CSV: 3 files, giữ 159 records PENDING.
- Official HSK PDF và `source-pages.json`: 2 local ignored reference-cache files mà `npm run content` cần. Giữ chỉ trong archive riêng; việc backup không cấp quyền tái phân phối tài liệu nguồn.

Tổng 11 + 12 + 2 + 3 + 2 = **30**. Source code app/validator có trong Git, không coi archive này là backup toàn máy/repository/Cloud. Pinyin reference images/PDF, reports/preflight captures và older review packets là evidence bổ sung có thể backup riêng; không bắt buộc để phục hồi 24 answers/bindings r3. Không gom `.env`, DB credentials hoặc toàn bộ `.local` vào archive.

## Công cụ, nơi lưu và secret input

Owner xác nhận backup root **`D:\nam4\prj\backup`**, ngoài repository. 7-Zip 26.06 x64 được cài tại `D:\Program\7-Zip\7z.exe`, tìm qua registry sau khi owner cài; không tự download/install/upload. Ban đầu PATH/các install paths thông thường không có tool phù hợp; một registry read bị sandbox từ chối, sau đó đọc registry cài đặt được cấp quyền và tìm thấy path thật.

Đã đọc help CHM local của chính bản cài: `-p` không kèm giá trị dùng prompt; `.7z` hỗ trợ AES-256; `-mhe=on` mã hóa metadata/tên file. Không dùng ZIP/Compress-Archive làm thay thế không mã hóa, không truyền password trong args/env/file, không hardcode hoặc chép password vào chat.

Helper `scripts/private-pilot-backup.ps1` gọi trực tiếp prompt ẩn native 7-Zip: `a` dùng `-p` không kèm giá trị; `t`/`x` **không truyền `-p`** để 7-Zip hỏi password khi đọc encrypted archive. Owner nhập cùng password vào mọi prompt xuất hiện. Helper không đọc/lưu password. Archive được tạo ở **subfolder GUID mới** trong backup root, ACL owner/SYSTEM trước khi ghi. Không update/overwrite archive cũ.

Parser `scripts/private-backup-header.mjs` kiểm đúng encoded-header AES coder, không chỉ tin extension/options; không hiển thị CRC/hash riêng. Password rỗng/unencrypted header không đạt gate. Gate này đi kèm `7z t` + actual extraction + toàn bộ hash comparison; một mình header check không chứng minh backup phục hồi được.

## Thực tế đã chạy

1. Audit freeze r3, inventory/ACL và source set 30 files PASS. `-NoPrompt` dừng đúng trước staging/archive khi chưa có tương tác local an toàn.
2. Prototype **synthetic-only** đã tái hiện: `a -p` tạo archive, nhưng `t -p`/`x -p` thử password rỗng và FAIL không hỏi lại. Tài liệu help mô tả prompt tổng quát nhưng hành vi bản cài ở lệnh đọc khác. Bỏ `-p` khỏi `t`/`x` thì create/test/restore đều exit 0, restored fixture hash-match, không echo password. Workflow thật vẫn dùng native console prompt; không dùng pipe password với private data. Không in/lưu password của probes.
3. Owner chạy helper thật. Archive đã tạo tại `D:\nam4\prj\backup\hanlearn-pilot-r3-bee3a2d3af9248f1b861c557b6b0be71\private-pilot-r3.7z`; encoded-header AES gate PASS.
4. **`7z t` FAIL: Wrong password** ở các attempts trước sửa helper; matchedFiles **0/30**. Đây là triệu chứng đã được owner báo và tái hiện bằng synthetic test do `-p` rỗng; không kết luận owner đã nhập sai. Riêng owner báo không nhớ password tạo archive cũ. Không thử đoán/brute-force, không gọi archive đó là verified backup.
5. Các archive cũ và source giữ nguyên; latest failed attempt được ghi tại `D:\nam4\prj\backup\hanlearn-pilot-r3-309eeaaa1edb4fc180204455c025f96e\private-pilot-r3.7z`. Plaintext staging của attempts lỗi giữ trong workspace riêng có ACL hạn chế. `-VerifyExisting` hiện đã sửa và chỉ test/restore archive cũ nếu owner có password đúng. Với password cũ không có, owner được hướng dẫn tạo archive mới bằng helper đã sửa; ở thời điểm đó chưa có evidence private restore thành công.
6. Sau bản sửa, owner chạy helper lại. Capture bắt đầu `2026-11-13T06:04:17.9405357Z` (13:04:17 Asia/Saigon, thời gian máy local). Archive mới **`D:\nam4\prj\backup\hanlearn-pilot-r3-7a7845adf5bd40a9b9b5b7be859cbf25\private-pilot-r3.7z`**: create, AES encoded-header check, `7z t`, extraction đều PASS; **30/30 matches**, privateFiles 11, reason null. Hash map chỉ giữ trong memory; kiểm lại originals trong cùng run cũng khớp.
7. Kiểm tra độc lập sau run: archive còn tồn tại, directory/file ACL chỉ owner/SYSTEM, không reparse; parser encoded-header AES PASS. Không hỏi lại password hoặc mở/decrypt archive thêm lần nữa. Helper đã xóa đúng stage/restore do run thành công tạo; sources và mọi archive cũ còn nguyên.

Evidence machine-readable ignored: `.local/pilot-hsk1/private-backup-result.json`; chỉ status/counts/path/tool version/encryption flag/reason, không serialize private hash map. Capture thực tế hiện ghi **BACKUP_VERIFIED, sourceFiles=30, matchedFiles=30, privateFiles=11, encryptedHeader=true, cleanup=REMOVED_HELPER_PLAINTEXT_ONLY, reason=null**. Đây là evidence restore thành công; không chỉ là file archive tồn tại hoặc header encrypted.

## Quản lý tiếp theo và thao tác cho bản backup tương lai

Lần backup/restore đã hoàn tất; không cần chạy lại để xem báo cáo. Owner giữ password của archive thành công bằng cơ chế riêng đã chọn, không gửi vào chat hoặc lưu plaintext trong repository. Nếu cần một bản backup mới trong tương lai, lệnh sau tạo archive ở GUID mới, giữ nguyên archive cũ:

```powershell
powershell -NoProfile -File .\scripts\private-pilot-backup.ps1
```

Dùng cùng một password tại các prompt ẩn tạo/xác nhận/test/restore; không đưa password sau `-p`, vào command history, log hoặc chat. Lệnh tạo folder GUID mới, không overwrite. Nếu chưa thể giữ và nhập lại password an toàn, dừng BACKUP_PENDING. Không tự suy thành công từ việc chạy command: mỗi run tương lai phải có result BACKUP_VERIFIED và đủ 30/30 comparisons thực tế.

Restore dùng thư mục GUID mới dưới `.local/pilot-backup-r3-work/`, đặt ACL owner/SYSTEM **trước khi copy/extract**. So SHA-256 trong memory cho đủ 30 files recovered với originals và baseline của chính run; chỉ xuất counts/status. Reject reparse paths, thiếu/thừa files, changed source hoặc mismatches. Không copy restored files đè private store gốc.

Điều kiện create + encrypted-header gate + test + restore + **30/30 hash matches** đã đạt ở run thành công; chỉ khi đủ điều kiện đó helper mới set BACKUP_VERIFIED. Helper chỉ dọn plaintext stage/restore **của chính run thành công**, với absolute-path/GUID boundary checks trước recursive delete; không xóa source/archive. Temp của attempt lỗi trước vẫn restricted và cần quyết định cleanup riêng; archive cũ không tự xóa.

## Readiness

- **Backup: BACKUP_VERIFIED** cho archive `7a7845adf5bd40a9b9b5b7be859cbf25`, có actual test/decrypt/restore/hash-match evidence. Không chứng minh việc owner sẽ còn giữ password hoặc thiết bị vẫn hoạt động trong tương lai; chưa thử recovery trên máy khác.
- Rights: xem `PILOT_R3_RIGHTS_AUDIT.md`; mã hóa không tạo license hoặc quyền bàn giao.
- Trước operational importer/key delivery: cần BACKUP_VERIFIED, cơ chế giữ recovery password do owner kiểm soát, private evidence/attestation phù hợp và rights/source decisions thật. Có thể đề xuất preview/importer thuần offline nhưng không coi dữ liệu sẵn sàng ghi Cloud.
- Không sửa answers, owner acceptance, content r3, publication metadata, 159 PENDING rows, migrations/RLS hoặc Sprint 2.2 guard. Không Cloud writes/import/publish/push/deploy.

## Kiểm chứng local cuối

`npm run content`, contracts/security, typecheck/lint/format checks PASS; `npm run test`: **191 tests / 19 files PASS**, gồm 7 regression cases cho encrypted-header gate và hành vi prompt lệnh đọc. Source snapshot r3 không đổi, 159 human-review rows vẫn PENDING. Không private digest/key/explanation được thêm vào Git hoặc báo cáo.
