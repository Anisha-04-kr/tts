import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Local AI Voice Assistant",
  description: "100% Offline, Privacy-First AI Voice Assistant & Medical Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-gray-100 min-h-screen flex flex-col">
        <header className="bg-surface border-b border-gray-800 px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
              🎙️
            </div>
            <span className="font-semibold text-lg tracking-wide text-white">Local Voice AI</span>
            <span className="bg-green-900/60 text-green-400 text-xs px-2 py-0.5 rounded border border-green-700">100% Local</span>
          </div>

          <nav className="flex items-center space-x-1 text-sm font-medium">
            <Link href="/" className="px-3 py-1.5 rounded hover:bg-gray-800 transition">Chat</Link>
            <Link href="/voice" className="px-3 py-1.5 rounded hover:bg-gray-800 transition text-blue-400">Voice Mode</Link>
            <Link href="/medical" className="px-3 py-1.5 rounded hover:bg-gray-800 transition text-purple-400">Medical Mode</Link>
            <Link href="/history" className="px-3 py-1.5 rounded hover:bg-gray-800 transition">History</Link>
            <Link href="/models" className="px-3 py-1.5 rounded hover:bg-gray-800 transition">Models</Link>
            <Link href="/health" className="px-3 py-1.5 rounded hover:bg-gray-800 transition">Health</Link>
            <Link href="/logs" className="px-3 py-1.5 rounded hover:bg-gray-800 transition">Logs</Link>
            <Link href="/settings" className="px-3 py-1.5 rounded hover:bg-gray-800 transition">Settings</Link>
            <Link href="/about" className="px-3 py-1.5 rounded hover:bg-gray-800 transition">About</Link>
          </nav>
        </header>

        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
