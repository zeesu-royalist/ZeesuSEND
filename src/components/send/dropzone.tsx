'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { UploadCloud, File, Image as ImageIcon, X, Plus, FileText } from 'lucide-react';

interface DropzoneProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export function Dropzone({ files, setFiles }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const openBrowse = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {files.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openBrowse}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-10 text-center transition-all flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-[#ecf95a] bg-[#ecf95a]/10 scale-[1.01]'
              : 'border-white/20 hover:border-[#ecf95a]/70 bg-white/5 hover:bg-white/10'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#ecf95a] text-[#191314] flex items-center justify-center shadow-md">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">
              {isDragging ? 'Drop files here' : 'Drop files here or click to browse'}
            </p>
            <p className="text-[11px] text-white/60 mt-1 font-mono">
              Supports images, documents, archives, videos (up to 100MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3 rounded-xl bg-white/10 border border-white/10 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-[#ecf95a] text-[#191314]">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="w-4 h-4" />
                    ) : file.type.includes('pdf') || file.type.includes('text') ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <File className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-white/60 font-mono">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="p-1.5 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={openBrowse}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ecf95a] hover:underline focus:outline-none"
            >
              <Plus className="w-4 h-4" />
              Add more files
            </button>
            <span className="text-[11px] text-white/60 font-mono">
              {files.length} file{files.length > 1 ? 's' : ''} ({formatFileSize(files.reduce((acc, f) => acc + f.size, 0))})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
