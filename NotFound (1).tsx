import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-950 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md text-center space-y-6"
      >
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full w-fit mx-auto">
          <AlertCircle className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight">404 - Area Unassigned</h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            The workspace url configuration you are seeking is either unmapped or restricted. Please audit directory listings.
          </p>
        </div>

        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-white transition-all outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
