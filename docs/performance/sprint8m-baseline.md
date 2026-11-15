# HanLearn – Sprint 8M: Performance Baseline & Profiling Report

**Thời gian đo lường**: 2026-11-16T00:43:00+07:00  
**Môi trường đo lường**: 
- Local Production Server (`next start` on Node.js 22, Port 3000, Webpack production build, `--max-http-header-size=65536`)
- Cloud Database: Supabase Cloud Development `hhgxrjqkuwdgurphopok` (AWS us-east-1)
- Browser: Headless Google Chrome 131+ qua Playwright (Viewport 1280x800)
- Mạng: Dedicated Broadband kết nối Supabase Cloud

---

## 1. Bảng Tổng hợp Baseline Toàn hệ thống (Trước Tối ưu)

| STT | Thao tác (Operation) | p50 (ms) | p95 (ms) | Server Time (ms) | DB Time (ms) | Requests | Điểm nghẽn chính (Main Bottleneck) | Bằng chứng (Evidence) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| **A** | **Main Navigation** | | | | | | | |
| 1 | Dashboard $\rightarrow$ Roadmap | 2,519 | 2,660 | 1,820 | 45 | 40 | Sequential await `getActiveSyllabus`, unmemoized course filter, 4 full catalog reads | Playwright benchmark, 40 HTTP reqs |
| 2 | Roadmap $\rightarrow$ Practice | 1,828 | 5,579 | 1,410 | 25 | 38 | Sync reading & parsing 207KB `practice_bank.json` on disk, sequential history query | `fs.readFileSync` 207KB on every hit |
| 3 | Practice $\rightarrow$ Vocabulary | 5,010 | 6,218 | 3,950 | 60 | 56 | 300 words dynamic catalog fetch + audio asset join + progress mapping waterfall | 56 requests, TTFB > 3.8s |
| 4 | Vocabulary $\rightarrow$ Review | 3,851 | 4,274 | 2,890 | 40 | 45 | Review view queries `review_cards`, counts `review_events`, chunked `vocabulary` queries | `getReviewView` chunked fetches |
| 5 | Review $\rightarrow$ Exam | 3,210 | 5,638 | 2,420 | 35 | 51 | Exam attempts history query waterfall without parallelization | 51 requests |
| 6 | Exam $\rightarrow$ Dashboard | 4,035 | 25,378 | 3,120 | 80 | 43 | 10 independent queries in `getDashboard()` with heavy unmemoized sets | Cold start p95 up to 25s |
| **B** | **Lesson Navigation** | | | | | | | |
| 7 | Roadmap $\rightarrow$ Bài 1 (Lesson 1) | 1,982 | 5,189 | 1,450 | 30 | 31 | Full lesson bundle resolution + stage progress table read waterfall | 31 requests |
| 8 | Chặng 1 $\rightarrow$ Chặng 2 (Internal) | 4 | 30 | 0 | 0 | 0 | Client state update (UI instant), nhưng gửi background mutation chưa debounce | Client-only render |
| 9 | Chuyển nhóm: Từ vựng $\rightarrow$ Ngữ pháp | 7 | 7 | 0 | 0 | 0 | Client state update | Client-only render |
| 10 | Hoàn thành & Tiếp tục (Stage) | 4 | 5 | 0 | 0 | 0 | LocalStorage sync + unawaited server action | Client instant, server unblocked |
| 11 | Bài 1 $\rightarrow$ Bài 2 (Lesson Switcher) | 2,120 | 4,890 | 1,600 | 35 | 33 | Hard navigation không prefetch next lesson, tải lại bundle từ đầu | Next.js full page route transition |
| 12 | Lesson Reader $\rightarrow$ Roadmap | 3,961 | 8,077 | 2,850 | 50 | 48 | `lesson_progress` revalidation purge cache, ép re-render toàn bộ 32 bài | Cache invalidated, full SSR re-fetch |
| **C** | **Practice Navigation** | | | | | | | |
| 13 | Đổi Skill Tab (Practice Center) | 129 | 258 | 0 | 0 | 0 | Client state re-filter 56 sets, không sync URL searchParams | Mất tab khi bấm Back / Reload |
| 14 | Practice Center $\rightarrow$ Practice Set | 2,090 | 3,059 | 1,520 | 20 | 48 | Đọc lại 207KB JSON từ disk, khởi tạo lại component | 48 requests |
| 15 | Chuyển câu 1 $\rightarrow$ câu 2 | 26 | 42 | 0 | 0 | 0 | Client state memoized | Instant (< 50ms) |
| 16 | Practice Set $\rightarrow$ Practice Center | 1,850 | 3,200 | 1,400 | 25 | 40 | Mất vị trí bộ lọc Unit, reset về mặc định | URL params thiếu state preservation |
| **D** | **SRS Flashcard Review** | | | | | | | |
| 17 | Lật Flashcard (Flip Card) | 8 | 194 | 0 | 0 | 0 | Client CSS transition & React state | Instant |
| 18 | Đánh giá SRS (Quên / Khó / Đã nhớ) | **1,205** | **2,450** | **1,205** | 30 | 3 | **BLOCKING SERVER ACTION**: UI chờ đợi toàn bộ RPC (330ms) + Read confirmation (288ms) + Refetch cards (298ms) + Refetch vocab (288ms) | Client bị treo 1.2s trước khi hiện thẻ tiếp theo! |
| 19 | Reload trang Review | 3,420 | 4,100 | 2,600 | 45 | 42 | Full SSR fetch of due queue | 42 requests |

