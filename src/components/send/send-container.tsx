'use client';

import { useState } from 'react';
import { Dropzone } from './dropzone';
import { TextEditor } from './text-editor';
import { TransferSettings } from './transfer-settings';
import { SuccessCard } from './success-card';
import { ExpirationOption, DownloadLimitOption, TransferSuccessPayload } from '@/types';
import { Files, FileText, ArrowUpRight, Loader2, AlertCircle } from 'lucide-react';

export function SendContainer() {
  const [mode, setMode] = useState<'file' | 'text'>('file');
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState('');
  const [expiration, setExpiration] = useState<ExpirationOption>('24h');
  const [downloadLimit, setDownloadLimit] = useState<DownloadLimitOption>('unlimited');

  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successPayload, setSuccessPayload] = useState<TransferSuccessPayload | null>(null);

  const handleSend = async () => {
    setError(null);
    setUploadStatus(null);

    if (mode === 'file' && files.length === 0) {
      setError('Please select at least one file to send.');
      return;
    }

    if (mode === 'text' && !text.trim()) {
      setError('Please enter some text to send.');
      return;
    }

    setIsLoading(true);
    let createdKey: string | null = null;

    try {
      if (mode === 'text') {
        setUploadStatus('Creating transfer...');
        const res = await fetch('/api/transfers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'text',
            textContent: text,
            expiration,
            downloadLimit,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to create transfer.');
        }

        setSuccessPayload(data.transfer);
      } else {
        // Files mode: Presigned Direct Storage Upload Flow
        setUploadStatus('Preparing upload...');

        const fileMetadataList = files.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type || 'application/octet-stream',
        }));

        const res = await fetch('/api/transfers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'file',
            files: fileMetadataList,
            expiration,
            downloadLimit,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to initialize upload.');
        }

        const { uploadTargets, transfer } = data;
        createdKey = transfer.key;

        // Perform Direct Upload from Browser -> Cloud Storage via Presigned PUT URL
        for (let i = 0; i < uploadTargets.length; i++) {
          const target = uploadTargets[i];
          const fileToUpload = files[target.fileIndex];

          setUploadStatus(`Uploading ${i + 1}/${uploadTargets.length}: "${fileToUpload.name}"...`);

          const fetchRes = await fetch(target.signedUrl, {
            method: 'PUT',
            headers: fileToUpload.type
              ? { 'Content-Type': fileToUpload.type }
              : {},
            body: fileToUpload,
          });

          if (!fetchRes.ok) {
            const errText = await fetchRes.text().catch(() => '');
            console.error('S3 Upload Failed:', fetchRes.status, errText);
            throw new Error(`Failed to upload file "${fileToUpload.name}" to storage (${fetchRes.status}).`);
          }
        }

        setSuccessPayload(transfer);
      }
    } catch (err: any) {
      console.error('Send transfer error:', err);
      if (createdKey) {
        fetch(`/api/transfers/${createdKey}`, { method: 'DELETE' }).catch(() => { });
      }
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      setUploadStatus(null);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setText('');
    setError(null);
    setSuccessPayload(null);
    setUploadStatus(null);
    setExpiration('24h');
    setDownloadLimit('unlimited');
  };

  if (successPayload) {
    return (
      <div className="w-full">
        <SuccessCard payload={successPayload} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 text-left">
      {/* Mode Switcher - Full Width Responsive Tabs */}
      <div className="w-full grid grid-cols-2 gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-white/[0.08] rounded-2xl border border-white/15 backdrop-blur-md font-mono">
        <button
          type="button"
          onClick={() => setMode('file')}
          className={`flex items-center justify-center gap-1.5 sm:gap-2.5 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-200 cursor-pointer ${
            mode === 'file'
              ? 'bg-[#ecf95a] text-[#191314] shadow-md shadow-[#ecf95a]/20 font-extrabold'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Files className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${mode === 'file' ? 'text-[#191314]' : 'text-white/60'}`} />
          <span className="whitespace-nowrap">Send Files</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('text')}
          className={`flex items-center justify-center gap-1.5 sm:gap-2.5 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-200 cursor-pointer ${
            mode === 'text'
              ? 'bg-[#ecf95a] text-[#191314] shadow-md shadow-[#ecf95a]/20 font-extrabold'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <FileText className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${mode === 'text' ? 'text-[#191314]' : 'text-white/60'}`} />
          <span className="whitespace-nowrap">Share Text</span>
        </button>
      </div>

      {/* Editor or Dropzone */}
      <div className="transition-all duration-200">
        {mode === 'file' ? (
          <Dropzone files={files} setFiles={setFiles} />
        ) : (
          <TextEditor text={text} setText={setText} />
        )}
      </div>

      {/* Settings */}
      <TransferSettings
        expiration={expiration}
        setExpiration={setExpiration}
        downloadLimit={downloadLimit}
        setDownloadLimit={setDownloadLimit}
      />

      {/* Error Notice */}
      {error && (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs sm:text-sm flex items-center gap-2.5 font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Progress Status */}
      {uploadStatus && (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-[#ecf95a]/10 border border-[#ecf95a]/25 text-[#ecf95a] text-xs sm:text-sm flex items-center gap-2.5 font-mono">
          <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin text-[#ecf95a]" />
          <span className="whitespace-nowrap truncate">{uploadStatus}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="button"
        disabled={isLoading}
        onClick={handleSend}
        className="group w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl bg-[#ecf95a] text-[#191314] font-extrabold text-xs sm:text-sm md:text-base tracking-tight whitespace-nowrap shadow-xl shadow-[#ecf95a]/20 hover:bg-[#dbe937] hover:shadow-[#ecf95a]/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border border-[#191314]/10"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#191314] shrink-0" />
            <span className="whitespace-nowrap">Processing Transfer...</span>
          </>
        ) : (
          <>
            <span className="whitespace-nowrap">Generate Transfer Key</span>
            <ArrowUpRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </>
        )}
      </button>
    </div>
  );
}
