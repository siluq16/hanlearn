# HanLearn Sprint 8N – Linguistic Quality Review (Vocabulary, Pinyin, Grammar & Examples)

**Ngày kiểm toán:** 2026-11-17  
**Phạm vi:** 300 từ vựng cốt lõi HSK 1, 500 mục từ GF0025-2021, Module 0 Pinyin, 54 điểm ngữ pháp, 69 ví dụ ngữ pháp, 32 bài hội thoại (91 lượt) và 32 bài đọc hiểu.

---

## 1. Kiểm toán 300 Từ vựng Cốt lõi HSK 1 (Phase 2)

### 1.1. Chữ Hán (Hanzi) & Unicode
- **Chính xác Giản thể (Simplified Chinese):** 300/300 từ sử dụng chuẩn chữ Hán giản thể hiện hành của Đại lục (*《通用规范汉字表》*). Không có chữ Phồn thể bị trộn nhầm trong trường `simplified`.
- **Tính duy nhất:** 300/300 mục từ trong `hsk1_exam_2025_official_300.json` là duy nhất (`uniqueHanzi.size === 300`).
- **Xử lý ký tự bất thường:** Phát hiện hàng trăm ký tự khoảng trắng không ngắt dòng (`\u00A0` – Non-Breaking Space) trong `hsk2_vocabulary.json` và 4 chuỗi thực thể HTML (`&#8217;`) trong `hsk1_exam_2025_official_300.json` (`不客气`, `不要`, `没关系`, `没事`). **Đã chuẩn hóa 100% về UTF-8 tiêu chuẩn.**

### 1.2. Phiên âm Pinyin, Thanh điệu & Từ đa âm (Polyphones)
- **Chuẩn hóa giữa dạng từ điển và biến điệu ngữ cảnh:**
  - Trong `hsk1_exam_2025_official_300.json`, các cụm cố định có biến điệu `不` và `一` được ghi theo dạng đọc thực tế giúp người mới học phát âm đúng ngay:
    - `不客气` (`bú kèqi`), `不要` (`búyào`) — `不` đứng trước thanh 4 biến điệu thành thanh 2 (`bú`).
    - `一半` (`yíbàn`), `一下` (`yíxià`), `一块儿` (`yíkuàir`), `一起` (`yìqǐ`), `一点儿` (`yìdiǎnr`), `一些` (`yìxiē`).
  - Trong khi đó, chữ đơn `不` (`bù`) và `一` (`yī`) giữ nguyên thanh gốc từ điển kèm ghi chú quy tắc biến điệu.
- **Phân biệt từ đa âm (Polyphones):**
  - **`只` (`zhī` vs `zhǐ`)**: Mục số 287 trong danh sách 300 từ HSK 1 là `只` (`zhī`, thanh 1 – lượng từ cho động vật: *一只小猫*). Phát hiện trong `hsk2_vocabulary.json` chỉ có mục `只` (`zhǐ`, thanh 3 – phó từ: *chỉ*). Đã gắn cứng nghĩa tiếng Việt và câu ví dụ đúng cho lượng từ `zhī` (*"con, chiếc (lượng từ dùng cho động vật hoặc một chiếc trong cặp)"* – *我家有一只小猫。*), ngăn chặn hoàn toàn lỗi râu ông nọ cắm cằm bà kia.
  - **`觉` (`jiào` trong `睡觉` *shuìjiào* vs `jué` trong `觉得` *juéde*)**: Được tách thành 2 mục từ riêng biệt và giải thích rõ trong Bài 15 & Bài 30.
  - **`长` (`cháng` *dài* vs `zhǎng` *lớn lên/trưởng*)**: Trong HSK 1 (Bài 17) dạy nghĩa tính từ `cháng` (*dài*).
  - **`还` (`hái` *vẫn, còn* vs `huán` *trả lại*)**: Trong HSK 1 (Bài 29) dạy nghĩa phó từ `hái` (*vẫn, còn*).
