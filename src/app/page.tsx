import { SendContainer } from '@/components/send/send-container';
import { ShieldCheck, Zap, Lock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 sm:space-y-12 my-4 sm:my-8">
      {/* HERO HEADER */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>No Login Required &bull; Anonymous Transfers</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
          Share anything.{' '}
          <span className="bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Simple. Fast. Secure.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
          Upload files, images, or write text. Generate a 6-character key and send instantly without creating an account.
        </p>
      </div>

      {/* MAIN SENDER CARD */}
      <SendContainer />

      {/* FEATURES ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left max-w-3xl mx-auto">
        <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 w-fit">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Zero Authentication</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            No signup, login, passwords, or emails. Just upload and share your random key.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 w-fit">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Private & Signed URLs</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Files are stored in private bucket storage and served through expiring signed URLs.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 w-fit">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Custom Expiration</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Configure download limits and expiration times from 1 hour to 7 days or never.
          </p>
        </div>
      </div>
    </div>
  );
}
