/**
 * Navbar Component
 * Simple navigation bar for all pages
 */

import Link from "next/link";

export default function Navbar() {
  return (
    <nav 
      className="p-4 bg-gray-900 text-white flex gap-6 flex-wrap items-center"
      style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 9999,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}
    >
      <Link href="/" className="hover:text-cyan-400 transition-colors font-semibold">
        🏠 Home
      </Link>
      <Link href="/auth" className="hover:text-cyan-400 transition-colors font-semibold">
        🔑 Login
      </Link>
      <Link href="/chat" className="hover:text-cyan-400 transition-colors font-semibold">
        💬 AI Chat
      </Link>
      <Link href="/dashboard" className="hover:text-cyan-400 transition-colors font-semibold">
        📊 Dashboard
      </Link>
      <Link href="/reports" className="hover:text-cyan-400 transition-colors font-semibold">
        📁 Reports
      </Link>
      <Link href="/resources" className="hover:text-cyan-400 transition-colors font-semibold">
        💊 Resources
      </Link>
      <Link href="/profile" className="hover:text-cyan-400 transition-colors font-semibold">
        👤 Profile
      </Link>
    </nav>
  );
}
