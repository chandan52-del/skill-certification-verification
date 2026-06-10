import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import VerifyPage from './pages/VerifyPage';
import CertificateView from './pages/CertificateView';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUser({ ...currentUser, ...userDoc.data() });
        } else {
          const newUser = {
            name: currentUser.displayName || 'Anonymous',
            email: currentUser.email || '',
            role: 'student',
            profile_image: currentUser.photoURL || '',
            onboarded: false
          };
          try {
            await setDoc(doc(db, 'users', currentUser.uid), newUser);
          } catch(e) {
            console.error("Error creating user doc", e);
          }
          setUser({ uid: currentUser.uid, ...newUser });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50 flex flex-col font-sans">
        <Navbar user={user} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
            <Route 
              path="/dashboard/*" 
              element={user ? (user.onboarded === false ? <Navigate to="/onboarding" /> : <Dashboard user={user} />) : <Navigate to="/login" />} 
            />
            <Route 
              path="/onboarding" 
              element={user && user.onboarded === false ? <OnboardingPage user={user} setUser={setUser} /> : <Navigate to="/dashboard" />} 
            />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/verify/:certificateId" element={<CertificateView />} />
          </Routes>
        </main>
        
        {/* Environment Status Bar */}
        <footer className="h-8 bg-slate-800 text-slate-400 px-6 flex items-center justify-between text-[10px] shrink-0 z-50">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> System Operational</span>
            <span>Cloud Storage: Connection Healthy</span>
            <span>Certificates DB: Active</span>
          </div>
          <div className="flex gap-4 hidden sm:flex">
            <span>v2.4.0-stable</span>
            <Link to="#" className="text-slate-200">Privacy Policy</Link>
            <Link to="#" className="text-slate-200">Security Protocol</Link>
          </div>
        </footer>
      </div>
    </Router>
  );
}
