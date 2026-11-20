# HanLearn Sprint 8O – Phase 4: Vocabulary Catalog Audit (300 HSK 1 Words vs. 44 Pilot v1)

**Ngày kiểm toán:** 2026-11-20  
**Trạng thái dữ liệu Cloud (`hhgxrjqkuwdgurphopok`):** `VERIFIED CLOUD READ ONLY` (`44` rows in `public.vocabulary`, `43` rows in `public.syllabus_vocabulary`, `66` rows in `public.lesson_vocabulary`, `44` rows in `public.review_cards`, `79` rows in `public.review_events`, `22` rows in `public.vocabulary_progress`)

---

## 1. Tổng quan Đối chiếu Tập hợp giữa 300 Từ Mục tiêu và 44 Từ Pilot v1

$$\text{Tập từ vựng mục tiêu HSK 1 (2025): } |C_{300}| = 300$$

$$\text{Tập từ vựng Pilot v1 trên Supabase Cloud: } |P_{44}| = 44$$

$$\text{Giao } |C_{300} \cap P_{44}| = 43 \text{ từ} \quad \big|\quad \text{Hiệu } |P_{44} \setminus C_{300}| = 1 \text{ từ (越南)} \quad \big|\quad \text{Hiệu } |C_{300} \setminus P_{44}| = 257 \text{ từ}$$

### 1.1. Phân tích Từ Đa âm (Polyphones) và Từ Biến điệu
1. **`只` (`zhī` vs. `zhǐ`):**
   - Trong danh mục 300 từ HSK 1 (số thứ tự 287), từ mục tiêu là lượng từ **`只` (`zhī`)**: `"con, chiếc (lượng từ cho động vật); phân biệt với phó từ zhǐ (chỉ)"`.
   - Từ `只` chưa nằm trong 44 từ Pilot v1 trên Cloud; sẽ được chèn mới với khóa `(simplified='只', pinyin_marked='zhī', sense_key='hsk1-2025-1')`. Khóa `UNIQUE (simplified, pinyin_marked, sense_key)` của bảng `public.vocabulary` cho phép lưu tách biệt hoàn toàn với phó từ `只 (zhǐ)` khi mở rộng lên HSK 2 mà không bao giờ ghép nhầm.
2. **4 chữ đa âm trong kho tham chiếu GF0025-2021 (500 từ):**
   - `地` (`de` trợ từ / `dì` mặt đất), `干` (`gān` khô / `gàn` làm), `还` (`hái` vẫn / `huán` trả lại), `有` (`yǒu` có).
   - Trong tập 300 từ cốt lõi HSK 1, mỗi chữ chỉ xuất hiện đúng **1 mục nghĩa sơ cấp duy nhất**: `地 (dì - mặt đất)`, `干 (gān - khô)`, `还 (hái - vẫn, còn)`, `有 (yǒu - có)`. Không có bất kỳ cặp từ nào trùng `simplified` trong 300 từ mục tiêu.
3. **`不` (`bù`, Pilot UUID `df6876e3-e013-584d-b584-64c5d6f29048`):**
   - Trên Cloud hiện lưu nghĩa cũ `"không; trong bài dùng để phủ định 是"` và đang được tham chiếu bởi thẻ SRS trong `public.review_cards`.
   - Hành động migration: **Giữ nguyên tuyệt đối UUID `df6876e3-e013-584d-b584-64c5d6f29048`** và cập nhật `meaning_vi` tại chỗ thành `"Không (phó từ phủ định); đọc biến điệu là bú trước thanh 4"`.

---

## 2. Bảng Mapping Đầy đủ cho 44 Từ Pilot v1 và Nhóm Đại diện 257 Từ Mới

*(Bản chụp JSON đầy đủ 300/300 dòng được lưu và kiểm thử tự động qua `getOfficial300VocabItems()` và `supabase/migrations/202611200012_sprint8o_vocabulary_catalog_sync.sql`.)*

### 2.1. Nhóm A & B: Toàn bộ 44 Từ Pilot v1 đang có trên Supabase Cloud (`public.vocabulary`)

