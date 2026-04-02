import type { Metadata } from "next";
import { Sora, Manrope } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Movie Recommendation System",
  description: "Discover movies with AI-powered recommendations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${manrope.variable} min-h-screen bg-slate-950 text-slate-100`}>
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="aurora aurora-one" />
          <div className="aurora aurora-two" />
          <div className="aurora aurora-three" />
        </div>

        <nav className="sticky top-0 z-40 border-b border-cyan-300/15 bg-slate-950/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3">
                <svg
                  className="h-8 w-8 text-cyan-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                </svg>
                <span className="font-heading text-xl font-semibold tracking-tight text-white">
                  MovieRecs
                </span>
              </Link>

              <div className="flex items-center gap-5 text-sm font-medium text-slate-300">
                <Link
                  href="/"
                  className="transition-colors hover:text-cyan-200"
                >
                  Home
                </Link>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-cyan-300/35 px-3 py-1 transition-colors hover:border-cyan-200 hover:text-cyan-100"
                >
                  API Docs
                </a>
              </div>
          </div>
        </nav>

        <main>{children}</main>

        <footer className="mt-auto border-t border-cyan-300/10 bg-slate-950/70">
          <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-slate-300 sm:px-6 lg:px-8">
            <p className="font-heading text-base text-white">Movie Recommendation System</p>
            <p className="mt-1">
                Built with Next.js, FastAPI, and Machine Learning
            </p>
            <p className="mt-2 text-xs text-slate-400">
                Data from MovieLens 100K Dataset
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