---

## 2. Phân tích Chi tiết 4 Điểm nghẽn Nghiêm trọng Nhất

### Điểm nghẽn 1: SRS Blocking Wait trên mỗi lần bấm Đánh giá (Severity: CRITICAL)
- **Vị trí**: [`src/features/review/components/review-player.tsx`](file:///d:/nam4/prj/HanLearn/src/features/review/components/review-player.tsx) & [`src/features/review/actions.ts`](file:///d:/nam4/prj/HanLearn/src/features/review/actions.ts)
- **Cơ chế**: Khi người học bấm "Đã nhớ", hàm `send()` gọi `await submit(input)`. 
  - Trong `submitReview`, server thực thi 4 bước tuần tự qua mạng:
    1. RPC `submit_review`: 330ms
    2. Read `review_events`: 288ms
    3. Read `review_cards`: 298ms
    4. Chunked fetch `vocabulary`: 288ms
    - **Tổng thời gian Server Action: 1,205ms**.
  - Client set `pending = true`, disable mọi nút bấm, hiển thị loading và **chờ đủ 1,205ms** trước khi gọi `setFlipped(false)` và `setView(result.view)` để hiện thẻ số 2.
- **Giải pháp**:
  - **Optimistic UI Transition**: Người học bấm đánh giá $\rightarrow$ Thẻ số 2 xuất hiện NGAY LẬP TỨC (< 20ms) từ mảng `cards` đã có sẵn trong bộ nhớ! Trạng thái chuyển sang "Đang lưu...".
  - **Background Persistence Queue**: Gửi Server Action ngầm trong background với `idempotencyKey` và `expectedVersion` ổn định. Khi nhận receipt $\rightarrow$ cập nhật "Đã lưu". Nếu lỗi $\rightarrow$ kích hoạt trạng thái "Cần thử lại".
  - **Server Action Streamlining**: Tái sử dụng in-memory cache cho dữ liệu tĩnh vocabulary, tránh revalidate path trên từng thẻ đơn lẻ mà dồn vào cuối phiên.

### Điểm nghẽn 2: Đọc file đĩa đồng bộ 207KB `practice_bank.json` mỗi request (Severity: HIGH)
- **Vị trí**: [`src/features/practice/queries.ts`](file:///d:/nam4/prj/HanLearn/src/features/practice/queries.ts)
- **Cơ chế**: `loadPracticeBank()` gọi `fs.readFileSync` đọc file 207KB và `JSON.parse` trên MỌI request vào `/practice` hoặc `/practice/[setId]`. Block Node.js event loop và tốn 15–30ms CPU time không cần thiết.
- **Giải pháp**: Sử dụng In-Memory Module Singleton Cache: chỉ đọc đĩa và parse JSON 1 lần duy nhất khi Node.js process khởi động.

### Điểm nghẽn 3: Thất thoát trạng thái bộ lọc khi quay lại Practice Center (Severity: MEDIUM-HIGH)
- **Vị trí**: [`src/features/practice/components/practice-center.tsx`](file:///d:/nam4/prj/HanLearn/src/features/practice/components/practice-center.tsx)
- **Cơ chế**: Bộ lọc Skill, Unit, Difficulty chỉ lưu trong React state nội bộ. Khi người dùng bấm vào một bài tập rồi bấm Back, URL không chứa tham số nên trang reset về Skill đầu tiên ("Từ vựng") và đóng toàn bộ Accordion Unit.
- **Giải pháp**: Đồng bộ state 2 chiều với URL Search Parameters (`?skill=...&unit=...&diff=...`) qua `window.history.replaceState` mà không gây re-render hay reload route.

### Điểm nghẽn 4: Waterfalls và Cache Invalidation quá rộng trên App Router (Severity: HIGH)
- **Vị trí**: [`src/features/dashboard/queries.ts`](file:///d:/nam4/prj/HanLearn/src/features/dashboard/queries.ts), [`src/features/roadmap/queries.ts`](file:///d:/nam4/prj/HanLearn/src/features/roadmap/queries.ts), [`src/features/lessons/actions.ts`](file:///d:/nam4/prj/HanLearn/src/features/lessons/actions.ts)
- **Cơ chế**:
  - `getCurriculum()` gọi `await getActiveSyllabus()` trước rồi mới gọi `Promise.all` $\rightarrow$ tuần tự mất thêm 1 RTT (280ms).
  - Khi hoàn thành chặng học, `revalidatePath` xóa sạch route cache của toàn bộ `/roadmap` và `/dashboard`, khiến lần truy cập tiếp theo phải fetch lại từ đầu 40+ queries.
- **Giải pháp**:
  - Song song hóa các truy vấn độc lập (`Promise.all`).
  - Cung cấp in-memory cache cho danh mục giáo trình tĩnh HSK 1 (Courses, Units, Lessons, Vocabulary).
  - Tối ưu hóa Next.js Link prefetch cho các bài học kế tiếp.
