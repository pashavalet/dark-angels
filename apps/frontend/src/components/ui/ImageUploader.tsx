import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import imageCompression from 'browser-image-compression';
import { uploadImage, deleteImage } from '../../api/upload.js';
import { cn } from '../../lib/cn.js';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function ImageUploader({ value, onChange, disabled }: ImageUploaderProps) {
  const { t } = useTranslation('common');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(t('invalid_file_type', 'Invalid file type. Use JPG, PNG, or WebP'));
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t('image_too_large', 'Image too large'));
      return false;
    }
    setError(null);
    return true;
  };

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setUploading(true);
    setError(null);

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
      const result = await uploadImage(compressed);
      onChange(result.url);
      setPreview(result.url);
    } catch {
      setError(t('upload_error'));
      URL.revokeObjectURL(previewUrl);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = async () => {
    if (value) {
      try {
        await deleteImage(value.split('/').pop() || '');
      } catch {
        // ignore delete errors
      }
    }
    onChange(null);
    setPreview(null);
    setError(null);
  };

  const displayedImage = preview || value;

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={handleClick}
      className={cn(
        'flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-8 transition-colors',
        isDragging ? 'border-accent bg-accent/5' : 'border-border bg-bg-card',
        'focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
        (disabled || uploading) && 'opacity-50 pointer-events-none',
        !disabled && !uploading && 'cursor-pointer',
      )}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={t('upload_image', 'Upload image')}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />

      {displayedImage ? (
        <div className="relative w-full">
          <img
            src={displayedImage}
            alt={t('preview_alt')}
            className="mx-auto max-h-64 rounded-lg object-contain"
          />
          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleClick(); }}
              className="min-h-[44px] min-w-[44px] rounded-lg border border-border px-4 text-sm text-text-primary transition-colors hover:border-accent/30 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              {t('change_image', 'Change')}
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              className="min-h-[44px] min-w-[44px] rounded-lg border border-red-500/40 px-4 text-sm text-red-400 transition-colors hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              {t('remove_image', 'Remove')}
            </button>
          </div>
        </div>
      ) : uploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
          <p className="text-sm text-text-secondary">{t('uploading', 'Uploading...')}</p>
        </div>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-10 w-10 text-text-muted"
          >
            <path d="M12 16V4m0 0L8 8m4-4l4 4" />
            <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
          </svg>
          <p className="text-sm text-text-secondary">
            {t('drop_image_here', 'Drop image here or click to browse')}
          </p>
          <p className="text-xs text-text-muted">
            JPG, PNG, WebP &middot; {t('max_size', 'Max 10MB')}
          </p>
        </>
      )}

      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}
    </div>
  );
}
