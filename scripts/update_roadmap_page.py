import re

def main():
    with open("src/app/(app)/roadmap/page.tsx", "r", encoding="utf-8") as f:
        content = f.read()

    target_start = "{/* Lesson 21 */}"
    target_end = "{/* HSK 1 Official Mock Exam Banner */}"

    idx_start = content.find(target_start)
    idx_end = content.find(target_end)

    if idx_start == -1 or idx_end == -1:
        print("Could not find targets:", idx_start, idx_end)
        return

    replacement = """{/* Lesson 21 */}
                        <details id="lesson-hsk1-lesson-21" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">21</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 21: Giao tiếp qua điện thoại (喂，请问您找谁？)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (11 từ vựng: 电话, 打电话, 手机, 喂, 说, 说话, 听见, 看见, 见, 请, 请问)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Luyện tập kỹ năng nghe và gọi điện thoại thực tế, lời mời chào lịch sự và các động từ tri giác.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-21"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 21 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 22 */}
                        <details id="lesson-hsk1-lesson-22" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">22</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 22: Bạn bè &amp; Tương trợ (很高兴认识你)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (10 từ vựng: 问, 帮, 帮助, 朋友, 男朋友, 女朋友, 认识, 高兴, 先生, 女士)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Cách xưng hô lịch sự với quý ông quý cô, làm quen bạn mới và đề nghị giúp đỡ lẫn nhau.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-22"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 22 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 23 */}
                        <details id="lesson-hsk1-lesson-23" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">23</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 23: Đại từ nhân xưng &amp; Số nhiều (我们大家都是朋友)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (11 từ vựng: 大家, 您, 他, 她, 它, 他们, 她们, 它们, 我们, 你们, 们)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Hệ thống toàn bộ đại từ nhân xưng số ít, số nhiều và hậu tố 们 phát âm thanh nhẹ.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-23"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 23 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 24 */}
                        <details id="lesson-hsk1-lesson-24" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">24</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 24: Đại từ chỉ định &amp; Nghi vấn (这是什么？那是哪儿？)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (14 từ vựng: 这, 这个, 这些, 这儿, 这里, 那, 那个, 那些, 那儿, 那里, 哪, 哪个, 哪里, 哪些)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Phân biệt chính xác cự ly gần (这), cự ly xa (那) và nghi vấn (哪), cùng các hình thái số nhiều và chỉ nơi chốn.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-24"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 24 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 25 */}
                        <details id="lesson-hsk1-lesson-25" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">25</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 25: Phương hướng &amp; Vị trí không gian (学校在医院旁边)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (15 từ vựng: 上, 下, 里, 外, 旁, 旁边, 边, 东, 西, 南, 北, 前边, 后边, 里边, 外边)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Định vị phương vị chuẩn người bản ngữ: bốn hướng Đông Tây Nam Bắc, trên dưới trong ngoài và bên cạnh.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-25"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 25 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Checkpoint 5 */}
                        <details id="lesson-hsk1-checkpoint-05" className="scroll-mt-8 rounded-xl border border-primary/40 bg-primary/10">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">CP5</span>
                            <Sparkles size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Chặng 5: Đánh giá Năng lực Giao tiếp &amp; Phương vị (Bài 21–25)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                Cột mốc đánh giá Chặng 5 · Nghe gọi điện thoại, đại từ nhân xưng, đại từ chỉ định và định vị không gian
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Bài kiểm tra chặng tổng kết các kỹ năng xã hội, giao tiếp điện thoại, chỉ đường và ngữ pháp phương vị từ.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 30 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-checkpoint-05"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Làm bài Đánh giá Chặng 5
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 26 */}
                        <details id="lesson-hsk1-lesson-26" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">26</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 26: Số đếm lớn, Hàng vạn &amp; Phân số (八千五百与一半)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (10 từ vựng: 零, 八, 九, 十, 百, 千, 万, 两, 半, 一半)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Hệ thống số đếm lớn từ hàng trăm đến hàng vạn, cách dùng số hai 两 và phân số một nửa 一半.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-26"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 26 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 27 */}
                        <details id="lesson-hsk1-lesson-27" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">27</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 27: Lượng từ, Tuổi tác &amp; Ước lượng (几只小狗与几岁)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (12 từ vựng: 些, 一些, 有些, 有的, 几, 只, 岁, 第, 多, 少, 一点儿, 一下)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Nắm vững lượng từ con vật 只, số thứ tự 第, hỏi tuổi 岁, ước lượng 一点儿 và động lượng 一下.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-27"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 27 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 28 */}
                        <details id="lesson-hsk1-lesson-28" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">28</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 28: Lịch trình, Ngày tháng &amp; Các buổi (星期天早上见)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (13 từ vựng: 年, 月, 日, 号, 星期, 星期天, 星期日, 白天, 早上, 中午, 晚上, 早, 晚)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Trật tự ngày tháng từ lớn đến nhỏ, các thứ trong tuần, Chủ nhật và các buổi sáng/trưa/tối.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-28"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 28 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 29 */}
                        <details id="lesson-hsk1-lesson-29" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">29</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 29: Khoảng thời gian, Trước sau &amp; Quá khứ tương lai (去年、今年与明年)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (11 từ vựng: 分钟, 小时, 时间, 时候, 昨天, 明天, 今年, 明年, 去年, 以前, 以后)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Khoảng thời gian phút/tiếng (分钟/小时), cấu trúc ...的时候, trước/sau (以前/以后) và dòng thời gian năm.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-29"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 29 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 30 */}
                        <details id="lesson-hsk1-lesson-30" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">30</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 30: Động từ tâm lý &amp; Năng nguyện (我想学好中文)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (12 từ vựng: 爱, 喜欢, 觉得, 知道, 想, 希望, 可以, 能, 会, 要, 给, 找)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Nắm trọn vẹn nhóm động từ năng nguyện (会/能/可以/想/要) và bày tỏ cảm nghĩ, mong ước.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-30"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 30 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 31 */}
                        <details id="lesson-hsk1-lesson-31" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">31</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 31: Phó từ mức độ &amp; Thời thái (我正在复习呢)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (13 từ vựng: 别, 不要, 非常, 真, 太, 最, 还, 也, 都, 正在, 已经, 有点儿, 再)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Bổ ngữ mức độ cao (非常/真/太/最), hành động tiếp diễn (正在) và khuyên can (别/不要).</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-31"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 31 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 32 */}
                        <details id="lesson-hsk1-lesson-32" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">32</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 32: Trợ từ ngữ khí &amp; Tổng hợp HSK 1 (我们一起去吧)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (13 từ vựng: 吧, 呢, 了, 怎么, 怎么样, 对, 错, 没有, 大, 小, 男, 女, 国)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Bài tổng kết trọn vẹn 300 từ vựng và toàn bộ cấu trúc câu hỏi, câu cảm thán, câu phủ định HSK 1.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-32"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 32 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Checkpoint 6 */}
                        <details id="lesson-hsk1-checkpoint-06" className="scroll-mt-8 rounded-xl border border-primary/40 bg-primary/10">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">CP6</span>
                            <Sparkles size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Chặng 6: Hoàn tất Giáo trình &amp; Đánh giá Tổng lực (Bài 26–32)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                Cột mốc hoàn tất 100% 300 từ vựng HSK 1 · Sẵn sàng bước vào đề thi thử tốt nghiệp
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Đánh giá năng lực tích hợp toàn diện: số đếm lớn, thời gian, động từ năng nguyện, phó từ mức độ và ngữ khí bản ngữ.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 30 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-checkpoint-06"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Làm bài Đánh giá Chặng 6
                              </Link>
                            </div>
                          </div>
                        </details>

                        """

    new_content = content[:idx_start] + replacement + content[idx_end:]

    # Also update Mock Exam title in roadmap banner
    new_content = new_content.replace(
        "Đề thi thử HSK 1 Chuẩn Quốc tế CTI (40 câu / 35 phút)",
        "HanLearn HSK 1 Mock Exam (Mô phỏng Đề thi thử CTI · 40 câu / 35 phút)"
    )
    new_content = new_content.replace(
        "Đề thi toàn diện bao phủ 100% 300 từ vựng đề cương HSK 2025. Cấu trúc chuẩn: 20 câu Nghe hiểu (100 điểm) + 20 câu Đọc hiểu (100 điểm), đồng hồ đếm ngược 35 phút, chấm điểm phân tích hai kỹ năng và chứng nhận kết quả.",
        "Đề thi thử mô phỏng theo đúng cấu trúc đề cương HSK 2025: 20 câu Nghe hiểu (100 điểm) + 20 câu Đọc hiểu (100 điểm), đồng hồ đếm ngược 35 phút, chấm điểm phân tích hai kỹ năng và chứng nhận kết quả rèn luyện trên HanLearn."
    )

    with open("src/app/(app)/roadmap/page.tsx", "w", encoding="utf-8") as f:
        f.write(new_content)

    print("Successfully updated src/app/(app)/roadmap/page.tsx")

if __name__ == "__main__":
    main()
