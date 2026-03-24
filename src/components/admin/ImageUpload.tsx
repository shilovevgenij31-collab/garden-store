import { useState, useRef, useCallback } from "react";
import { useUploadImage } from "@/hooks/useAdmin";
import { Upload, X, ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const upload = useUploadImage();

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      upload.mutate(file, {
        onSuccess: (data) => onChange(data.url),
      });
    },
    [upload, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [onChange]);

  return (
    <div>
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Превью"
            className="w-32 h-32 object-cover"
            style={{
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
            style={{
              background: "var(--accent-rose)",
              color: "var(--white)",
            }}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className="p-8 text-center cursor-pointer transition-all"
          style={{
            border: `2px dashed ${dragOver ? "var(--olive)" : "var(--border)"}`,
            borderRadius: "var(--radius)",
            background: dragOver ? "var(--bg-beige)" : "var(--bg-cream)",
          }}
        >
          {upload.isPending ? (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-8 h-8 rounded-full animate-spin"
                style={{
                  borderWidth: "2px",
                  borderStyle: "solid",
                  borderColor: "var(--bg-beige)",
                  borderTopColor: "var(--olive)",
                }}
              />
              <span
                className="text-sm"
                style={{ color: "var(--text-light)" }}
              >
                Загрузка...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon
                className="w-8 h-8"
                style={{ color: "var(--olive-muted)" }}
              />
              <span
                className="text-sm"
                style={{ color: "var(--text-light)" }}
              >
                Перетащите изображение или нажмите для выбора
              </span>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {upload.isError && (
        <p className="text-sm mt-2" style={{ color: "var(--accent-rose)" }}>
          {upload.error instanceof Error
            ? upload.error.message
            : "Ошибка загрузки"}
        </p>
      )}

      {!value && !upload.isPending && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-outline mt-3"
          style={{ fontSize: "0.85rem", padding: "8px 20px" }}
        >
          <Upload className="w-4 h-4" />
          Выбрать файл
        </button>
      )}
    </div>
  );
}
