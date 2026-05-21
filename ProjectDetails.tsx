import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { 
  FolderKanban, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  CheckSquare, 
  UserPlus, 
  Calendar, 
  CalendarCheck,
  AlertCircle,
  X,
  Loader2,
  CheckCircle2,
  Lock,
  User,
  Activity
} from 'lucide-react';

interface TaskType {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedTo: { id: string; name: string; email: string; role: string; avatar: string };
  createdBy: { id: string; name: string };
  createdAt: string;
}

interface ProjectDetailsType {
  id: string;
  name: string;
  description: string;
  createdBy: { id: string; name: string; email: string; avatar: string };
  members: Array<{ id: string; name: string; email: string; role: string; avatar: string }>;
  progress: number;
  tasks: TaskType[];
  createdAt: string;
}

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [project, setProject] = useState<ProjectDetailsType | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Form states - add task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states - associate members
  const [memberToInvite, setMemberToInvite] = useState('');

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/projects/${id}`);
      if (res.success && res.project) {
        setProject(res.project);
      }

      if (user?.role === 'admin') {
        const usersRes = await apiFetch('/api/users');
        if (usersRes.success) {
          setUsersList(usersRes.users || []);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load project details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && user) {
      fetchProjectDetails();
    }
  }, [id, user]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskDueDate || !taskAssignedTo) {
      showToast('Please fill in all core fields', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiFetch('/api/tasks', {
        method: 'POST',
        body: {
          title: taskTitle,
          description: taskDesc,
          priority: taskPriority,
          dueDate: taskDueDate,
          assignedTo: taskAssignedTo,
          project: id,
        },
      });

      if (res.success) {
        showToast(res.message || 'Task dispatched successfully!', 'success');
        setIsAddTaskOpen(false);
        // Reset state
        setTaskTitle('');
        setTaskDesc('');
        setTaskPriority('medium');
        setTaskDueDate('');
        setTaskAssignedTo('');
        // Reload details
        fetchProjectDetails();
      }
    } catch (err: any) {
      showToast(err.message || 'Task compilation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberToInvite) {
      showToast('Please select a teammate to select', 'warning');
      return;
    }

    if (!project) return;

    const currentMemberIds = project.members.map((m) => m.id);
    if (currentMemberIds.includes(memberToInvite)) {
      showToast('Teammate is already a member of this project workspace', 'info');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiFetch(`/api/projects/${id}`, {
        method: 'PUT',
        body: {
          members: [...currentMemberIds, memberToInvite],
        },
      });

      if (res.success) {
        showToast(res.message || 'Teammate associated successfully!', 'success');
        setIsAddMemberOpen(false);
        setMemberToInvite('');
        fetchProjectDetails();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to sync teammate', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (taskId: string, currentStatus: string) => {
    // Cycles status: pending -> in_progress -> completed -> pending
    let nextStatus: 'pending' | 'in_progress' | 'completed' = 'pending';
    if (currentStatus === 'pending') nextStatus = 'in_progress';
    else if (currentStatus === 'in_progress') nextStatus = 'completed';

    try {
      const res = await apiFetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: { status: nextStatus },
      });

      if (res.success) {
        showToast('Task status updated successfully', 'success');
        fetchProjectDetails();
      }
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-xs font-mono">Synchronizing Workspace Datasets...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center text-slate-400 space-y-4 max-w-sm mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Project not found</h2>
        <p className="text-xs">This project either does not exist or you lack authorization keys.</p>
        <Link to="/projects" className="text-indigo-400 hover:underline text-xs flex items-center justify-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Return to directory
        </Link>
      </div>
    );
  }

  // Filter project members list to invite new ones (exclude already invited members)
  const remainingTeammatesToInvite = usersList.filter(
    (u) => !project.members.some((m) => m.id === u.id)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-6 sm:p-10 space-y-8 max-w-6xl mx-auto"
    >
      {/* Return button */}
      <div>
        <Link 
          to="/projects"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors border border-slate-200 bg-white shadow-sm w-fit px-3.5 py-2 rounded-xl block font-sans font-bold"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>&larr; WORKSPACES DIRECTORY</span>
        </Link>
      </div>

      {/* Main top hero detailing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Basic Project Detailing */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 font-sans leading-tight">
              {project.name}
            </h1>
            <div className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 shrink-0">
              ID: {project.id.slice(0, 8)}...
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            {project.description || 'No description designated.'}
          </p>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-100">
            <span>Owner: <strong className="text-indigo-600 font-bold">{project.createdBy?.name || 'Admin'}</strong></span>
            <span>&bull;</span>
            <span>Created: {new Date(project.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Project Statistics & Actions */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
              Workspace Completion Ratio
            </h4>

            {/* Gauge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-indigo-600">
                <span>Overall Delivery progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-550"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick controls if Admin */}
          {user?.role === 'admin' && (
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsAddMemberOpen(true)}
                className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-indigo-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer"
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                <span>Invite Members</span>
              </button>
              
              <button
                onClick={() => setIsAddTaskOpen(true)}
                className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 border border-indigo-500/10 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-650/10 outline-none cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Assign Task</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Grid: Members Rail vs Task Workspace Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Members Rail */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm h-fit space-y-4">
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Project Members ({project.members.length})</span>
          </h3>

          <div className="space-y-2.5">
            {project.members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50">
                <img
                  src={member.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`}
                  alt={member.name}
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover bg-slate-50 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                    {member.name}
                  </p>
                  <div className="flex items-center gap-1">
                    {member.role === 'admin' && <Lock className="w-2.5 h-2.5 text-indigo-500" />}
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                      {member.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task lists directory */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 font-sans flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span>Project Workloads directory ({project.tasks.length} tasks)</span>
            </h3>
          </div>

          {project.tasks.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center p-6 border border-slate-200 border-dashed rounded-3xl bg-slate-50">
              <CheckSquare className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-xs text-slate-500">No workload deliverables designated to this pipeline yet.</p>
              {user?.role === 'admin' && (
                <button
                  onClick={() => setIsAddTaskOpen(true)}
                  className="text-indigo-600 text-xs font-bold hover:underline mt-2 cursor-pointer outline-none"
                >
                  Create first task deliverable &rarr;
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3.5">
              {project.tasks.map((task) => {
                const isAssignedToMe = task.assignedTo?.id === user?.id;

                return (
                  <div 
                    key={task.id} 
                    className="p-5 bg-white border border-slate-200 rounded-3xl hover:border-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Task Priority */}
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md ${
                          task.priority === 'high'
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : task.priority === 'medium'
                            ? 'bg-amber-50 text-amber-600 border border-amber-105'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {task.priority === 'high' ? 'High alert' : task.priority === 'medium' ? 'Regular' : 'Low priority'}
                        </span>

                        {/* Task status with dynamic member trigger trigger */}
                        {isAssignedToMe ? (
                          <button
                            onClick={() => handleStatusUpdate(task.id, task.status)}
                            className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md cursor-pointer transition-all hover:brightness-110 flex items-center gap-1 border outline-none ${
                              task.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-750 border-emerald-100'
                                : task.status === 'in_progress'
                                ? 'bg-indigo-50 text-indigo-750 border-indigo-100'
                                : 'bg-amber-50 text-amber-750 border-amber-100'
                            }`}
                            title="Click to advance status"
                          >
                            <span>Toggle Status:</span>
                            <strong className="underline uppercase">
                              {task.status === 'in_progress' ? 'Active' : task.status === 'pending' ? 'Pending' : 'Completed'}
                            </strong>
                          </button>
                        ) : (
                          <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md border ${
                            task.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : task.status === 'in_progress'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {task.status === 'in_progress' ? 'Active' : task.status === 'pending' ? 'Pending' : 'Completed'}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-800 leading-tight">
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-sans line-clamp-2 max-w-xl">
                        {task.description || 'No instruction scope detailed.'}
                      </p>

                      <div className="flex items-center gap-4 text-[10px] font-mono text-slate-450 pt-1.5 border-t border-slate-50">
                        <span className="flex items-center gap-1">
                          <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                          Due: {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Member Details */}
                    <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-0 border-slate-100 ml-0 md:ml-4">
                      {task.assignedTo && (
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-bold text-slate-800">{task.assignedTo.name}</p>
                          <span className="text-[9px] text-slate-400 font-mono">Assignee</span>
                        </div>
                      )}
                      <img
                        src={task.assignedTo?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(task.assignedTo?.name || '')}`}
                        alt="Assignee avatar"
                        className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 object-cover"
                        title={task.assignedTo?.name}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* MODAL: Associate Members List Overlay */}
      <AnimatePresence>
        {isAddMemberOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddMemberOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 overflow-hidden relative z-10 shadow-2xl shrink-0"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600 animate-pulse" />
                  <h2 className="text-sm font-bold text-slate-900 font-sans">
                    Associate Teammate
                  </h2>
                </div>
                <button
                  onClick={() => setIsAddMemberOpen(false)}
                  className="text-slate-450 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-550">
                    Select Teammate Profile
                  </label>
                  <select
                    value={memberToInvite}
                    onChange={(e) => setMemberToInvite(e.target.value)}
                    required
                    className="bg-slate-50 border border-slate-250 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm text-slate-800 w-full transition-all outline-none"
                  >
                    <option value="">-- Choose Member --</option>
                    {remainingTeammatesToInvite.map((elem) => (
                      <option key={elem.id} value={elem.id}>
                        {elem.name} ({elem.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddMemberOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-705 transition-all outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-indigo-660 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 active:translate-y-px transition-all outline-none"
                  >
                    <span>{isSubmitting ? 'Syncing...' : 'Invite'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Dispatch Task Deliverables */}
      <AnimatePresence>
        {isAddTaskOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddTaskOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 overflow-hidden relative z-10 shadow-2xl shrink-0"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-indigo-600 animate-pulse" />
                  <h2 className="text-base font-bold text-slate-900 font-sans">
                    Dispatch Task Deliverable
                  </h2>
                </div>
                <button
                  onClick={() => setIsAddTaskOpen(false)}
                  className="text-slate-450 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-4">
                
                {/* Title */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-550">
                    Deliverable Title
                  </label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Integrate Auth Token utility"
                    className="bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl py-2.5 px-4 text-sm text-slate-800 w-full transition-all outline-none"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-550">
                    Scope Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    placeholder="Provide specific instruction lists and goals..."
                    className="bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl py-2.5 px-4 text-sm text-slate-800 w-full transition-all outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Select Priority */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-550">
                      Select Priority Level
                    </label>
                    <select
                      value={taskPriority}
                      onChange={(e: any) => setTaskPriority(e.target.value)}
                      className="bg-slate-50 border border-slate-200 focus:border-indigo-603 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm text-slate-800 w-full transition-all outline-none"
                    >
                      <option value="low">Low priority</option>
                      <option value="medium">Regular</option>
                      <option value="high">High alert</option>
                    </select>
                  </div>

                  {/* Due Date */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-550">
                      Specify Target Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 focus:border-indigo-603 focus:bg-white rounded-xl py-2.5 px-4 text-sm text-slate-805 w-full transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Assignee select from project members only */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-550 border-none select-none">
                    Assign Workspace Owner
                  </label>
                  <select
                    required
                    value={taskAssignedTo}
                    onChange={(e) => setTaskAssignedTo(e.target.value)}
                    className="bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm text-slate-800 w-full transition-all outline-none"
                  >
                    <option value="">-- Choose Member --</option>
                    {project.members.map((elem) => (
                      <option key={elem.id} value={elem.id}>
                        {elem.name} ({elem.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddTaskOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-705 transition-all outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 active:translate-y-px transition-all shadow-lg shadow-indigo-650/10 outline-none"
                  >
                    <span>{isSubmitting ? 'Dispatching...' : 'Dispatch'}</span>
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
