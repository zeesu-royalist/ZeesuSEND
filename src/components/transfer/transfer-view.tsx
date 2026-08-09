'use client';

import { useState } from 'react';
import { Transfer, TransferItem } from '@/types';
import { FilePreview } from './file-preview';
import { TextDisplay } from './text-display';
import { formatFileSize } from '../send/dropzone';
import { Download, PackageCheck, AlertCircle, Clock, ShieldCheck, FileArchive, Loader2 } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface TransferViewProps {
  transfer: Transfer;
}

export function TransferView({ transfer }: TransferViewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const items = transfer.items || [];
  const textItem = items.find((i) => i.type === 'text');
  const fileItems = items.filter((i) => i.type === 'file' || i.type === 'image');

  // Single file download trigger
  const handleSingleDownload = async (item: TransferItem) => {
    setDownloadError(null);
    setIsDownloading(true);

    try {
      // Call download API to increment counter safely on server
      const res = await fetch(`/api/transfers/${transfer.transfer_key}/download`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Download failed.');
      }

      // Find the signed URL returned for this item
      const downloadItem = data.items?.find((i: any) => i.id === item.id);
      if (downloadItem?.signedUrl) {
        // Trigger browser download via dynamic link
        const a = document.createElement('a');
        a.href = downloadItem.signedUrl;
        a.download = item.file_name || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Fallback to direct stream endpoint
        window.location.href = `/api/transfers/${transfer.transfer_key}/item/${item.id}`;
      }
    } catch (err: any) {
      console.error('Download error:', err);
      setDownloadError(err.message || 'Failed to download file.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Multiple files "Download All" as ZIP archive
  const handleDownloadAll = async () => {
    setDownloadError(null);
    setIsDownloading(true);

    try {
      const res = await fetch(`/api/transfers/${transfer.transfer_key}/download`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process download.');
      }

      const zip = new JSZip();
      const returnedItems = data.items || [];

      // Fetch each file buffer and add to ZIP
      const downloadPromises = returnedItems.map(async (downloadItem: any) => {
        if (downloadItem.signedUrl && downloadItem.fileName) {
          const fileRes = await fetch(downloadItem.signedUrl);
          const blob = await fileRes.blob();
          zip.file(downloadItem.fileName, blob);
        }
      });

      await Promise.all(downloadPromises);

      const zipContent = await zip.generateAsync({ type: 'blob' });
      saveAs(zipContent, `ZeesuSend_${transfer.transfer_key}.zip`);
    } catch (err: any) {
      console.error('Download All error:', err);
      setDownloadError(err.message || 'Failed to generate ZIP download.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-mono-key text-sm font-black tracking-widest">
              {transfer.transfer_key}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold uppercase tracking-wider">
              {transfer.status}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
            {textItem ? 'Shared Text Transfer' : `${fileItems.length} File${fileItems.length > 1 ? 's' : ''} Ready`}
          </h2>
        </div>

        <div className="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <div className="flex items-center sm:justify-end gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Expires: {transfer.expires_at ? new Date(transfer.expires_at).toLocaleDateString() : 'Never'}
            </span>
          </div>
          <div>
            Downloads: {transfer.download_count} {transfer.download_limit ? `/ ${transfer.download_limit}` : '(Unlimited)'}
          </div>
        </div>
      </div>

      {downloadError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{downloadError}</span>
        </div>
      )}

      {/* TEXT ITEM DISPLAY */}
      {textItem && textItem.text_content && (
        <TextDisplay textContent={textItem.text_content} transferKey={transfer.transfer_key} />
      )}

      {/* FILES ITEM DISPLAY */}
      {fileItems.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-4">
            {fileItems.map((item) => (
              <div key={item.id} className="space-y-2">
                <FilePreview item={item} />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSingleDownload(item)}
                    disabled={isDownloading}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5 focus:outline-none"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download {item.file_name}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DOWNLOAD ALL BUTTON FOR MULTIPLE FILES */}
          {fileItems.length > 1 && (
            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Total size: {formatFileSize(fileItems.reduce((acc, f) => acc + (f.file_size || 0), 0))}
              </span>

              <button
                type="button"
                onClick={handleDownloadAll}
                disabled={isDownloading}
                className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-600/25 transition-all flex items-center justify-center gap-2"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing Download...</span>
                  </>
                ) : (
                  <>
                    <FileArchive className="w-4 h-4" />
                    <span>Download All (.ZIP)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
