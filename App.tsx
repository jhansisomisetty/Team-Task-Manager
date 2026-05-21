import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { Sidebar } from './components/Sidebar.js';
import { Navbar } from './components/Navbar.js';

// Page Imports
import Landing from './pages/Landing.js';
import Login from './pages/Login.js';
import Signup from './pages/Signup.js';
import Dashboard from './pages/Dashboard.js';
import Projects from './pages/Projects.js';
import ProjectDetails from './pages/ProjectDetails.js';
import Tasks from './pages/Tasks.js';
import Profile from './pages/Profile.js';
import AdminBoard from './pages/AdminBoard.js';
import NotFound from './pages/NotFound.js';

function AuthenticatedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
      {/* Sidebar drawer structure */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Viewport frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

        {/* Dashboard viewing canvas */}
        <main className="flex-1 overflow-y-auto bg-slate-50 relative">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/profile" element={<Profile />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminBoard />
                </ProtectedRoute>
              } 
            />
            {/* Catch-all 404 inside authenticated layout */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Entry Points */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Secure Workspace Pipelines */}
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
