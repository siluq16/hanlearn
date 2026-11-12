"use client";
import { useState } from "react";
import { Volume2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
export function AudioPlayer({ vocabularyId }: { vocabularyId: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/vocabulary/${vocabularyId}/audio`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error();
      const body: unknown = await response.json();
      if (
        !body ||
        typeof body !== "object" ||
        !("url" in body) ||
        typeof body.url !== "string"
      )
        throw new Error();
      setSrc(body.url);
    } catch {
      setError(
        "Audio hiện chưa khả dụng. Bạn vẫn có thể học phần chữ và ví dụ.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      {src ? (
        <audio
          controls
          src={src}
          className="max-w-full"
          onError={() => {
            setSrc(null);
            setError(
              "Audio đã hết hạn hoặc chưa truy cập được. Hãy tải lại khi cần.",
            );
          }}
        >
          Trình duyệt không hỗ trợ audio.
        </audio>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={load}
          disabled={loading}
        >
          {loading ? (
            <LoaderCircle className="animate-spin motion-reduce:animate-none" />
          ) : (
            <Volume2 />
          )}
          Nghe phát âm
        </Button>
      )}
      {error && (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          {error}
        </p>
      )}
    </div>
  );
}
