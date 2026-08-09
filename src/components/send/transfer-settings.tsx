'use client';

import { ExpirationOption, DownloadLimitOption } from '@/types';
import { Clock, Download, Settings2 } from 'lucide-react';

interface TransferSettingsProps {
  expiration: ExpirationOption;
  setExpiration: (val: ExpirationOption) => void;
  downloadLimit: DownloadLimitOption;
  setDownloadLimit: (val: DownloadLimitOption) => void;
}

export function TransferSettings({
  expiration,
  setExpiration,
  downloadLimit,
  setDownloadLimit,
}: TransferSettingsProps) {
  return (
    <div className="bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <Settings2 className="w-4 h-4 text-brand-500" />
        <span>Transfer Settings</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Expiration Setting */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Expiration Time</span>
          </label>
          <select
            value={expiration}
            onChange={(e) => setExpiration(e.target.value as ExpirationOption)}
            className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          >
            <option value="1h">1 Hour</option>
            <option value="6h">6 Hours</option>
            <option value="24h">24 Hours (Default)</option>
            <option value="3d">3 Days</option>
            <option value="7d">7 Days</option>
            <option value="never">Never</option>
          </select>
        </div>

        {/* Download Limit Setting */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Download Limit</span>
          </label>
          <select
            value={downloadLimit}
            onChange={(e) => setDownloadLimit(e.target.value as DownloadLimitOption)}
            className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          >
            <option value="unlimited">Unlimited (Default)</option>
            <option value="1">1 Download</option>
            <option value="5">5 Downloads</option>
            <option value="10">10 Downloads</option>
          </select>
        </div>
      </div>
    </div>
  );
}
