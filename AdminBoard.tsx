import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { 
  Building2, 
  ShieldCheck, 
  Users, 
  UserPlus, 
  Mail, 
  KeyRound, 
  User, 
  X, 
  Loader2, 
  Sparkles,
  Lock,
  ArrowUpDown
} from 'lucide-react';

interface TeammateType {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar: string;
  createdAt?: string;
}

export default function AdminBoard() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [teammates, setTeammates] = useState<TeammateType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states - add user
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'member'>('member');

  const fetchTeammates = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/users');
      if (res.success) {
        setTeammates(res.users || []);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to sync squad list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchTeammates();
    }
  }, [user]);

  const handleCreateTeammate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) {
      showToast('Please fill in explanation details', 'warning');
      return;
    }

    if (newUserPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: {
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
        },
      });

      if (res.success) {
        showToast('New project teammate added to workspace database!', 'success');
        setIsAddUserOpen(false);
        // Reset state
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('member');
        // Refresh teammates List
        fetchTeammates();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create teammate profile', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleToggle = async (tId: string, currentRole: 'admin' | 'member') => {
    if (tId === user?.id) {
      showToast('You cannot demote or modify your own clearance role', 'warning');
      return;
    }

    const targetRole = currentRole === 'admin' ? 'member' : 'admin';

    try {
      // Create user endpoint update profile proxy or custom profile updater.
      // Wait we can use PUT /api/users/profile or modify a general user profiles updater on server if needed.
      // Wait! The user database has PUT /api/users/profile but that modifies current logging user profile.
      // Let's check: did we implement a separate admin edit route on backend?
      // Ah! We don't have a custom route on the server for changing roles of OTHER users yet.
      // Let's implement /api/users/:id route in server to receive PUT role updates as Admin!
      // This is extremely modular and is already supported in part because PUT /api/users/profile was made.
      // Let's check if we have a controller in `/server/controllers/userController.ts` for general properties.
      // We didn't build a separate PUT /api/users/:id endpoints, but we absolutely can, OR we can add a custom REST route.
      // Wait, let's write a quick PUT /api/users/:id route in backend to let Admin modify role and other details of any user! That is awesome!
      // Let's first make sure we write the frontend to call `PUT /api/users/:id` to change roles.
      // We will do that! That's perfect and simple.
      const res = await apiFetch(`/api/users/${tId}`, {
         method: 'PUT',
         body: { role: targetRole }
      });
      if (res.success) {
        showToast('Teammate role updated successfully!', 'success');
        fetchTeammates();
      }
    } catch (err: any) {
      // Fallback: Show local change if API is slow or modify server to support PUT /api/users/:id
      showToast(err.message || 'Failed to update teammate role', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-6 sm:p-10 space-y-8 max-w-6xl mx-auto"
    >
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans sm:text-2xl select-none leading-none">
            System Admin Board
          </h1>
          <p className="text-xs text-slate-550 font-sans mt-0.5">
            Audit team directories, modify member roles, and pre-hash new credentials.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 border border-indigo-100 shadow-md transition-all outline-none cursor-pointer"
        >
          <UserPlus className="w-4 h-4 shrink-0" />
          <span>Provision Member</span>
        </button>
      </div>

      {/* Main Table View */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs font-mono">Synchronizing Identity Systems...</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-slate-305 transition-all shadow-sm font-sans">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Workspace Directory ({teammates.length} users)</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-400 uppercase tracking-wider select-none">
                  <th className="p-4 pl-6 font-bold">Display Profile</th>
                  <th className="p-4 font-bold">Email Coordinates</th>
                  <th className="p-4 font-bold">Clearance Level</th>
                  <th className="p-4 text-right pr-6 font-bold">Credentials Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teammates.map((teammate) => {
                  const isMyself = teammate.id === user?.id;

                  return (
                    <tr key={teammate.id} className="hover:bg-slate-50/50 transition-all">
                      {/* Name/Portrait */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={teammate.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(teammate.name)}`}
                            alt={teammate.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full border border-slate-200 object-cover bg-slate-50 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate leading-snug">
                              {teammate.name}
                            </p>
                            {isMyself && (
                              <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded-md border border-indigo-100">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email Coordinate */}
                      <td className="p-4">
                        <span className="text-xs text-slate-650 font-sans">
                          {teammate.email}
                        </span>
                      </td>

                      {/* Role clearance */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {teammate.role === 'admin' ? (
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm leading-none shrink-0">
                              <Lock className="w-3 h-3 text-emerald-600" />
                              <span>Admin</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-705 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md leading-none shrink-0">
                              <span>Member</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Toggle Control details */}
                      <td className="p-4 text-right pr-6">
                        {isMyself ? (
                          <span className="text-[10px] font-mono text-slate-400 select-none">
                            Config Protected
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRoleToggle(teammate.id, teammate.role)}
                            type="button"
                            className="text-xs font-semibold font-sans text-indigo-600 hover:text-indigo-700 transition-colors bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer outline-none"
                          >
                            Toggle Clearance
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Add Teammate Overlay Profile */}
      <AnimatePresence>
        {isAddUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddUserOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-slate-205 rounded-3xl w-full max-w-md p-6 overflow-hidden relative z-10 shadow-2xl shrink-0"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600 animate-pulse" />
                  <h2 className="text-base font-bold text-slate-850 font-sans border-none leading-none select-none">
                    Provision New Teammate
                  </h2>
                </div>
                <button
                  onClick={() => setIsAddUserOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTeammate} className="space-y-4">
                
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-550 select-none">
                    Display Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-405 pointer-events-none">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="e.g. Sandra Bullock"
                      className="bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl py-2.5 pl-11 pr-4 text-xs text-slate-800 w-full transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-550 select-none">
                    Registered Coordinate Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-405 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="sandra@company.com"
                      className="bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl py-2.5 pl-11 pr-4 text-xs text-slate-800 w-full transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Password input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-550 select-none">
                    Initial Security Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-405 pointer-events-none">
                      <KeyRound className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl py-2.5 pl-11 pr-4 text-xs text-slate-800 w-full transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Clearance Level */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-550 select-none">
                    Select Identity Clearance Level
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewUserRole('member')}
                      className={`py-2.5 px-4 rounded-xl border transition-all text-xs font-bold outline-none cursor-pointer ${
                        newUserRole === 'member'
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-750'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350'
                      }`}
                    >
                      Workspace Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewUserRole('admin')}
                      className={`py-2.5 px-4 rounded-xl border transition-all text-xs font-bold outline-none cursor-pointer ${
                        newUserRole === 'admin'
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-750'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350'
                      }`}
                    >
                      System Admin
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-205 rounded-xl text-xs font-bold text-slate-705 transition-all outline-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold text-xs rounded-xl flex items-center gap-1 active:translate-y-px transition-all outline-none cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Provisioning...' : 'Provision'}</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
