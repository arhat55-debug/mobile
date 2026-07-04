import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { uploadToCloudinary, optimizedUrl } from "../lib/cloudinary";
import { useToast } from "./Toast";
import { cn } from "../utils/cn";

interface UploadingItem {
  id: string;
  name: string;
  progress: number;
  previewUrl: string;
}

export function ImageUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const { toast } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState<UploadingItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (!list.length) return;

      for (const file of list) {
        if (file.size > 10 * 1024 * 1024) {
          toast(`${file.name} нь 10MB-с хэтэрсэн тул алгасав.`, "error");
          continue;
        }
        const id = crypto.randomUUID();
        const previewUrl = URL.createObjectURL(file);
        setUploading((prev) => [...prev, { id, name: file.name, progress: 0, previewUrl }]);
        try {
          const res = await uploadToCloudinary(file, (p) =>
            setUploading((prev) => prev.map((u) => (u.id === id ? { ...u, progress: p } : u))),
          );
          onChange([...value, res.url]);
        } catch (err) {
          toast(err instanceof Error ? err.message : "Байршуулах үед алдаа гарлаа", "error");
        } finally {
          URL.revokeObjectURL(previewUrl);
          setUploading((prev) => prev.filter((u) => u.id !== id));
        }
      }
    },
    [onChange, value, toast],
  );

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed px-6 py-10 text-center transition",
          dragOver
            ? "border-white/50 bg-white/[0.05]"
            : "border-line bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]",
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-white/[0.03] transition group-hover:scale-105">
          <UploadCloud className="h-6 w-6 text-white/70" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Зургаа энд чирж оруулна уу</p>
          <p className="text-xs text-white/40">эсвэл дарж сонгоно уу — JPG / PNG, 10MB хүртэл</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {(value.length > 0 || uploading.length > 0) && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          <AnimatePresence>
            {value.map((url) => (
              <motion.div
                key={url}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-square overflow-hidden rounded-xl border border-line"
              >
                <img
                  src={optimizedUrl(url, { width: 240, height: 240 })}
                  alt="upload"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onChange(value.filter((u) => u !== url))}
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-black/70 text-white opacity-0 backdrop-blur transition group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
            {uploading.map((u) => (
              <motion.div
                key={u.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square overflow-hidden rounded-xl border border-line"
              >
                <img src={u.previewUrl} alt={u.name} className="h-full w-full object-cover opacity-40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 px-2">
                  <ImagePlus className="h-5 w-5 text-white/70" />
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-white transition-all"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-white/70">{u.progress}%</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
