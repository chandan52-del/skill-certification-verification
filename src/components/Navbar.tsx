import { Link } from 'react-router-dom';
import { ShieldCheck, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { logOut } from '../lib/firebase';
import { motion } from 'framer-motion';

export default function Navbar({ user }: { user: any }) {
  return (
    <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
              SkillVerify<span className="text-blue-600 font-medium text-sm ml-1 hidden sm:inline">Enterprise</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
             <Link to="/verify" className="hover:text-slate-800 dark:hover:text-slate-200 h-16 flex items-center">Verify Certificate</Link>
             {user && (
                <>
                  <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 border-b-2 border-blue-600 h-16 flex items-center">Dashboard</Link>
                  <Link to="/dashboard/certificates" className="hover:text-slate-800 dark:hover:text-slate-200 h-16 flex items-center">My Certificates</Link>
                </>
             )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
                <span className="text-xs text-slate-500 capitalize">{user.role}</span>
              </div>
              
              {user.profile_image ? (
                <img src={user.profile_image} className="w-10 h-10 bg-slate-200 rounded-full border border-slate-300 dark:border-slate-700" alt="Profile" />
              ) : (
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 font-bold">
                  {user.name?.charAt(0)}
                </div>
              )}
              <button 
                onClick={logOut}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                title="Log Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
