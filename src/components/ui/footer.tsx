import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm py-8 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} ZeesuSend.</span>
          <span className="inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <span>Anonymous file & text transfer</span>
        </div>

        <div className="flex items-center gap-6 font-medium">
          <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link href="/receive" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Receive Transfer
          </Link>
        </div>
      </div>
    </footer>
  );
}
