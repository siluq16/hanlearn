"use client";
import { useActionState, useEffect } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { toast } from "sonner";
import type { Profile, Syllabus } from "@/types/database";
import { saveSettings } from "@/features/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export function SettingsForm({
  profile,
  syllabuses,
}: {
  profile: Profile | null;
  syllabuses: Syllabus[];
}) {
  const [state, action, pending] = useActionState(saveSettings, {});
  useEffect(() => {
    if (state.success) toast.success("Đã lưu hồ sơ học tập.");
  }, [state]);
  const selectClass =
    "h-12 w-full rounded-xl border border-input bg-background px-3 text-sm";
  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="display_name">
          Tên hiển thị
        </label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={profile?.display_name ?? ""}
          maxLength={80}
          placeholder="Bạn muốn được gọi là gì?"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="baseline_hsk_level">
            HSK hiện tại (tự khai báo)
          </label>
          <select
            id="baseline_hsk_level"
            name="baseline_hsk_level"
            className={selectClass}
            defaultValue={profile?.baseline_hsk_level ?? 0}
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i} value={i}>
                {i === 0 ? "Mới bắt đầu" : `HSK ${i}`}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="target_hsk_level">
            Mục tiêu HSK
          </label>
          <select
            id="target_hsk_level"
            name="target_hsk_level"
            className={selectClass}
            defaultValue={profile?.target_hsk_level ?? 5}
          >
            {Array.from({ length: 9 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                HSK {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="preferred_syllabus_id">
          Syllabus học tập
        </label>
        <select
          id="preferred_syllabus_id"
          name="preferred_syllabus_id"
          className={selectClass}
          defaultValue={profile?.preferred_syllabus_id ?? ""}
        >
          <option value="">
            {syllabuses.length
              ? "Dùng syllabus được chọn mặc định"
              : "Chưa có syllabus được phát hành"}
          </option>
          {syllabuses.map((s) => (
            <option key={s.id} value={s.id}>
              {s.display_name} · {s.code}
            </option>
          ))}
        </select>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-primary">
          Đã lưu hồ sơ. Các thiết lập sẽ được khôi phục khi bạn tải lại trang.
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? (
          <LoaderCircle className="animate-spin motion-reduce:animate-none" />
        ) : (
          <Save />
        )}
        {pending ? "Đang lưu…" : "Lưu thiết lập"}
      </Button>
    </form>
  );
}
