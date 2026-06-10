import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, User as UserIcon, Building2, Github } from 'lucide-react';
import { signInWithEmail, registerWithEmail, signInWithGoogle, signInWithGithub } from '../lib/firebase';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'student' | 'institute'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        const finalRole = userType === 'student' ? 'student' : role; // Use dropdown role if institute tab (for Admin vs Institute)
        if (finalRole === 'student' && (!email.includes('.edu') && !email.includes('.ac.'))) {
          throw new Error("Student registration requires a valid college email address domain (.edu or .ac.).");
        }
        await registerWithEmail(email, password, name, finalRole);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError('');
    setLoading(true);
    try {
      if (provider === 'google') {
        await signInWithGoogle('student');
      } else {
        await signInWithGithub('student');
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || `Authentication with ${provider} failed`);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.5, staggerChildren: 0.1, ease: 'easeOut' }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 px-4 py-12">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
      >
        <motion.div variants={itemVariants} className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => { setUserType('student'); setError(''); }}
            className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${
              userType === 'student' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <UserIcon className="h-4 w-4" />
            Student Portal
          </button>
          <button
            onClick={() => { setUserType('institute'); setError(''); setRole('institute'); }}
            className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${
              userType === 'institute' 
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10 dark:text-indigo-400' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Organization
          </button>
        </motion.div>

        <div className="p-8">
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${userType === 'student' ? 'bg-blue-600' : 'bg-indigo-600'}`}>
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
          </motion.div>
          <motion.h2 variants={itemVariants} className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
            {isLogin 
              ? (userType === 'student' ? 'Student Login' : 'Organization Login') 
              : (userType === 'student' ? 'Student Registration' : 'Register Organization')
            }
          </motion.h2>
          <motion.p variants={itemVariants} className="text-center text-sm text-slate-500 dark:text-slate-400 mb-8">
            {userType === 'student' 
              ? 'Use your college email address to access your certificates.'
              : 'Secure access for institutions and management via email and password.'}
          </motion.p>

          {error && (
            <motion.div variants={itemVariants} className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      required 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white sm:text-sm"
                      placeholder={userType === 'student' ? "Jane Doe" : "Organization Name"}
                    />
                  </div>
                </motion.div>
                {userType === 'institute' && (
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Type</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-4 w-4 text-slate-400" />
                      </div>
                      <select 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white sm:text-sm"
                      >
                        <option value="institute">Institution / College</option>
                        <option value="admin">Management / Admin</option>
                        <option value="employer">Employer / Recruiter</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {userType === 'student' ? 'College Email Address' : 'Official Email Address'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 dark:bg-slate-800 dark:border-slate-700 dark:text-white sm:text-sm ${
                    userType === 'student' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  placeholder={userType === 'student' ? 'college-id@college.edu' : 'admin@institution.edu'}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 dark:bg-slate-800 dark:border-slate-700 dark:text-white sm:text-sm ${
                    userType === 'student' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors mt-6 ${
                userType === 'student'
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
              }`}
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In Securely' : 'Create Account'}
            </motion.button>
          </form>

          {userType === 'student' && (
            <motion.div variants={itemVariants} className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth('github')}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700"
                >
                  <Github className="h-5 w-5 mr-2" />
                  GitHub
                </button>
              </div>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="mt-6 text-center">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className={`text-sm font-medium ${
                userType === 'student' ? 'text-blue-600 hover:text-blue-500 dark:text-blue-400' : 'text-indigo-600 hover:text-indigo-500 dark:text-indigo-400'
              }`}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
