import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Building2, 
  ArrowRight, 
  ShieldCheck, 
  BarChart3, 
  Users2, 
  CheckCircle2, 
  Activity 
} from 'lucide-react';

export default function Landing() {
  const token = localStorage.getItem('token');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80 } },
  };

  const features = [
    {
      icon: Users2,
      title: 'Teammate Assignment & Sync',
      desc: 'Link multiple members to individual projects and tasks, supporting clean role divisions.',
    },
    {
      icon: ShieldCheck,
      title: 'Role-Based Clearance Layers',
      desc: 'Enforce full secure action control. Admins dispatch targets, while Members update statuses.',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Progress Metrics',
      desc: 'Formulate overall workspace completion scales automatically via live charts and ratios.',
    },
    {
      icon: Activity,
      title: 'Operational Dashboard Hub',
      desc: 'Observe overdue limits, task concentrations, and member queues inside an unified panel.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between overflow-x-hidden relative font-sans">
      {/* Background visual glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Header */}
      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-200 sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 select-none">
        <div className="flex items-center gap-2.5">
          <Building2 className="w-8 h-8 text-indigo-600 animate-pulse" />
          <span className="text-base font-extrabold tracking-tight text-slate-900 uppercase font-sans">
            Team Task Manager
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            to={token ? "/dashboard" : "/login"} 
            className="text-sm font-semibold text-slate-505 hover:text-slate-900 transition-all cursor-pointer"
          >
            Sign In
          </Link>
          <Link
            to={token ? "/dashboard" : "/signup"}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 text-white transition-all border border-indigo-50/50 cursor-pointer"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main hero section */}
      <main className="max-w-6xl w-full mx-auto px-6 py-20 flex flex-col gap-24 relative z-10 shrink-0">
        
        {/* Intro */}
        <motion.div 
          className="text-center flex flex-col items-center gap-6 max-w-3xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            variants={itemVariants}
            className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full flex items-center gap-2 select-none"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> SECURE MERN WORKSPACE
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight font-sans"
          >
            Collaborative Tasking <br />
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-805 bg-clip-text text-transparent">
              Engineered with Precision
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-sm md:text-base text-slate-500 leading-relaxed max-w-2xl font-sans"
          >
            Streamline your project pipelines, organize task assignees, and track progress
            percentages instantly inside a modern, secure collaborative workspace.
          </motion.p>

          <motion.div 
            variants={itemVariants} 
            className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4"
          >
            <Link
              to={token ? "/dashboard" : "/signup"}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 transition-all border border-indigo-50/20 cursor-pointer"
            >
              <span>Set up a Demo Team</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={token ? "/dashboard" : "/login"}
              className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-200 cursor-pointer"
            >
              <span>Use Demo Account</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white border border-slate-202 hover:border-slate-300 p-8 rounded-3xl flex gap-5 transition-all shadow-sm group"
              >
                <div className="p-3 bg-indigo-50 group-hover:bg-indigo-100 border border-indigo-100/20 text-indigo-600 rounded-xl shrink-0 h-fit transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800 mb-2 font-sans group-hover:text-indigo-600 transition-colors">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    {feat.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Outlets / Demo Credentials callout */}
        <motion.div 
          className="bg-white border border-slate-200 rounded-3xl p-8 text-center max-w-2xl mx-auto flex flex-col gap-4 shadow-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h5 className="text-xs font-bold text-indigo-600 tracking-wider uppercase font-mono select-none">
            💡 Instant Playback Sandbox Mode
          </h5>
          <p className="text-xs text-slate-500 leading-relaxed">
            The workspace features a high-fidelity fully persisted Local Storage system 
            that is pre-seeded. Logs run instantly without any configuration.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 text-xs font-mono text-slate-500 mt-2">
            <span className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              Admin: <strong className="text-slate-805">admin@teamtask.com</strong> / password123
            </span>
            <span className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              Member: <strong className="text-slate-805">member@teamtask.com</strong> / password123
            </span>
          </div>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-slate-400 text-xs mt-20 font-mono">
        <p>© 2026 Team Task Manager. Built and Compiled in Google AI Studio sandbox.</p>
      </footer>
    </div>
  );
}
