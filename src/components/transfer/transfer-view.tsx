'use client';

import { useState } from 'react';
import { Transfer, TransferItem } from '@/types';
import { FilePreview } from './file-preview';
import { TextDisplay } from './text-display';
import { formatFileSize } from '../send/dropzone';
import { PillButton } from '@/components/ui/pill-button';
import { Download, AlertCircle, Clock, FileArchive, Loader2 } from 'lucide-react';
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
      saveAs(zipContent, `ZeesuSEND_${transfer.transfer_key}.zip`);
    } catch (err: any) {
      console.error('Download All error:', err);
      setDownloadError(err.message || 'Failed to generate ZIP download.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#ffffff] border border-[#191314]/15 rounded-[32px] p-6 sm:p-10 space-y-6 shadow-xl animate-fadeIn">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#191314]/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#ecf95a] text-[#191314] font-mono text-sm font-extrabold tracking-widest border border-[#191314]/15">
              {transfer.transfer_key}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#f4f4f4] text-[#191314] font-bold uppercase tracking-wider border border-[#191314]/10">
              {transfer.status}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#191314] tracking-tight mt-2">
            {textItem ? 'Shared Text Transfer' : `${fileItems.length} File${fileItems.length > 1 ? 's' : ''} Ready`}
          </h2>
        </div>

        <div className="text-left sm:text-right text-xs text-[#191314]/70 space-y-1 font-mono">
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
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs sm:text-sm flex items-center gap-3 font-mono">
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
                  <PillButton
                    variant="dark"
                    size="sm"
                    onClick={() => handleSingleDownload(item)}
                    disabled={isDownloading}
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Download {item.file_name}
                  </PillButton>
                </div>
              </div>
            ))}
          </div>

          {/* DOWNLOAD ALL BUTTON FOR MULTIPLE FILES */}
          {fileItems.length > 1 && (
            <div className="pt-6 border-t border-[#191314]/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
              <span className="text-xs text-[#191314]/70">
                Total size: {formatFileSize(fileItems.reduce((acc, f) => acc + (f.file_size || 0), 0))}
              </span>

              <PillButton
                variant="primary"
                size="md"
                onClick={handleDownloadAll}
                disabled={isDownloading}
                className="w-full sm:w-auto"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#191314]" />
                    <span>Preparing Download...</span>
                  </>
                ) : (
                  <>
                    <FileArchive className="w-4 h-4 mr-1" />
                    <span>Download All (.ZIP) ↗</span>
                  </>
                )}
              </PillButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
