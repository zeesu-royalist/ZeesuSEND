'use client';

import { useState } from 'react';
import { Dropzone } from './dropzone';
import { TextEditor } from './text-editor';
import { TransferSettings } from './transfer-settings';
import { SuccessCard } from './success-card';
import { ExpirationOption, DownloadLimitOption, TransferSuccessPayload } from '@/types';
import { Files, FileText, ArrowUpRight, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

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

        // Perform Direct Upload from Browser -> Supabase Cloud Storage
        for (let i = 0; i < uploadTargets.length; i++) {
          const target = uploadTargets[i];
          const fileToUpload = files[target.fileIndex];

          setUploadStatus(`Uploading ${i + 1}/${uploadTargets.length}: "${fileToUpload.name}"...`);

          // Direct upload via Supabase Client or Signed Upload URL
          const { error: uploadError } = await supabase.storage
            .from('transfers')
            .uploadToSignedUrl(target.filePath, target.token, fileToUpload);

          if (uploadError) {
            // Fallback direct PUT fetch
            const fetchRes = await fetch(target.signedUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': fileToUpload.type || 'application/octet-stream',
              },
              body: fileToUpload,
            });

            if (!fetchRes.ok) {
              throw new Error(`Failed to upload file "${fileToUpload.name}" to storage.`);
            }
          }
        }

        setSuccessPayload(transfer);
      }
    } catch (err: any) {
      console.error('Send transfer error:', err);
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
      {/* MODE TAB TOGGLE */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/10 border border-white/10">
        <button
          type="button"
          onClick={() => setMode('file')}
          className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            mode === 'file'
              ? 'bg-[#ecf95a] text-[#191314] shadow-md'
              : 'text-white/70 hover:text-white'
          }`}
        >
          <Files className="w-4 h-4" />
          <span>Files</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('text')}
          className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            mode === 'text'
              ? 'bg-[#ecf95a] text-[#191314] shadow-md'
              : 'text-white/70 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Text</span>
        </button>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {/* CONTENT MODE INPUT */}
      {mode === 'file' ? (
        <Dropzone files={files} setFiles={setFiles} />
      ) : (
        <TextEditor text={text} setText={setText} />
      )}

      {/* SETTINGS DRAWER */}
      <TransferSettings
        expiration={expiration}
        setExpiration={setExpiration}
        downloadLimit={downloadLimit}
        setDownloadLimit={setDownloadLimit}
      />

      {/* SEND BUTTON */}
      <button
        type="button"
        onClick={handleSend}
        disabled={isLoading || (mode === 'file' && files.length === 0) || (mode === 'text' && !text.trim())}
        className="w-full py-3.5 px-6 rounded-full bg-[#ecf95a] hover:bg-[#dbe937] disabled:opacity-40 disabled:cursor-not-allowed text-[#191314] font-extrabold text-sm tracking-tight shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 border border-[#191314]/10 cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#191314]" />
            <span>{uploadStatus || 'Processing...'}</span>
          </>
        ) : (
          <>
            <span>GENERATE TRANSFER LINK</span>
            <ArrowUpRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
