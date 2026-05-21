import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { 
  User, 
  Mail, 
  KeyRound, 
  Sparkles, 
  Save, 
  Image, 
  Lock,
  Loader2 
} from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatarsList = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email) {
      showToast('Name and email are required fields', 'warning');
      return;
    }

    if (password) {
      if (password.length < 6) {
        showToast('Password must be at least 6 characters long', 'warning');
        return;
      }
      if (password !== confirmPassword) {
        showToast('Passwords do not match', 'warning');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const success = await updateProfile(name, email, password || undefined, selectedAvatar);
      if (success) {
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      showToast(err.message || 'Profile sync failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-6 sm:p-10 space-y-8 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans sm:text-2xl border-none select-none">
          Account Profile
        </h1>
        <p className="text-xs text-slate-500 font-sans mt-0.5">
          Revamp your credentials and customize workspace illustrations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar Selector Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col items-center justify-between text-center space-y-6 h-fit shadow-sm">
          <div className="space-y-4 w-full">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Active Badge</span>
            
            <img
              src={selectedAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || '')}`}
              alt="avatar"
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full border-2 border-indigo-650/10 bg-slate-50 object-cover mx-auto select-none"
            />
            
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 leading-tight">{user?.name}</h3>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Lock className="w-3 h-3 text-indigo-600 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{user?.role} clearance</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 w-full">
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest text-center mb-3 select-none">
              Swap User Portrait
            </p>
            <div className="grid grid-cols-4 gap-2">
              {avatarsList.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`relative rounded-full overflow-hidden w-9 h-9 border hover:scale-105 active:scale-95 transition-all outline-none bg-slate-50 ${
                    selectedAvatar === av ? 'border-indigo-600 ring-2 ring-indigo-600/10' : 'border-slate-200 hover:border-slate-450'
                  }`}
                >
                  <img src={av} alt="option" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Update Credentials form */}
        <div className="md:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800 font-sans border-none">
              Update Security Credentials
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-550 select-none">
                Display Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl py-2.5 px-10 text-xs text-slate-800 w-full transition-all outline-none"
                  placeholder="e.g. Alex Rivera"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-550 select-none">
                Registered Work Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl py-2.5 px-10 text-xs text-slate-800 w-full transition-all outline-none"
                  placeholder="alex@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-6">
              
              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-555 select-none">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl py-2.5 px-10 text-xs text-slate-805 w-full transition-all outline-none"
                    placeholder="Leave empty to remain"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-555 select-none">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl py-2.5 px-10 text-xs text-slate-805 w-full transition-all outline-none"
                    placeholder="Leave empty to remain"
                  />
                </div>
              </div>

            </div>

            {/* Actions button */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 font-sans mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 active:translate-y-px transition-all shadow-lg shadow-indigo-650/10 outline-none cursor-pointer"
              >
                <span>{isSubmitting ? 'Syncing...' : 'Sync Account'}</span>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-white" />}
              </button>
            </div>

          </form>
        </div>

      </div>
    </motion.div>
  );
}
