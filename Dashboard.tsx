import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { apiFetch } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.js';
import { 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  FileText, 
  AlertTriangle,
  UserCheck,
  TrendingUp,
  Plus,
  Loader2,
  CalendarCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number; // pending + in_progress
  inProgressTasks: number;
  overdueTasks: number;
  assignedTasksCount: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    assignedTasksCount: 0,
  });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [projectsData, tasksData] = await Promise.all([
          apiFetch('/api/projects'),
          apiFetch('/api/tasks')
        ]);

        if (projectsData.success && tasksData.success) {
          const prjs = projectsData.projects || [];
          const tsks = tasksData.tasks || [];

          // Calculate statistics
          const now = new Date();
          const completed = tsks.filter((t: any) => t.status === 'completed').length;
          const pending = tsks.filter((t: any) => t.status === 'pending').length;
          const inProgress = tsks.filter((t: any) => t.status === 'in_progress').length;
          
          const overdue = tsks.filter((t: any) => {
            const isCompleted = t.status === 'completed';
            const isOverdue = t.dueDate && new Date(t.dueDate) < now;
            return !isCompleted && isOverdue;
          }).length;

          const assignedToMe = tsks.filter((t: any) => t.assignedTo?.id === user?.id).length;

          setStats({
            totalProjects: prjs.length,
            totalTasks: tsks.length,
            completedTasks: completed,
            pendingTasks: pending,
            inProgressTasks: inProgress,
            overdueTasks: overdue,
            assignedTasksCount: assignedToMe,
          });

          // Recent Activities
          setRecentTasks(tsks.slice(0, 5));
          setRecentProjects(prjs.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-xs font-mono">Formulating Analytics Board...</p>
      </div>
    );
  }

  // Calculate project completion ratios
  const overallCompletions = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  // Custom SVG Donut setup
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallCompletions / 100) * circumference;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-6 sm:p-10 space-y-8 max-w-6xl mx-auto"
    >
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans sm:text-3xl">
            Workspace Panel
          </h1>
          <p className="text-sm text-slate-500 font-sans mt-0.5">
            Operational dashboard and workload distributions for today.
          </p>
        </div>

        {user?.role === 'admin' && (
          <Link
            to="/projects"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 border border-indigo-500/10 shadow-lg shadow-indigo-600/10 w-fit outline-none transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Create Workspace</span>
          </Link>
        )}
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Projects */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Projects</span>
            <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900 font-sans leading-none">
              {stats.totalProjects}
            </span>
            <p className="text-xs text-slate-500 font-sans mt-1">Involved Workspaces</p>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Tasks</span>
            <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900 font-sans leading-none">
              {stats.totalTasks}
            </span>
            <p className="text-xs text-slate-500 font-sans mt-1">Overall Deliverables</p>
          </div>
        </div>

        {/* Task Completion Rate */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Assigned</span>
            <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900 font-sans leading-none">
              {stats.assignedTasksCount}
            </span>
            <p className="text-xs text-slate-500 font-sans mt-1">Tasks targeting you</p>
          </div>
        </div>

        {/* Overdue Limit */}
        <div className={`border p-6 rounded-3xl shadow-sm flex flex-col justify-between transition-all ${
          stats.overdueTasks > 0 
            ? 'border-rose-200 bg-rose-50/50 shadow-rose-100/10' 
            : 'bg-white border-slate-200 hover:shadow-md'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Overdue</span>
            <div className={`p-2 rounded-xl border ${
              stats.overdueTasks > 0 
                ? 'bg-rose-105 border-rose-200 text-rose-600' 
                : 'bg-indigo-50 border-indigo-100 text-indigo-600'
            }`}>
              {stats.overdueTasks > 0 ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-3xl font-bold font-sans leading-none ${
              stats.overdueTasks > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}>
              {stats.overdueTasks}
            </span>
            <p className="text-xs text-slate-500 font-sans mt-1">Missed target dates</p>
          </div>
        </div>

      </div>

      {/* Charts & Interactive Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* SVG Progress Donut Gauge */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col h-full hover:shadow-md transition-all">
          <div className="flex items-center gap-1.5 bg-indigo-50 py-1.5 px-3 rounded-lg border border-indigo-100 w-fit mb-6">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            <h3 className="text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-wider">
              Workspace Completion Ratio
            </h3>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 py-4">
            <div className="relative flex items-center justify-center w-36 h-36">
              
              {/* SVG circular track */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="text-slate-100"
                  strokeWidth={strokeWidth}
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="text-indigo-600"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>

              {/* Central ratio text */}
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-3xl font-black text-slate-900 font-mono leading-none">
                  {overallCompletions}%
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-550 uppercase mt-1">
                  Completed
                </span>
              </div>
            </div>

            <div className="mt-6 text-center space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                Goal: Complete overall workloads
              </p>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                {stats.completedTasks} associated tasks checked. {stats.totalTasks - stats.completedTasks} pending items.
              </p>
            </div>
          </div>
        </div>

        {/* Custom SVG Column Bar Graph for Task distributions */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm md:col-span-2 flex flex-col h-full hover:shadow-md transition-all">
          <div className="flex items-center gap-1.5 bg-indigo-50 py-1.5 px-3 rounded-lg border border-indigo-100 w-fit mb-6">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <h3 className="text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-wider">
              Task State Concentration Chart
            </h3>
          </div>

          <div className="flex-1 flex flex-col justify-end gap-5 py-2">
            
            {/* Status bars columns */}
            <div className="grid grid-cols-3 gap-6 h-36 items-end px-4 border-b border-slate-100 pb-3">
              
              {/* Column 1: Pending */}
              <div className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs font-mono font-bold text-slate-700">{stats.pendingTasks}</span>
                <div 
                  className="bg-amber-100 border-t-2 border-amber-400 w-full rounded-t-lg transition-all duration-550"
                  style={{ height: `${stats.totalTasks > 0 ? (stats.pendingTasks / stats.totalTasks) * 100 : 0}%`, minHeight: '6px' }}
                />
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500">Pending</span>
              </div>

              {/* Column 2: In Progress */}
              <div className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs font-mono font-bold text-indigo-600">{stats.inProgressTasks}</span>
                <div 
                  className="bg-indigo-100 border-t-2 border-indigo-500 w-full rounded-t-lg transition-all duration-550"
                  style={{ height: `${stats.totalTasks > 0 ? (stats.inProgressTasks / stats.totalTasks) * 100 : 0}%`, minHeight: '6px' }}
                />
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500">Active</span>
              </div>

              {/* Column 3: Completed */}
              <div className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs font-mono font-bold text-emerald-600">{stats.completedTasks}</span>
                <div 
                  className="bg-emerald-100 border-t-2 border-emerald-500 w-full rounded-t-lg transition-all duration-550"
                  style={{ height: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%`, minHeight: '6px' }}
                />
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500">Done</span>
              </div>

            </div>

            <p className="text-xs text-slate-550 font-sans text-center leading-normal px-4">
              Columns portray individual state counts relative to overall deliverables totals. State changes automatically recalculate metrics.
            </p>
          </div>
        </div>

      </div>

      {/* Main Bottom Section: Recent Workspaces and Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recent Workspaces */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">
                Assigned projects
              </h4>
              <Link to="/projects" className="text-xs text-indigo-600 hover:text-indigo-700 transition-all font-bold hover:underline">
                View All
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-slate-200 border-dashed rounded-2xl bg-slate-50">
                <FolderKanban className="w-8 h-8 text-slate-350 mb-2" />
                <p className="text-xs text-slate-500">No projects compiled yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((p) => (
                  <Link 
                    key={p.id} 
                    to={`/projects/${p.id}`}
                    className="block p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-850 group-hover:text-indigo-605 transition-colors truncate max-w-[200px]">
                        {p.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 shrink-0">
                        {p.progress}% Progress
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-1">
                      {p.description || 'No description designated.'}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">
                Deliverables pipeline
              </h4>
              <Link to="/tasks" className="text-xs text-indigo-600 hover:text-indigo-700 transition-all font-bold hover:underline">
                View All
              </Link>
            </div>

            {recentTasks.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-slate-200 border-dashed rounded-2xl bg-slate-55">
                <CheckSquare className="w-8 h-8 text-slate-350 mb-2" />
                <p className="text-xs text-slate-500">No tasks created yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.slice(0, 4).map((t) => (
                  <Link 
                    key={t.id} 
                    to="/tasks"
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-105 bg-slate-50/50 hover:bg-slate-55 hover:border-slate-200 transition-all group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-850 group-hover:text-indigo-605 transition-all truncate">
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md ${
                          t.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : t.status === 'in_progress'
                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {t.status === 'in_progress' ? 'Active' : t.status === 'pending' ? 'Pending' : 'Completed'}
                        </span>
                        
                        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                          {t.dueDate ? new Date(t.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'No Limit'}
                        </span>
                      </div>
                    </div>
                    {t.assignedTo?.avatar && (
                      <img
                        src={t.assignedTo.avatar}
                        alt="assigned"
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full border border-slate-200 bg-slate-100 object-cover ml-3 shrink-0 animate-fade-in"
                        title={t.assignedTo.name}
                      />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
