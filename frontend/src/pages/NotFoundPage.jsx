import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, ShoppingBag } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] bg-white flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <span className="text-5xl font-black text-slate-200 block mb-2 font-mono">404</span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-8 leading-relaxed">
          The page you are looking for doesn't exist, has been relocated, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Explore Catalog</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
