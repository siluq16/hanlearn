export default function QuizUnavailable() {
  return (
    <section className="space-y-4 rounded-2xl border border-border p-6">
      <h1 className="text-xl font-semibold">
        Quiz hoặc lượt làm chưa khả dụng
      </h1>
      <p className="text-sm leading-7">
        Nội dung chưa được phát hành hoặc bạn chưa được phép truy cập. Không có
        lượt làm mới nào được tạo.
      </p>
      <a
        href="/roadmap"
        className="inline-flex min-h-11 items-center text-primary underline"
      >
        Về lộ trình
      </a>
    </section>
  );
}
