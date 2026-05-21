import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { 
  Building2, 
  FolderKanban, 
  Search, 
  Plus, 
  Users2, 
  Trash2, 
  Calendar, 
  X, 
  CheckCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProjectType {
  id: string;
  name: string;
  description: string;
  createdBy: { id: string; name: string; email: string; role: string; avatar: string };
  members: Array<{ id: string; name: string; email: string; role: string; avatar: string }>;
  progress: number;
  createdAt: string;
}

export default function Projects() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Form states
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjectsAndUsers = async () => {
    try {
      setLoading(true);
      const [projectsData, usersData] = await Promise.all([
        apiFetch('/api/projects'),
        user?.role === 'admin' ? apiFetch('/api/users') : Promise.resolve({ success: true, users: [] })
      ]);

      if (projectsData.success) {
        setProjects(projectsData.projects || []);
      }
      if (usersData.success) {
        // Exclude current logged in admin from list because they are auto-added
        setUsersList((usersData.users || []).filter((u: any) => u.id !== user?.id));
      }
    } catch (err) {
      console.error('Failed to retrieve project workspace loads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjectsAndUsers();
    }
  }, [user]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) {
      showToast('Project name is required', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiFetch('/api/projects', {
        method: 'POST',
        body: {
          name: newProjectName,
          description: newProjectDesc,
          members: selectedMembers,
        },
      });

      if (res.success) {
        showToast(res.message || 'Project created successfully!', 'success');
        setIsCreateOpen(false);
        // Reset forms
        setNewProjectName('');
        setNewProjectDesc('');
        setSelectedMembers([]);
        // Reload projects
        fetchProjectsAndUsers();
      }
    } catch (err: any) {
      showToast(err.message || 'Workspace creation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      setIsSubmitting(true);
      const res = await apiFetch(`/api/projects/${projectToDelete}`, {
        method: 'DELETE',
      });

      if (res.success) {
        showToast(res.message || 'Workspace deleted', 'success');
        setIsDeleteOpen(false);
        setProjectToDelete(null);
        fetchProjectsAndUsers();
      }
    } catch (err: any) {
      showToast(err.message || 'Workspace deletion failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMemberSelection = (uId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(uId) ? prev.filter((id) => id !== uId) : [...prev, uId]
    );
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase()) ||
    p.description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-6 sm:p-10 space-y-8 max-w-6xl mx-auto"
    >
      {/* Upper header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans sm:text-3xl">
            Team Projects
          </h1>
          <p className="text-sm text-slate-500 font-sans mt-0.5">
            Coordinate team goals, assign memberships, and track progress.
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 border border-indigo-500/10 shadow-lg shadow-indigo-600/10 outline-none cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Action panel: Search */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
        <Search className="w-5 h-5 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search projects by title or descriptions..."
          className="bg-transparent text-sm text-slate-800 placeholder-slate-400 w-full outline-none"
        />
      </div>

      {/* Main projects view */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs font-mono">Synchronizing Project Pipelines...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center p-6 border border-slate-200 border-dashed rounded-3xl bg-slate-50 max-w-md mx-auto">
          <FolderKanban className="w-12 h-12 text-slate-400 mb-4" />
          <h3 className="text-sm font-bold text-slate-800">No project pipelines found</h3>
          <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
            {searchText ? "No search matches. Restructure your filtering queries." : "Create a workspace directory to begin charting sprints."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <motion.div
              layout
              key={proj.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-slate-300 flex flex-col justify-between transition-all group hover:shadow-md"
            >
              <div>
                {/* Header title */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {proj.name}
                  </h3>
                  
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => {
                        setProjectToDelete(proj.id);
                        setIsDeleteOpen(true);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer outline-none shrink-0"
                      title="Delete Project Workspace"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Desc */}
                <p className="text-xs text-slate-500 leading-relaxed font-sans line-clamp-2 h-8.5 mb-6">
                  {proj.description || 'No description designated.'}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-6">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400 uppercase tracking-wider font-bold">Progress Rate</span>
                    <span className="text-indigo-600 font-bold">{proj.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-550"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Backing details */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between mt-auto">
                {/* Members list stacked */}
                <div className="flex items-center shrink-0">
                  <div className="flex -space-x-2 overflow-hidden mr-2">
                    {proj.members.slice(0, 4).map((m) => (
                      <img
                        key={m.id}
                        src={m.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name)}`}
                        alt={m.name}
                        referrerPolicy="no-referrer"
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover bg-slate-100"
                        title={m.name}
                      />
                    ))}
                  </div>
                  {proj.members.length > 4 && (
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      +{proj.members.length - 4}
                    </span>
                  )}
                </div>

                {/* View Details clickable */}
                <Link
                  to={`/projects/${proj.id}`}
                  className="text-xs font-semibold text-slate-650 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-all shrink-0 font-sans"
                >
                  Configure &rarr;
                </Link>
              </div>

            </motion.div>
          ))}
        </div>
      )}

      {/* MODAL: Create Project (Admins only) */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Content card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 overflow-hidden relative z-10 shadow-2xl shrink-0"
            >
              <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-indigo-650 animate-pulse" />
                  <h2 className="text-base font-bold text-slate-900 font-sans">
                    Assemble New Project Pipeline
                  </h2>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                
                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-550">
                    Project Pipeline Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="e.g. Website Redesign 2026"
                    className="bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-sm text-slate-800 w-full transition-all outline-none"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-550">
                    Sprint Description
                  </label>
                  <textarea
                    rows={2}
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    placeholder="Describe core initiatives and milestones..."
                    className="bg-slate-50 border border-slate-200 focus:border-indigo-505 focus:bg-white rounded-xl py-2.5 px-4 text-sm text-slate-800 w-full transition-all outline-none resize-none"
                  />
                </div>

                {/* Members select */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-550 mb-1">
                    Delegate Team Members ({selectedMembers.length} Selected)
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-36 overflow-y-auto space-y-1.5">
                    {usersList.length === 0 ? (
                      <p className="text-xs text-slate-500 p-2 font-mono">No other team members found.</p>
                    ) : (
                      usersList.map((userObj) => (
                        <div
                          key={userObj.id}
                          onClick={() => toggleMemberSelection(userObj.id)}
                          className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                            selectedMembers.includes(userObj.id)
                              ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                              : 'border border-transparent bg-slate-100/40 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={userObj.avatar}
                              alt={userObj.name}
                              referrerPolicy="no-referrer"
                              className="w-6 h-6 rounded-full border border-slate-200 object-cover bg-slate-50"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate leading-none">{userObj.name}</p>
                              <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest">{userObj.role}</span>
                            </div>
                          </div>
                          
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                            selectedMembers.includes(userObj.id)
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'border-slate-300 bg-white'
                          }`}>
                            {selectedMembers.includes(userObj.id) && <CheckCircle className="w-3 h-3 text-white stroke-2" />}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    &bull; Owner is automatically included in members arrays.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-all outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 active:translate-y-px transition-all shadow-lg shadow-indigo-650/10 outline-none"
                  >
                    <span>{isSubmitting ? 'Assembling...' : 'Assemble'}</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Delete Confirm dialogue */}
      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 overflow-hidden relative z-10 shadow-2xl text-center shrink-0"
            >
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-full w-fit mx-auto mb-4">
                <Trash2 className="w-5 h-5" />
              </div>
              
              <h2 className="text-base font-bold text-slate-905 mb-2 font-sans">
                Teardown Project Pipeline?
              </h2>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Applying this action will <strong className="text-slate-900">permanently cascade-delete all associated tasks</strong> under this project. This is irreversible.
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-all outline-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteProject}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 active:translate-y-px transition-all shadow-lg shadow-rose-600/10 outline-none"
                >
                  <span>{isSubmitting ? 'Deleting...' : 'Teardown'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
