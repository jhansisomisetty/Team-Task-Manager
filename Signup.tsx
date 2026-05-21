import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { motion } from 'motion/react';
import { Building2, ArrowRight, Eye, EyeOff, KeyRound, Mail, User, Sparkles, UserPlus } from 'lucide-react';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateEmail = (val: string) => {
    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!name || !email || !password) {
      setValidationError('Please fill in all details.');
      return;
    }

    if (name.trim().length < 2) {
      setValidationError('Name must be at least 2 characters.');
      return;
    }

    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const success = await register(name, email, password, role);
    setIsSubmitting(false);

    if (success) {
      navigate('/dashboard', { replace: true });
    }
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
          className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6 select-none">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800 font-sans">
              Create Team Account
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {validationError && (
              <div className="bg-rose-5 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-semibold">
                {validationError}
              </div>
            )}

            {/* Display Name Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-550 select-none">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-50 border border-slate-205 focus:border-indigo-600 focus:bg-white rounded-xl py-2.5 pl-11 pr-4 text-xs text-slate-800 w-full transition-all outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
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
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-550 select-none">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-50 border border-slate-205 focus:border-indigo-600 focus:bg-white rounded-xl py-2.5 pl-11 pr-12 text-xs text-slate-800 w-full transition-all outline-none"
                  placeholder="At least 6 characters"
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

            {/* Role select radio layout */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-550 select-none">
                Select Workspace Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('member')}
                  className={`py-2.5 px-4 rounded-xl border transition-all text-xs font-bold outline-none cursor-pointer ${
                    role === 'member'
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-755'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350'
                  }`}
                >
                  Workspace Member
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2.5 px-4 rounded-xl border transition-all text-xs font-bold outline-none cursor-pointer ${
                    role === 'admin'
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-755'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350'
                  }`}
                >
                  System Admin
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-1 leading-normal select-none">
                {role === 'admin' 
                  ? '💡 Admins can manage users, create projects, assign workloads, and delete documents.'
                  : '💡 Members can check workspaces, view their lists, and update task statuses.'}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold text-xs w-full py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 active:translate-y-px transition-all border border-indigo-50/20 mt-4 outline-none cursor-pointer"
            >
              <span>{isSubmitting ? 'Creating Account...' : 'Register'}</span>
              <UserPlus className="w-4 h-4 shrink-0" />
            </button>
          </form>

        </motion.div>

        {/* Redirect toggle */}
        <p className="text-center text-xs text-slate-505 font-sans">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 hover:underline font-bold font-sans cursor-pointer">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
