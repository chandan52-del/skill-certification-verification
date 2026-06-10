import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Camera, Upload, Building2, User as UserIcon } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function OnboardingPage({ user, setUser }: { user: any, setUser: any }) {
  const [role, setRole] = useState(user.role || 'student');
  const [profileImage, setProfileImage] = useState(user.profile_image || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setProfileImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = async () => {
    if (role === 'student' && (!user.email.includes('.edu') && !user.email.includes('.ac.'))) {
      setError("Student role requires a valid college email address domain (.edu or .ac.).");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        role: role,
        profile_image: profileImage,
        onboarded: true,
        updatedAt: Date.now()
      });

      setUser({ ...user, role, profile_image: profileImage, onboarded: true });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900 overflow-hidden p-8"
      >
        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
          Complete Your Profile
        </h2>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-8">
          Welcome! Just a few more details before you can access your dashboard.
        </p>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="flex flex-col flex-1 gap-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">1. Select Your Role</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label 
                className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all ${
                  role === 'student' 
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500' 
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                }`}
                onClick={() => setRole('student')}
              >
                <div className="absolute top-3 right-3">
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    role === 'student' ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {role === 'student' && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                </div>
                <UserIcon className={`h-10 w-10 mb-3 ${role === 'student' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span className={`font-semibold ${role === 'student' ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-slate-300'}`}>Student</span>
                <span className="text-xs text-center mt-2 text-slate-500 dark:text-slate-400">Manage and view your credentials</span>
              </label>

              <label 
                className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all ${
                  role === 'institute' 
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500' 
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                }`}
                onClick={() => setRole('institute')}
              >
                <div className="absolute top-3 right-3">
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    role === 'institute' ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {role === 'institute' && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                </div>
                <Building2 className={`h-10 w-10 mb-3 ${role === 'institute' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span className={`font-semibold ${role === 'institute' ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-slate-300'}`}>Institution</span>
                <span className="text-xs text-center mt-2 text-slate-500 dark:text-slate-400">Issue and manage certificates</span>
              </label>
            </div>
            {role === 'student' && (
              <p className="text-xs text-slate-500 border-l-2 border-indigo-400 pl-2">
                Student accounts require a verified matching educational domain (e.g. .edu or .ac).
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">2. Profile Picture</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md dark:border-slate-800 dark:bg-slate-800 flex items-center justify-center">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow-sm hover:bg-blue-700 transition"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Upload a photo
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                  We'll use this picture across your certificates and dashboard profile.
                </p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 transition"
                >
                  <Upload className="h-3 w-3 inline mr-1 -mt-0.5" /> Choose File
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleComplete}
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 mt-8 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving...' : 'Complete Registration'}
        </button>
      </motion.div>
    </div>
  );
}
