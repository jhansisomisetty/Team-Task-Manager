import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { motion } from 'motion/react';
import { Building2, ArrowRight, Eye, EyeOff, KeyRound, Mail, Sparkles } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Determine back navigation path if redirected
  const fromPath = (location.state as any)?.from?.pathname || '/dashboard';

  const validateEmail = (val: string) => {
    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!email || !password) {
      setValidationError('Please fill in all details.');
      return;
    }

    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);

    if (success) {
      navigate(fromPath, { replace: true });
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setValidationError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-md w-full flex flex-col gap-8 relative z-10">
        
        {/* Logo Branding */}
        <div className="text-center flex flex-col items-center select-none">
          <Link to="/" className="flex items-center gap-2 mb-3 cursor-pointer">
            <Building2 className="w-8 h-8 text-indigo-600 animate-pulse" />
            <span className="text-lg font-bold tracking-tight text-slate-900 uppercase font-sans">
              Team Task Manager
            </span>
          </Link>
          <p className="text-xs text-slate-500 font-sans">
            MERN Enterprise Project Management
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative"
        >
          <div className="flex items-center gap-2 mb-6 select-none">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800 font-sans">
              Sign In to Team Space
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {validationError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-semibold">
                {validationError}
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-550 select-none">
                Work Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-50 border border-slate-205 focus:border-indigo-600 focus:bg-white rounded-xl py-2.5 pl-11 pr-4 text-xs text-slate-800 w-full transition-all outline-none"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-550 select-none">
                  Password Key
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-405 pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-50 border border-slate-205 focus:border-indigo-600 focus:bg-white rounded-xl py-2.5 pl-11 pr-12 text-xs text-slate-800 w-full transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-all outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold text-xs w-full py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 active:translate-y-px transition-all border border-indigo-50/20 outline-none cursor-pointer"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick-Fill buttons */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 font-mono select-none">
              🛡️ Sandbox Demo Profiles Quick-Fill
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleQuickFill('admin@teamtask.com')}
                type="button"
                className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 rounded-xl text-xs text-slate-600 transition-all font-sans text-left outline-none cursor-pointer"
              >
                <span>Log in as <strong className="text-slate-800">Admin</strong></span>
                <span className="font-mono text-[9px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">admin@teamtask.com</span>
              </button>
              <button
                onClick={() => handleQuickFill('member@teamtask.com')}
                type="button"
                className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 rounded-xl text-xs text-slate-600 transition-all font-sans text-left outline-none cursor-pointer"
              >
                <span>Log in as <strong className="text-slate-800">Member</strong></span>
                <span className="font-mono text-[9px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">member@teamtask.com</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Redirect toggle */}
        <p className="text-center text-xs text-slate-500 font-sans">
          Don't have a team account?{' '}
          <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 hover:underline font-bold font-sans cursor-pointer">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}
