import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { 
  CheckSquare, 
  Search, 
  ChevronDown, 
  Filter, 
  Trash2, 
  CalendarCheck,
  AlertTriangle,
  X,
  Loader2,
  ListFilter,
  CheckCircle,
  Clock,
  Briefcase
} from 'lucide-react';

interface TaskType {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedTo: { id: string; name: string; avatar: string };
  project: { _id: string; name: string } | null;
  createdAt: string;
}

export default function Tasks() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortByDateDesc, setSortByDateDesc] = useState<boolean>(false); // false = asc, true = desc

  // Delete modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasksList = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/tasks');
      if (res.success) {
        setTasks(res.tasks || []);
      }
    } catch (err: any) {
      console.error('Failed to retrieve task deliverables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasksList();
    }
  }, [user]);

  const handleStatusCycle = async (taskId: string, currentStatus: string) => {
    let nextStatus: 'pending' | 'in_progress' | 'completed' = 'pending';
    if (currentStatus === 'pending') nextStatus = 'in_progress';
    else if (currentStatus === 'in_progress') nextStatus = 'completed';

    try {
      const res = await apiFetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: { status: nextStatus },
      });

      if (res.success) {
        showToast('Task status advanced successfully', 'success');
        fetchTasksList();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to modify task status', 'error');
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      setIsSubmitting(true);
      const res = await apiFetch(`/api/tasks/${taskToDelete}`, {
        method: 'DELETE',
      });

      if (res.success) {
        showToast(res.message || 'Task deleted successfully', 'success');
        setIsDeleteOpen(false);
        setTaskToDelete(null);
        fetchTasksList();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Perform pipeline modifications in client
  let processedTasks = [...tasks];

  // Search filter
  if (searchQuery) {
    processedTasks = processedTasks.filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Status Filter
  if (statusFilter !== 'all') {
    processedTasks = processedTasks.filter((t) => t.status === statusFilter);
  }

  // Priority Filter
  if (priorityFilter !== 'all') {
    processedTasks = processedTasks.filter((t) => t.priority === priorityFilter);
  }

  // Date sorting
  processedTasks.sort((a, b) => {
    const d1 = new Date(a.dueDate).getTime();
    const d2 = new Date(b.dueDate).getTime();
    return sortByDateDesc ? d2 - d1 : d1 - d2;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-6 sm:p-10 space-y-8 max-w-6xl mx-auto"
    >
      {/* Header Panel */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans sm:text-2xl">
          Deliverables Pipeline
        </h1>
        <p className="text-xs text-slate-500 font-sans mt-0.5">
          Audit workload cards, mark task completions, and filter milestones.
        </p>
      </div>

      {/* Action Filters Panel */}
      <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm space-y-3">
        {/* Search */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 py-2.5 px-3.5 rounded-xl">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deliverables by name or scope keywords..."
            className="bg-transparent text-xs text-slate-800 placeholder-slate-400 w-full outline-none"
          />
        </div>

        {/* Filters Select Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Status filter field */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Filter By State</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs text-slate-705 outline-none transition-all"
            >
              <option value="all">🌐 All Statuses</option>
              <option value="pending">⏳ Pending</option>
              <option value="in_progress">⚡ In Progress</option>
              <option value="completed">✅ Completed</option>
            </select>
          </div>

          {/* Priority filter field */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Filter By Priority</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs text-slate-705 outline-none transition-all"
            >
              <option value="all">⭐ All Priorities</option>
              <option value="high">🚨 High alert</option>
              <option value="medium">⚡ Regular</option>
              <option value="low">🌱 Low priorities</option>
            </select>
          </div>

          {/* Sort option */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Delivery Sort</span>
            <button
              onClick={() => setSortByDateDesc(!sortByDateDesc)}
              type="button"
              className="bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl py-2 px-3 text-xs text-slate-700 flex items-center justify-between text-left transition-all outline-none"
            >
              <span>{sortByDateDesc ? '📅 Due: Furthest Date' : '📅 Due: Soonest Date'}</span>
              <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
            </button>
          </div>

        </div>
      </div>

      {/* Main deliverables list */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs font-mono">Loading Deliverables Pipelines...</p>
        </div>
      ) : processedTasks.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center p-6 border border-slate-200 border-dashed rounded-3xl bg-slate-50 max-w-md mx-auto">
          <CheckSquare className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-sm font-bold text-slate-800 font-sans">No task deliverables found</h3>
          <p className="text-xs text-slate-550 max-w-xs mt-1 leading-relaxed">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try modifying your search or parameter filter queries.'
              : 'There are no active workloads assigned to your workspace profile.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {processedTasks.map((task) => {
            const isAssignedToMe = task.assignedTo?.id === user?.id;

            return (
              <motion.div
                layout
                key={task.id}
                className="bg-white border border-slate-200 p-5 rounded-3xl hover:border-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all shadow-sm group"
              >
                <div className="min-w-0 flex-1 space-y-1.5 animate-fade-in">
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Project link badge */}
                    {task.project && (
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md flex items-center gap-1 shrink-0">
                        <Briefcase className="w-3 h-3 text-indigo-500" />
                        {task.project.name}
                      </span>
                    )}

                    {/* Task Priority Level */}
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md shrink-0 ${
                      task.priority === 'high'
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : task.priority === 'medium'
                        ? 'bg-amber-50 text-amber-600 border border-amber-105'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {task.priority === 'high' ? 'High alert' : task.priority === 'medium' ? 'Regular' : 'Low alert'}
                    </span>

                    {/* Task Status */}
                    {isAssignedToMe ? (
                      <button
                        onClick={() => handleStatusCycle(task.id, task.status)}
                        className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md cursor-pointer transition-all hover:brightness-110 flex items-center gap-1 border shrink-0 outline-none ${
                          task.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-750 border-emerald-100'
                            : task.status === 'in_progress'
                            ? 'bg-indigo-50 text-indigo-750 border-indigo-100'
                            : 'bg-amber-50 text-amber-755 border-amber-100'
                        }`}
                        title="Click to cycle status"
                      >
                        <span>Status:</span>
                        <strong className="underline font-bold uppercase">
                          {task.status === 'in_progress' ? 'Active' : task.status === 'pending' ? 'Pending' : 'Completed'}
                        </strong>
                      </button>
                    ) : (
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md border shrink-0 ${
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

                  <h3 className="text-sm font-extrabold text-slate-800 leading-tight">
                    {task.title}
                  </h3>
                  
                  <p className="text-xs text-slate-500 font-sans leading-relaxed line-clamp-2 max-w-2xl">
                    {task.description || 'No instruction scope detailed.'}
                  </p>

                  <div className="flex items-center gap-4 text-[10px] font-mono text-slate-450 pt-1.5 border-t border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                      Due Limit: {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Assigned member avatar + trash button for admin */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-0 border-slate-100 ml-0 md:ml-4">
                  {task.assignedTo && (
                    <div className="flex items-center gap-2.5">
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-800 leading-tight">{task.assignedTo.name}</p>
                        <span className="text-[9px] font-mono text-slate-405">Assignee</span>
                      </div>
                      <img
                        src={task.assignedTo.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(task.assignedTo.name)}`}
                        alt={task.assignedTo.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full border border-slate-200 object-cover bg-slate-50 shrink-0"
                        title={task.assignedTo.name}
                      />
                    </div>
                  )}

                  {user?.role === 'admin' && (
                    <button
                      onClick={() => {
                        setTaskToDelete(task.id);
                        setIsDeleteOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-50 transition-all outline-none cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

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
              
              <h2 className="text-base font-bold text-slate-900 mb-2 font-sans">
                Teardown Task Deliverable?
              </h2>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed font-sans">
                Applying this action will <strong className="text-slate-900">permanently delete this task deliverable</strong>. Sprints metrics will automatically adjust.
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-705 transition-all outline-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTask}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 active:translate-y-px transition-all outline-none"
                >
                  <span>{isSubmitting ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