- **Sửa lỗi đứt âm tiết Pinyin trong câu ví dụ:**
  - Phát hiện và sửa triệt để **23 câu ví dụ** trong `hsk1_vocabulary.json` bị ngắt khoảng trắng sai giữa thanh mẫu và vận mẫu: `Chàngg ē` $\rightarrow$ `Chànggē`, `Duìb uqǐ` $\rightarrow$ `Duìbuqǐ`, `Wǒm en` $\rightarrow$ `Wǒmen`, `Dòngw ùyuán` $\rightarrow$ `Dòngwùyuán`, `Chīfà n` $\rightarrow$ `Chīfàn`, `W ǒ` $\rightarrow$ `Wǒ`, `Túshūguǎ n` $\rightarrow$ `Túshūguǎn`, `Qiántiā n` $\rightarrow$ `Qiántiān`, `Qǐ ng` $\rightarrow$ `Qǐng`, `Sh àng` $\rightarrow$ `Shàng`, `Lǎos hī` $\rightarrow$ `Lǎoshī`, `Xuéx iào` $\rightarrow$ `Xuéxiào`, `Xǐshǒujiā n` $\rightarrow$ `Xǐshǒujiān`, `Shāngd iàn` $\rightarrow$ `Shāngdiàn`.

### 1.3. Nghĩa tiếng Việt (`meaning_vi`) & Tương thích Flashcard SRS
- **Trước khi kiểm toán:**
  - 42/300 từ trên trang `/vocabulary` bị hiển thị tiếng Anh (`supermarket`, `taxi`, `everyone`, `don&#8217;t, not want`...) do hàm `getOfficial300VocabItems()` chỉ tra trong `hsk1_vocabulary.json`.
  - 258/300 từ còn lại lấy trường `raw_definition` bị lẫn cả tiếng Anh và mảnh Pinyin tràn cột PDF (ví dụ: `杯子`: `"zi cup cái cốc"`, `大学生`: `"xué shēng university student sinh viên đại học"`, `第`: `"） dì （ dì èr ） auxiliary word..."`).
- **Sau khi khắc phục:**
  - Toàn bộ **300/300 từ** trong `hsk1_exam_2025_official_300.json` và `getOfficial300VocabItems()` đã được chuẩn hóa sang nghĩa tiếng Việt sư phạm, ngắn gọn, rõ từ loại và sắc thái (ví dụ: `杯子`: *"cái cốc, cái ly"*, `大学生`: *"sinh viên đại học"*, `第`: *"thứ (tiền tố số thứ tự)"*).
- **Tương thích mặt trước Flashcard Việt $\rightarrow$ Hán:**
  - Phát hiện từ `不` có nghĩa `"Không (phó từ phủ định, đọc bú trước 是)"` làm lộ âm đọc `"bú"` trên mặt trước thẻ. Đã tách bằng dấu chấm phẩy `"Không (phó từ phủ định); đọc biến điệu bú trước thanh 4 như 是"` và nâng cấp `sanitizeCardPrompt()` trong `src/features/review/hint-sanitizer.ts` để chuyển toàn bộ ghi chú phát âm sang mặt sau (`notes`).

---

## 2. Kiểm toán 54 Điểm Ngữ pháp & 69 Câu Ví dụ (Phase 4)

Tất cả 13 nhóm cấu trúc ngữ pháp cốt lõi của HSK 1 đã được đối chiếu xuyên suốt 32 bài học:

