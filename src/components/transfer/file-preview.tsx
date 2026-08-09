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
        <div className="relative group rounded-2xl overflow-hidden bg-[#f4f4f4] border border-[#191314]/15 max-h-72 flex items-center justify-center p-2">
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
            className="absolute bottom-3 right-3 p-2 rounded-xl bg-[#191314] text-[#ecf95a] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs font-bold font-mono cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Full View</span>
          </button>
        </div>
      ) : isVideo && item.signed_url ? (
        <div className="rounded-2xl overflow-hidden bg-[#191314] border border-black max-h-72 flex items-center justify-center">
          <video src={item.signed_url} controls className="max-h-64 w-full" />
        </div>
      ) : null}

      {/* FULL PREVIEW MODAL */}
      {showModal && item.signed_url && (
        <div className="fixed inset-0 z-50 bg-[#191314]/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-4xl max-h-[90vh] w-full bg-[#ffffff] border border-[#191314]/20 rounded-3xl overflow-hidden p-2 flex flex-col items-center justify-center">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#191314] text-white hover:bg-black z-10 cursor-pointer"
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
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#f4f4f4] border border-[#191314]/10">
        <div className="p-2.5 rounded-xl bg-[#ecf95a] text-[#191314] shrink-0 border border-[#191314]/10">
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
          <p className="text-sm font-bold text-[#191314] truncate">
            {item.file_name}
          </p>
          <p className="text-xs text-[#191314]/70 font-mono">
            {formatFileSize(item.file_size || 0)} &bull; {item.mime_type || 'Unknown type'}
          </p>
        </div>

        {(isImage || isPdf) && item.signed_url && !showModal && (
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="p-2 rounded-lg text-[#191314]/70 hover:text-[#191314] hover:bg-[#ffffff] transition-colors cursor-pointer"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
