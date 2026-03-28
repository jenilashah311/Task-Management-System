import React, { useState } from 'react';
import { CheckSquare, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  sidebarExtra?: React.ReactNode;
}

export default function Layout({ children, sidebarExtra }: LayoutProps) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-lg leading-tight">TaskFlow</p>
            <p className="text-xs text-slate-400">Task Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Workspace
        </p>
        <a
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-sm"
        >
          <CheckSquare className="w-4 h-4" />
          All Tasks
        </a>

        {sidebarExtra && (
          <div className="mt-4 px-1 space-y-2">
            {sidebarExtra}
          </div>
        )}
      </nav>

      {/* User profile */}
      <div className="px-3 py-4 border-t border-slate-700/60">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate capitalize">{user?.role?.toLowerCase()}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="text-slate-400 hover:text-white transition-colors p-1 rounded"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 flex flex-col z-10">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setMobileMenuOpen(true)} className="text-gray-600">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">TaskFlow</span>
          </div>
          <button onClick={logout} className="text-gray-500">
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
