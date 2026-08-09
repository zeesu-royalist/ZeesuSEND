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
    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#ecf95a]">
        <Settings2 className="w-3.5 h-3.5" />
        <span>Transfer Settings</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Expiration Setting */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-white/70 flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-white/50" />
            <span>Expiration</span>
          </label>
          <select
            value={expiration}
            onChange={(e) => setExpiration(e.target.value as ExpirationOption)}
            className="w-full text-xs bg-[#191314] border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#ecf95a] font-mono cursor-pointer"
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
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-white/70 flex items-center gap-1.5 font-mono">
            <Download className="w-3.5 h-3.5 text-white/50" />
            <span>Download Limit</span>
          </label>
          <select
            value={downloadLimit}
            onChange={(e) => setDownloadLimit(e.target.value as DownloadLimitOption)}
            className="w-full text-xs bg-[#191314] border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#ecf95a] font-mono cursor-pointer"
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