| Nhóm cấu trúc ngữ pháp HSK 1 | Bài học giới thiệu | Công thức (`pattern`) | Đánh giá tính chính xác & Tự nhiên |
| :--- | :---: | :--- | :--- |
| **1. Câu chữ `是` (Phán đoán & Xác nhận)** | Bài 1, Bài 2 | `S + 是 + N` / `S + 不是 + N` | Chính xác; nhấn mạnh `是` không dùng trực tiếp với tính từ đơn thuần (phải dùng `很`). |
| **2. Câu chữ `有` & Phủ định `没 / 没有`** | Bài 3 | `S + 有 + O` / `S + 没有 + O` | Chính xác; phân biệt rõ `不` và `没` (không nói `*不有`). |
| **3. Đại từ nghi vấn (`什么, 谁, 哪, 哪儿, 怎么, 怎么样`)** | Bài 1, 2, 9, 10, 22 | Giữ nguyên vị trí từ cần hỏi trong câu trần thuật | Giải thích trực quan cho người Việt (không đảo ngữ lên đầu câu như tiếng Anh). |
| **4. Phân biệt `几` và `多少`** | Bài 3, Bài 7 | `几 + Lượng từ + N` (<10) vs `多少 (+ Lượng từ) + N` (>10 / giá tiền) | Chính xác; ví dụ tự nhiên (`你家有几口人？`, `这个多少钱？`). |
| **5. Phân biệt `二` và `两`** | Bài 3, Bài 6, Bài 26 | `两 + Lượng từ` vs `二` (đếm số, số thứ tự `第二`, hàng chục `二十`) | Giải thích rất rõ lỗi người Việt hay mắc (`两个人`, không nói `*二个人`). |
| **6. Trợ từ kết cấu `的`** | Bài 3, Bài 13, Bài 17 | `Định ngữ + 的 + Trung tâm ngữ` (lược `的` khi quan hệ thân thuộc/quốc tịch) | Chính xác (`我妈妈`, `中国人`, `漂亮的衣服`). |
| **7. Giới từ & Động từ `在`** | Bài 5, Bài 9, Bài 15, Bài 28 | `S + 在 + Địa điểm` (động từ) & `S + 在 + Địa điểm + V` (giới từ) & `正在/在 + V + 呢` (tiếp diễn) | Đầy đủ 3 chức năng của `在`; nhấn mạnh trật tự trạng ngữ chỉ nơi chốn đứng **trước** động từ (ngược với tiếng Việt). |
| **8. Trợ từ nghi vấn `吗` và `呢`** | Bài 1, Bài 2, Bài 9 | `Câu trần thuật + 吗？` / `Danh từ + 呢？` (Còn ... thì sao?) | Tự nhiên, đúng ngữ cảnh hội thoại. |
| **9. Trợ từ ngữ khí & hoàn thành `了`** | Bài 11, Bài 19, Bài 29 | `S + V + 了 (+ Số lượng + O)` / `... + 了` (thay đổi trạng thái) | Đã sửa câu bài tập `pg09-5` trong Practice Bank từ câu vượt cấp (`春风来了，天气变暖和了`) về câu chuẩn HSK 1 (`下雨了，天气冷了`). |
| **10. Hệ thống Lượng từ (`个, 口, 本, 杯, 件, 只, 块, 岁`)** | Bài 3, 7, 8, 13, 17, 26 | `Số từ + Lượng từ + Danh từ` | Phân loại rõ lượng từ theo nhóm danh từ đi kèm. |
| **11. Cách nói Thời gian (`年, 月, 日/号, 星期, 点, 分, 半`)** | Bài 4, Bài 6, Bài 21 | Nguyên tắc **Từ lớn đến nhỏ**: `Năm -> Tháng -> Ngày -> Buổi -> Giờ -> Phút` | Nhấn mạnh sự ngược chiều với tiếng Việt (tiếng Việt nói nhỏ trước lớn sau). |
| **12. Động từ năng nguyện (`想, 会, 能, 可以`)** | Bài 8, Bài 14, Bài 20, Bài 22 | `S + 想/会/能/可以 + V` | Phân biệt rõ `想` (muốn), `会` (biết thông qua học tập: *我会说汉语*), `能/可以` (có thể/được phép). |
| **13. Câu cầu khiến & Cấm chỉ (`请, 吧, 不要, 别`)** | Bài 12, Bài 31 | `请 + V` / `... + 吧` / `不要/别 + V` | Tự nhiên, phù hợp văn hóa giao tiếp. |
