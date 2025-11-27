import Link from 'next/link';

export function Footer() {
  return (
    <footer className="ml-64 bg-white dark:bg-dark-secondary border-t border-gray-200 dark:border-dark-border mt-12">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>© MediChat 2025</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">AI Health Assistant</span>
          </div>
          
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