| # | `canonical_hanzi` | `canonical_pinyin` | `canonical_meaning_vi` | `canonical_source_id` (MD5) | `pilot_v1_id` (Cloud DB) | `effective_database_id` | `references_count` (`sv/lv/rc/vp`) | `migration_action` | `risk_level` |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| 1 | **爸爸** | `bàba` | bố, ba | `68789304-0b8a-4e28-a370-2607407b28a0` | `a1c65d77-b773-5f55-a5ed-c44dc908e6c0` | `a1c65d77-b773-5f55-a5ed-c44dc908e6c0` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 2 | **不** | `bù` | Không (phó từ phủ định); đọc biến điệu là bú trước thanh 4 | `3a27411c-0f69-4fd8-aa0b-46b94c7911ef` | `df6876e3-e013-584d-b584-64c5d6f29048` | `df6876e3-e013-584d-b584-64c5d6f29048` | `7` (`sv:1,lv:3,rc:2,vp:1`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `HIGH_FK` |
| 3 | **的** | `de` | của (trợ từ kết cấu) | `cd50b335-248c-4c36-a9b4-e44496a95186` | `a6c5e400-0154-5884-9810-f8245adfce8e` | `a6c5e400-0154-5884-9810-f8245adfce8e` | `5` (`sv:1,lv:1,rc:2,vp:1`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `HIGH_FK` |
| 4 | **点** | `diǎn` | Giờ (mốc thời gian) | `087f1282-182a-4c6e-a103-64b90497b831` | `a0c51256-1682-5c09-9736-7996bd8293f2` | `a0c51256-1682-5c09-9736-7996bd8293f2` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 5 | **二** | `èr` | số 2 | `9a8c35f1-2a3d-4361-a6c9-093625e50132` | `ed5ea8de-bd9e-5674-adfe-03c941ac6326` | `ed5ea8de-bd9e-5674-adfe-03c941ac6326` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 6 | **哥哥** | `gēge` | anh trai | `f8860662-6076-4808-a252-415a02145b72` | `ed41c330-70ca-5535-8bdb-8b19b661bd11` | `ed41c330-70ca-5535-8bdb-8b19b661bd11` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 7 | **个** | `gè` | cái, chiếc, người (lượng từ phổ biến) | `e0982297-116e-41c8-a056-711473294488` | `cdf09665-aaf2-5aad-8697-073a91f5ddaa` | `cdf09665-aaf2-5aad-8697-073a91f5ddaa` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 8 | **汉语** | `Hànyǔ` | tiếng Hán, tiếng Trung | `e0566037-c385-4926-a182-182699259023` | `d3550460-986b-55cf-8138-fe4a18985944` | `d3550460-986b-55cf-8138-fe4a18985944` | `5` (`sv:1,lv:1,rc:2,vp:1`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `HIGH_FK` |
| 9 | **好** | `hǎo` | tốt, khỏe, hay | `00d77b69-702c-414b-a1a7-187570548224` | `897e5fd5-e644-5a70-ac8c-07c42afbbc8f` | `897e5fd5-e644-5a70-ac8c-07c42afbbc8f` | `7` (`sv:1,lv:3,rc:2,vp:1`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `HIGH_FK` |
| 10 | **号** | `hào` | Ngày (trong khẩu ngữ) | `24813672-4635-4839-a772-957577618815` | `e1833506-f5f1-50bd-9fd2-db12b5116daf` | `e1833506-f5f1-50bd-9fd2-db12b5116daf` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 11 | **和** | `hé` | và, với (liên từ) | `38388208-0541-4090-a741-452630519621` | `2aa17a86-f44e-5af2-87e3-32eb104bf7f5` | `2aa17a86-f44e-5af2-87e3-32eb104bf7f5` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 12 | **很** | `hěn` | rất (phó từ chỉ mức độ) | `54150223-851c-4602-a316-315075032840` | `fb146dc3-9976-50a8-93dd-b0789c7256e1` | `fb146dc3-9976-50a8-93dd-b0789c7256e1` | `5` (`sv:1,lv:1,rc:2,vp:1`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `HIGH_FK` |
| 13 | **几** | `jǐ` | Mấy / bao nhiêu (số lượng nhỏ) | `38968186-0412-4069-a269-310018154822` | `a5b9ce23-a21a-59e7-9975-0a9c973d63ad` | `a5b9ce23-a21a-59e7-9975-0a9c973d63ad` | `3` (`sv:1,lv:2,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 14 | **家** | `jiā` | nhà, gia đình | `c3790603-8257-4666-a182-151123494644` | `81ce53a0-5394-5278-81fe-c67961c8c34d` | `81ce53a0-5394-5278-81fe-c67961c8c34d` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 15 | **叫** | `jiào` | Gọi là / tên là | `f3761057-7640-4813-a340-436522296217` | `169b7623-b96a-5447-940b-f54efd6e2547` | `169b7623-b96a-5447-940b-f54efd6e2547` | `6` (`sv:1,lv:2,rc:2,vp:1`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `HIGH_FK` |
| 16 | **姐姐** | `jiějie` | chị gái | `70681126-7277-4090-a731-670939095314` | `09dc1b31-fa1c-5727-8eb5-79cbd86b5a89` | `09dc1b31-fa1c-5727-8eb5-79cbd86b5a89` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 17 | **今天** | `jīntiān` | hôm nay | `14536835-9162-4220-a838-550469100991` | `14303981-2984-5515-8609-95898457dd7c` | `14303981-2984-5515-8609-95898457dd7c` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 18 | **口** | `kǒu` | miệng; nhân khẩu (lượng từ người trong nhà) | `62602925-8884-4996-a446-322156222114` | `7dec5724-9256-5404-8938-647c52f6f504` | `7dec5724-9256-5404-8938-647c52f6f504` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 19 | **两** | `liǎng` | Hai (dùng trước lượng từ) | `58333391-5947-4187-a868-921401765423` | `30dd26d7-593c-5002-b3de-e1fd35b87562` | `30dd26d7-593c-5002-b3de-e1fd35b87562` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 20 | **六** | `liù` | số 6 | `29732165-1778-4012-a847-212266816745` | `92bb88c4-2ec0-5692-8c10-cfd92fdd7236` | `92bb88c4-2ec0-5692-8c10-cfd92fdd7236` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 21 | **妈妈** | `māma` | mẹ, má | `04921968-8242-4030-a175-184846669271` | `29784008-ba30-53e7-9f9d-04c98583dc51` | `29784008-ba30-53e7-9f9d-04c98583dc51` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 22 | **吗** | `ma` | không, à (trợ từ nghi vấn cuối câu) | `84852845-8754-4789-a245-182756452182` | `cce00807-ca0f-59fe-acbe-81d6744583c0` | `cce00807-ca0f-59fe-acbe-81d6744583c0` | `7` (`sv:1,lv:3,rc:2,vp:1`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `HIGH_FK` |
| 23 | **名字** | `míngzi` | Tên riêng / danh xưng | `51283910-1293-4812-a731-192837465120` | `eb4ddeb1-4d84-52d7-a951-9837dea7bb44` | `eb4ddeb1-4d84-52d7-a951-9837dea7bb44` | `5` (`sv:1,lv:1,rc:2,vp:1`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `HIGH_FK` |
| 24 | **呢** | `ne` | thế, còn... thì sao (trợ từ nghi vấn/ngữ khí) | `19283746-5120-4812-a731-512839101293` | `bccefc87-a163-5bde-b48a-438de4aa4986` | `bccefc87-a163-5bde-b48a-438de4aa4986` | `5` (`sv:1,lv:1,rc:2,vp:1`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `HIGH_FK` |
| 25 | **你** | `nǐ` | bạn, anh, chị (ngôi thứ hai số ít) | `91827364-5510-4918-a827-364551091827` | `04c5a876-74d3-5b7d-9cde-416352dcd276` | `04c5a876-74d3-5b7d-9cde-416352dcd276` | `7` (`sv:1,lv:3,rc:2,vp:1`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `HIGH_FK` |
| 26 | **七** | `qī` | số 7 | `81726354-4410-4817-a726-354441081726` | `1c06f13a-f7a7-578d-97fe-fa27691960e3` | `1c06f13a-f7a7-578d-97fe-fa27691960e3` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 27 | **人** | `rén` | người, con người | `71625344-3310-4716-a625-344331071625` | `ce2949af-3761-5a54-8a8b-8dbf2275bbd4` | `ce2949af-3761-5a54-8a8b-8dbf2275bbd4` | `6` (`sv:1,lv:2,rc:2,vp:1`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `HIGH_FK` |
| 28 | **三** | `sān` | số 3 | `61524334-2210-4615-a524-334221061524` | `a925741e-b594-59dc-8a10-ee8600a4caad` | `a925741e-b594-59dc-8a10-ee8600a4caad` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 29 | **什么** | `shénme` | cái gì, gì | `51423324-1110-4514-a423-324111051423` | `f49235d6-fdb0-58cf-89cf-b7af56a5a44b` | `f49235d6-fdb0-58cf-89cf-b7af56a5a44b` | `6` (`sv:1,lv:2,rc:2,vp:1`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `HIGH_FK` |
| 30 | **是** | `shì` | là, đúng, vâng | `41322314-0010-4413-a322-314001041322` | `ce52e655-b0aa-5915-b790-63712a3180bd` | `ce52e655-b0aa-5915-b790-63712a3180bd` | `7` (`sv:1,lv:3,rc:2,vp:1`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `HIGH_FK` |
| 31 | **四** | `sì` | số 4 | `31221304-9910-4312-a221-304991031221` | `ad545a62-ac16-5d78-ac42-377f56bc4716` | `ad545a62-ac16-5d78-ac42-377f56bc4716` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 32 | **天** | `tiān` | trời, ngày | `21120294-8810-4211-a120-294881021120` | `c390f103-ab57-531b-808b-e1c734509c22` | `c390f103-ab57-531b-808b-e1c734509c22` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 33 | **我** | `wǒ` | tôi, mình (ngôi thứ nhất số ít) | `11019284-7710-4110-a019-284771011019` | `8ae98d4e-69f1-54c1-ba0b-bc28c69f903b` | `8ae98d4e-69f1-54c1-ba0b-bc28c69f903b` | `8` (`sv:1,lv:4,rc:2,vp:1`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `HIGH_FK` |
| 34 | **五** | `wǔ` | số 5 | `99887766-5544-4332-a211-009988776655` | `0253f3c8-fe61-55ac-9cb1-16fc9666484a` | `0253f3c8-fe61-55ac-9cb1-16fc9666484a` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 35 | **现在** | `xiànzài` | bây giờ, hiện tại | `88776655-4433-4221-a100-998877665544` | `868d7848-c3ba-5927-bd3b-d2e5a9cca96e` | `868d7848-c3ba-5927-bd3b-d2e5a9cca96e` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 36 | **谢谢** | `xièxie` | cảm ơn | `77665544-3322-4110-a099-887766554433` | `29771f36-43ad-5f67-bf22-a8fc61f82896` | `29771f36-43ad-5f67-bf22-a8fc61f82896` | `5` (`sv:1,lv:1,rc:2,vp:1`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `HIGH_FK` |
| 37 | **星期** | `xīngqī` | Tuần / thứ | `66554433-2211-4009-a988-776655443322` | `0f23d9ef-ed12-5186-a65a-8bc3a350f4b0` | `0f23d9ef-ed12-5186-a65a-8bc3a350f4b0` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 38 | **学习** | `xuéxí` | Học / học tập | `55443322-1100-4998-a877-665544332211` | `3c264a8e-b7c4-5840-a799-f465fcd4fa6f` | `3c264a8e-b7c4-5840-a799-f465fcd4fa6f` | `5` (`sv:1,lv:1,rc:2,vp:1`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `HIGH_FK` |
| 39 | **一** | `yī` | số 1 (đọc biến điệu yí trước thanh 4, yì trước thanh 1/2/3) | `44332211-0099-4887-a766-554433221100` | `0ed1f027-db68-53f8-b6db-53bb833bdbbb` | `0ed1f027-db68-53f8-b6db-53bb833bdbbb` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 40 | **有** | `yǒu` | có | `33221100-9988-4776-a655-443322110099` | `8d613286-431b-5f14-8ed7-e45ca0178168` | `8d613286-431b-5f14-8ed7-e45ca0178168` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 41 | **月** | `yuè` | Tháng | `22110099-8877-4665-a544-332211009988` | `d2e5ae40-9d1c-5436-99a4-0403d8a7a4fc` | `d2e5ae40-9d1c-5436-99a4-0403d8a7a4fc` | `2` (`sv:1,lv:1,rc:0,vp:0`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `MEDIUM` |
| 42 | **再见** | `zàijiàn` | tạm biệt, hẹn gặp lại | `11009988-7766-4554-a433-221100998877` | `4b0c6509-4af7-53e6-92bb-51b68cc8285b` | `4b0c6509-4af7-53e6-92bb-51b68cc8285b` | `5` (`sv:1,lv:1,rc:2,vp:1`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `HIGH_FK` |
| 43 | **中国** | `Zhōngguó` | Trung Quốc | `00998877-6655-4443-a322-110099887766` | `d610982b-750e-5c68-b58e-4ae39f8badaf` | `d610982b-750e-5c68-b58e-4ae39f8badaf` | `5` (`sv:1,lv:1,rc:2,vp:1`) | `PRESERVE_PILOT_UUID_AND_UPDATE_METADATA` | `HIGH_FK` |
| 44 | **越南** *(Ngoài 300)* | `Yuènán` | Việt Nam (tên quốc gia bổ trợ trong bài) | `null` | `aa4a8f04-c772-54ef-a296-a7fd0a6d37c3` | `aa4a8f04-c772-54ef-a296-a7fd0a6d37c3` | `1` (`sv:0,lv:1,rc:0,vp:0`) | `RETAIN_SUPPLEMENTARY_PILOT_ROW` | `LOW` |

### 2.2. Nhóm C: 257 Từ HSK 1 Mới (Hiện chỉ có trong JSON, chưa có dòng trên `public.vocabulary` Cloud)

| Từ tiêu biểu | `canonical_hanzi` | `canonical_pinyin` | `canonical_meaning_vi` | `canonical_source_id` / `effective_database_id` | `pilot_v1_id` | `references_count` | `migration_action` | `risk_level` |
| :---: | :---: | :---: | :--- | :--- | :---: | :---: | :--- | :---: |
| No. 9 | **杯子** | `bēizi` | cái cốc, cái ly | `41763d1e-293b-46a2-a451-53693a384375` | `null` | `0` | `INSERT_NEW_PUBLISHED_VOCAB_WITH_MD5_UUID` | `LOW_NEW_ROW` |
| No. 14 | **不客气** | `bú kèqi` | Không có chi / đừng khách sáo | `cc110c32-e985-4c00-a316-d86a9155d69b` | `null` | `0` | `INSERT_NEW_PUBLISHED_VOCAB_WITH_MD5_UUID` | `LOW_NEW_ROW` |
| No. 28 | **大学生** | `dàxuéshēng` | sinh viên đại học | `44903d61-9620-4187-a030-976186832693` | `null` | `0` | `INSERT_NEW_PUBLISHED_VOCAB_WITH_MD5_UUID` | `LOW_NEW_ROW` |
| No. 287 | **只** | `zhī` | con, chiếc (lượng từ cho động vật); phân biệt với phó từ zhǐ (chỉ) | `af35da73-05c0-4bf4-a391-72917bc4898b` | `null` | `0` | `INSERT_NEW_PUBLISHED_VOCAB_WITH_MD5_UUID` | `LOW_NEW_ROW` |
| *(253 từ còn lại)* | `爱` .. `做饭` | Chuẩn Sprint 8N | Tiếng Việt thuần Việt chuẩn Sprint 8N | MD5(`hsk1_word_${hanzi}`) | `null` | `0` | `INSERT_NEW_PUBLISHED_VOCAB_WITH_MD5_UUID` | `LOW_NEW_ROW` |
