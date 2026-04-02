import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        {/* Navigation */}
        <nav className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-2">
                <svg
                  className="w-8 h-8 text-indigo-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                </svg>
                <span className="font-bold text-xl text-gray-900">
                  MovieRecs
                </span>
              </Link>
              
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Home
                </Link>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  API Docs
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="bg-white border-t mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-500 text-sm">
              <p>Movie Recommendation System</p>
              <p className="mt-1">
                Built with Next.js, FastAPI, and Machine Learning
              </p>
              <p className="mt-2 text-xs">
                Data from MovieLens 100K Dataset
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
