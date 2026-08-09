'use client';

import { useState } from 'react';
import Image from 'next/image';
import { TransferItem } from '@/types';
import { formatFileSize } from '../send/dropzone';
import { File, FileText, Image as ImageIcon, Video, Eye, X } from 'lucide-react';

interface FilePreviewProps {
  item: TransferItem;
}

export function FilePreview({ item }: FilePreviewProps) {
  const [showModal, setShowModal] = useState(false);

  const isImage = item.type === 'image' || (item.mime_type && item.mime_type.startsWith('image/'));
  const isVideo = item.mime_type && item.mime_type.startsWith('video/');
  const isPdf = item.mime_type && item.mime_type.includes('pdf');

  return (
    <div className="space-y-3">
      {/* PREVIEW CONTAINER */}
      {isImage && item.signed_url ? (
        <div className="relative group rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-72 flex items-center justify-center p-2">
          {/* SVG safety check: if SVG, use standard img tag or unoptimized next/image */}
          {item.mime_type?.includes('svg') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.signed_url}
              alt={item.file_name || 'Image Preview'}
              className="max-h-64 object-contain rounded-xl"
            />
          ) : (
            <div className="relative w-full h-64">
              <Image
                src={item.signed_url}
                alt={item.file_name || 'Image Preview'}
                fill
                className="object-contain rounded-xl"
                unoptimized
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-950/70 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs font-medium"
          >
            <Eye className="w-4 h-4" />
            <span>Full View</span>
          </button>
        </div>
      ) : isVideo && item.signed_url ? (
        <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 max-h-72 flex items-center justify-center">
          <video src={item.signed_url} controls className="max-h-64 w-full" />
        </div>
      ) : null}

      {/* FULL PREVIEW MODAL */}
      {showModal && item.signed_url && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-4xl max-h-[90vh] w-full bg-slate-950 rounded-3xl overflow-hidden p-2 flex flex-col items-center justify-center">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white z-10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {isImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.signed_url}
                alt={item.file_name || 'Full Image View'}
                className="max-h-[80vh] object-contain rounded-2xl"
              />
            )}

            {isPdf && (
              <iframe
                src={item.signed_url}
                className="w-full h-[80vh] rounded-2xl"
                title={item.file_name || 'PDF View'}
              />
            )}
          </div>
        </div>
      )}

      {/* FILE INFO CARD */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
        <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500 shrink-0">
          {isImage ? (
            <ImageIcon className="w-5 h-5" />
          ) : isVideo ? (
            <Video className="w-5 h-5" />
          ) : isPdf ? (
            <FileText className="w-5 h-5" />
          ) : (
            <File className="w-5 h-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {item.file_name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatFileSize(item.file_size || 0)} &bull; {item.mime_type || 'Unknown type'}
          </p>
        </div>

        {(isImage || isPdf) && item.signed_url && !showModal && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="p-2 rounded-lg text-slate-500 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
