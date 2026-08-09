'use client';

import { useState } from 'react';
import { Dropzone } from './dropzone';
import { TextEditor } from './text-editor';
import { TransferSettings } from './transfer-settings';
import { SuccessCard } from './success-card';
import { ExpirationOption, DownloadLimitOption, TransferSuccessPayload } from '@/types';
import { Files, FileText, Send as SendIcon, Loader2, AlertCircle } from 'lucide-react';
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

          setUploadStatus(`Uploading file ${i + 1} of ${uploadTargets.length}: "${fileToUpload.name}"...`);

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
      <div className="w-full max-w-xl mx-auto glass-card rounded-3xl p-6 sm:p-8">
        <SuccessCard payload={successPayload} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* MODE TAB TOGGLE */}
      <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setMode('file')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            mode === 'file'
              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-md'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Files className="w-4 h-4" />
          <span>Files</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('text')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            mode === 'text'
              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-md'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Text</span>
        </button>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
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
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base shadow-xl shadow-brand-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{uploadStatus || 'Processing...'}</span>
          </>
        ) : (
          <>
            <SendIcon className="w-5 h-5" />
            <span>SEND</span>
          </>
        )}
      </button>
    </div>
  );
}
