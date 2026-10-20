"use client";

/* eslint-disable @next/next/no-img-element -- uploaded images are served from Supabase Storage */
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Drag-and-drop (or click-to-pick) image upload to the public `media` bucket.
 * Submits the resulting public URL through a hidden input named `name`.
 */
export function ImageDropzone({
  name,
  userId,
  defaultUrl,
  shape = "wide",
  hint,
  onChange,
}: {
  name: string;
  userId: string;
  defaultUrl: string | null;
  shape?: "round" | "square" | "wide";
  hint?: string;
  onChange?: (url: string | null) => void;
}) {
  const [url, setUrl] = useState(defaultUrl);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function update(next: string | null) {
    setUrl(next);
    onChange?.(next);
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!TYPES.includes(file.type)) return setError("Use a JPG, PNG, WebP or GIF image.");
    if (file.size > MAX_BYTES) return setError("Images must be 5 MB or smaller.");

    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${name}-${Date.now()}.${ext}`;
    const supabase = createClient();
    const { error: uploadError } = await supabase.storage.from("media").upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
    });
    setUploading(false);
    if (uploadError) return setError(`Upload failed: ${uploadError.message}`);

    update(supabase.storage.from("media").getPublicUrl(path).data.publicUrl);
  }

  const frame =
    shape === "wide" ? "aspect-[3/1] w-full rounded-2xl" : shape === "round" ? "h-28 w-28 rounded-full" : "h-28 w-28 rounded-2xl";

  return (
    <div className={shape === "wide" ? "" : "flex items-center gap-4"}>
      <input type="hidden" name={name} value={url ?? ""} />
      <input
        ref={inputRef}
        type="file"
        accept={TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          upload(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files?.[0]);
        }}
        aria-label={url ? "Replace image" : "Upload image"}
        className={`group relative flex shrink-0 items-center justify-center overflow-hidden border-2 border-dashed transition ${frame} ${
          dragging ? "border-brand bg-brand-soft" : url ? "border-transparent" : "border-border bg-card-2 hover:border-brand/50"
        }`}
      >
        {url && <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        <span
          className={`relative flex flex-col items-center gap-1 px-3 text-center text-xs font-medium ${
            url ? "rounded-lg bg-black/55 px-3 py-2 text-white opacity-0 transition group-hover:opacity-100" : "text-muted"
          } ${dragging ? "opacity-100" : ""}`}
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          {uploading ? "Uploading…" : url ? "Drop or click to replace" : shape === "wide" ? "Drag an image here or click to browse" : "Drop or click"}
        </span>
      </button>
      <div className={shape === "wide" ? "mt-2 flex items-center justify-between gap-3" : "space-y-1"}>
        <p className="text-xs text-muted">{hint ?? "JPG, PNG, WebP or GIF, up to 5 MB."}</p>
        {url && !uploading && (
          <button type="button" onClick={() => update(null)} className="btn-ghost px-2 py-1 text-xs">
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        )}
      </div>
      {error && <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
