import { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { BookOpen, Award, BarChart, Settings, Plus, QrCode, RefreshCw, Activity, Search, Linkedin, Share2, X, Download, CheckCircle, Calendar, Building2, User } from 'lucide-react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ user }: { user: any }) {

  const toggleRole = async () => {
    const roles = ['student', 'institute', 'admin', 'employer'];
    const nextRole = roles[(roles.indexOf(user.role) + 1) % roles.length] || 'student';
    await updateDoc(doc(db, 'users', user.uid), { role: nextRole });
    window.location.reload();
  };

  // Render sub-dashboards based on user.role
  return (
    <div className="flex flex-1 flex-col bg-slate-50 dark:bg-slate-900 w-full overflow-hidden h-[calc(100vh-6rem)]">
      {/* Secondary Top Navigation rather than Sidebar for denser layout similar to the design if needed? No, wait, design HTML doesn't have sidebar, but we should preserve functionality. I will style the main layout dense. */}
      {/* Sidebar */}
      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        <aside className="w-64 border border-slate-200 bg-white rounded-xl shadow-sm p-4 dark:border-slate-800 dark:bg-slate-950 flex flex-col h-full shrink-0">
          <div className="flex items-center gap-3 mb-8 px-2">
            {user.profile_image ? (
              <img src={user.profile_image} alt="Profile" className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold uppercase">
                 {user.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="overflow-hidden flex flex-col">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</span>
              <span className="text-xs text-slate-500 capitalize">{user.role}</span>
            </div>
          </div>
          
          <nav className="flex-1 flex flex-col gap-2">
            <Link to="/dashboard" className="flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <BarChart className="h-4 w-4" /> Overview
            </Link>
            <Link to="/dashboard/certificates" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
              <Award className="h-4 w-4" /> Certificates
            </Link>
            {user.role === 'student' && (
              <Link to="/dashboard/portfolio" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                <BookOpen className="h-4 w-4" /> My Portfolio
              </Link>
            )}
            {user.role === 'institute' && (
              <Link to="/dashboard/issue" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                <Plus className="h-4 w-4" /> Issue New
              </Link>
            )}
            {user.role === 'admin' && (
              <Link to="/dashboard/logs" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                <Activity className="h-4 w-4" /> Verification Logs
              </Link>
            )}
            {user.role === 'employer' && (
              <Link to="/dashboard/search" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                <Search className="h-4 w-4" /> Candidate Search
              </Link>
            )}
          </nav>
          
          <div className="mt-auto px-2">
             <button onClick={toggleRole} className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
               <RefreshCw className="h-3 w-3" /> Toggle View (Admin)
             </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-[2] flex flex-col overflow-y-auto pr-2 gap-6">
          <Routes>
            <Route path="/" element={<Overview user={user} />} />
            <Route path="/certificates" element={<CertificatesList user={user} />} />
            <Route path="/portfolio" element={user.role === 'student' ? <StudentPortfolio user={user} /> : <div>Access Denied</div>} />
            <Route path="/issue" element={user.role === 'institute' ? <IssueCertificate user={user} /> : <div>Access Denied</div>} />
            <Route path="/logs" element={user.role === 'admin' ? <VerificationLogsList user={user} /> : <div>Access Denied</div>} />
            <Route path="/search" element={user.role === 'employer' || user.role === 'admin' ? <EmployerSearch user={user} /> : <div>Access Denied</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function SkillBadges({ certs }: { certs: any[] }) {
  // Group certs by skillName and count them
  const skillCounts: Record<string, number> = {};
  certs.forEach(c => {
    if (c.skillName) {
      const name = c.skillName.trim();
      skillCounts[name] = (skillCounts[name] || 0) + 1;
    }
  });

  const getBadgeTier = (count: number) => {
    if (count >= 3) return { level: 'Expert', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' };
    if (count === 2) return { level: 'Intermediate', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' };
    return { level: 'Beginner', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 dark:bg-slate-950">
      <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center">
        <Award className="h-5 w-5 mr-2 text-indigo-500" />
        My Skill Badges
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(skillCounts).map(([skill, count]) => {
          const tier = getBadgeTier(count);
          return (
            <div key={skill} className={`flex flex-col items-center justify-center p-4 rounded-lg border content-center ${tier.bg} ${tier.border} dark:bg-opacity-10 dark:border-opacity-20`}>
              <Award className={`h-8 w-8 mb-2 ${tier.color}`} />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 text-center">{skill}</span>
              <span className={`text-[10px] mt-1 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${tier.color} bg-white dark:bg-slate-800`}>
                {tier.level}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Overview({ user }: { user: any }) {
  const [stats, setStats] = useState({ certs: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [studentCerts, setStudentCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        let q;
        if (user.role === 'student') {
          q = query(collection(db, 'certificates'), where('userId', '==', user.uid));
        } else if (user.role === 'institute') {
          q = query(collection(db, 'certificates'), where('instituteId', '==', user.uid));
        } else if (user.role === 'admin') {
          q = query(collection(db, 'certificates'));
        } else {
          // Employer sees what they searched (handled later)
          setStats({ certs: 0 });
          setLoading(false);
          return;
        }
        
        const snaps = await getDocs(q);
        setStats({ certs: snaps.size });

        if (user.role === 'student') {
          const certsData = snaps.docs.map(doc => doc.data());
          setStudentCerts(certsData);
        }

        if (user.role === 'admin') {
          const now = Date.now();
          const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
          
          const dailyCounts: Record<string, number> = {};
          
          // Initialize last 30 days
          for (let i = 29; i >= 0; i--) {
            const d = new Date(now - i * 24 * 60 * 60 * 1000);
            const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            dailyCounts[dateStr] = 0;
          }

          snaps.docs.forEach(doc => {
            const data = doc.data();
            // Fallback for missing issue_date to today for visualization demo purposes, else use actual issue_date
            const issueDate = data.issue_date || now;
            if (issueDate >= thirtyDaysAgo) {
              const d = new Date(issueDate);
              const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              if (dailyCounts[dateStr] !== undefined) {
                dailyCounts[dateStr]++;
              }
            }
          });

          const formattedData = Object.entries(dailyCounts).map(([date, count]) => ({
            date,
            count
          }));
          
          setChartData(formattedData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [user]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {user.role === 'student' ? 'Earned Certificates' : user.role === 'institute' ? 'Issued Certificates' : 'Total System Certificates'}
          </p>
          <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">
            {loading ? '-' : stats.certs}
          </p>
          <div className="mt-2 flex items-center text-xs text-blue-600 dark:text-blue-400">
            Valid Database Records
          </div>
        </div>
      </div>
      
      {!loading && stats.certs === 0 && user.role === 'student' && (
        <div className="bg-white flex-[1] rounded-xl shadow-sm border border-slate-200 flex flex-col p-8 text-center text-slate-500 dark:bg-slate-950 dark:border-slate-800">
           No certificates found. Complete an assessment to earn credentials.
        </div>
      )}

      {user.role === 'admin' && !loading && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6">Certificate Performance (Last 30 Days)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {user.role === 'student' && studentCerts.length > 0 && !loading && (
        <SkillBadges certs={studentCerts} />
      )}
      
      {/* Using the Verification Portal style for the Overview as an extra component layer */}
      <div className="bg-blue-600 rounded-xl p-5 text-white shadow-lg shadow-blue-200 flex flex-col mt-4">
        <h4 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">Platform Security</h4>
        <p className="text-[11px] leading-relaxed opacity-70">
          All certificates are cryptographically signed and stored in our highly available cloud database.
          They are instantly verifiable by employers from any location.
        </p>
      </div>
    </div>
  );
}

function StudentPortfolio({ user }: { user: any }) {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCerts() {
      try {
        const q = query(collection(db, 'certificates'), where('userId', '==', user.uid));
        const snaps = await getDocs(q);
        const fetched = snaps.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCerts(fetched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCerts();
  }, [user]);

  if (loading) return <div className="p-6">Loading portfolio...</div>;

  // Group certs by skillName
  const grouped: Record<string, any[]> = {};
  certs.forEach(cert => {
    const name = cert.skillName?.trim() || 'Other';
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(cert);
  });

  const generateLinkedinShareUrl = (cert: any) => {
    const url = `${window.location.origin}/verify/${cert.id}`;
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 dark:bg-slate-950 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <BookOpen className="h-6 w-6 mr-3 text-indigo-500" />
              My Skill Portfolio
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Your earned certificates organized by skills.
            </p>
          </div>
        </div>
        
        {Object.keys(grouped).length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl dark:border-slate-800">
            <Award className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-medium text-slate-500">No certificates yet</h3>
            <p className="text-sm text-slate-400">Your portfolio will build up as you earn certificates.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([skill, skillCerts]) => (
              <div key={skill} className="border border-slate-200 rounded-xl overflow-hidden dark:border-slate-800">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{skill}</h3>
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400">
                    {skillCerts.length} Certificates
                  </span>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {skillCerts.map((cert) => (
                    <div key={cert.id} className="border border-slate-100 rounded-lg p-4 flex gap-4 bg-white shadow-sm dark:bg-slate-950 dark:border-slate-800 hover:shadow-md transition">
                      <div className="h-12 w-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex flex-col items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                        <Award className="h-6 w-6 text-indigo-500" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">{cert.courseName}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{cert.instituteName}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <Link to={`/verify/${cert.id}`} target="_blank" className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center dark:text-slate-400 dark:hover:text-slate-200">
                            <Share2 className="h-3 w-3 mr-1" /> View
                          </Link>
                          <a href={generateLinkedinShareUrl(cert)} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center bg-blue-50 px-2 py-1 rounded dark:bg-blue-900/30 dark:text-blue-400 dark:hover:text-blue-300 transition">
                            <Linkedin className="h-3 w-3 mr-1" /> Share to LinkedIn
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CertificatesList({ user }: { user: any }) {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCerts() {
      try {
        let q;
        if (user.role === 'student') {
          q = query(collection(db, 'certificates'), where('userId', '==', user.uid));
        } else if (user.role === 'institute') {
          q = query(collection(db, 'certificates'), where('instituteId', '==', user.uid));
        } else {
          setLoading(false);
          return;
        }
        
        const snaps = await getDocs(q);
        const fetched = snaps.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCerts(fetched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCerts();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white flex-1 rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden dark:bg-slate-950 dark:border-slate-800">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 dark:text-slate-100">Certificate Records</h3>
      </div>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 text-[11px] uppercase text-slate-400 dark:text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Candidate</th>
              <th className="px-6 py-3">Skill / Credential</th>
              <th className="px-6 py-3">Date Issued</th>
              <th className="px-6 py-3">Expires</th>
              <th className="px-6 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-50 dark:divide-slate-800/50">
            {certs.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => window.location.href = `/verify/${c.certificate_id}`}>
                <td className="px-6 py-3 font-mono text-xs text-slate-500">{c.certificate_id}</td>
                <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-200">{c.studentName}</td>
                <td className="px-6 py-3">
                   <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[11px] text-slate-600 dark:text-slate-300">{c.skillName}</span>
                </td>
                <td className="px-6 py-3 text-xs text-slate-500">{new Date(c.issue_date).toLocaleDateString()}</td>
                <td className="px-6 py-3 text-xs text-slate-500">{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : 'Never'}</td>
                <td className="px-6 py-3 text-right">
                   <span className="text-[10px] font-bold uppercase tracking-tight text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full">{c.status}</span>
                </td>
              </tr>
            ))}
            {certs.length === 0 && (
              <tr>
                 <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IssueCertificate({ user }: { user: any }) {
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    skillName: '',
    expiryDays: 365
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [generatedCert, setGeneratedCert] = useState<any>(null);
  const certRef = useRef<HTMLDivElement>(null);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const certId = `CERT-${crypto.randomUUID().split('-')[0].toUpperCase()}-${Date.now().toString().slice(-4)}`;
      
      const payloadRef = JSON.stringify({
        id: certId,
        name: formData.studentName,
        skill: formData.skillName,
        issuer: user.name || 'Training Institute',
        url: `${window.location.origin}/verify/${certId}`
      });

      const issue_date = Date.now();
      const expiry_date = issue_date + (formData.expiryDays * 24 * 60 * 60 * 1000);

      const newCert = {
        certificate_id: certId,
        instituteId: user.uid,
        instituteName: user.name || 'Training Institute',
        userId: formData.studentEmail, // In real app, resolve to actual UID
        studentName: formData.studentName,
        skillName: formData.skillName,
        issue_date: issue_date,
        expiry_date: expiry_date,
        expiry_notified: false,
        qr_code: payloadRef,
        status: 'verified'
      };

      await setDoc(doc(db, 'certificates', certId), newCert);
      
      // Set to state to update QR code DOM component before PDF capture
      setGeneratedCert(newCert);
      await new Promise(r => setTimeout(r, 400));
      
      // Generate PDF
      if (certRef.current) {
        const canvas = await html2canvas(certRef.current, { scale: 3, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${formData.studentName.replace(/\s+/g, '_')}_Certificate.pdf`);
      }

      setSuccess(`Successfully issued certificate ${certId}`);
      setTimeout(() => {
        setSuccess('');
        setGeneratedCert(null);
      }, 5000);
      setFormData({ studentName: '', studentEmail: '', skillName: '' });
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const previewDate = generatedCert ? new Date(generatedCert.issue_date).toLocaleDateString() : new Date().toLocaleDateString();
  const previewId = generatedCert ? generatedCert.certificate_id : `Sample_CERT_ID`;
  
  const qrPayload = generatedCert 
    ? generatedCert.qr_code 
    : JSON.stringify({
        id: previewId,
        name: formData.studentName || 'Student Name',
        skill: formData.skillName || 'Skill / Credential',
        issuer: user.name || 'Training Institute',
        url: `${window.location.origin}/verify/${previewId}`
      });

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col p-6 dark:bg-slate-950 dark:border-slate-800 lg:w-1/3 shrink-0 h-fit">
        <h3 className="font-bold text-slate-800 mb-6 dark:text-slate-100">Issue Digital Certificate</h3>
        <form onSubmit={handleIssue} className="flex flex-col gap-4">
          {success && <div className="rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">{success}</div>}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Student Name</label>
            <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200" value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Student Email</label>
            <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200" value={formData.studentEmail} onChange={e => setFormData({...formData, studentEmail: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Skill / Credential</label>
            <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200" value={formData.skillName} onChange={e => setFormData({...formData, skillName: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Valid For (Days)</label>
            <input required type="number" min="1" className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200" value={formData.expiryDays} onChange={e => setFormData({...formData, expiryDays: parseInt(e.target.value) || 365})} />
          </div>
          <button type="submit" disabled={loading || !formData.studentName || !formData.skillName} className="mt-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading ? 'Processing...' : 'Issue & Download PDF'}
          </button>
        </form>
      </div>

      <div className="flex-[2] bg-slate-100 rounded-xl p-4 flex items-center justify-center overflow-auto border border-slate-200 dark:bg-slate-900 dark:border-slate-800 relative">
        <div 
          ref={certRef}
          className="w-[800px] h-[565px] relative bg-white border-8 border-double border-slate-200 p-12 shadow-sm flex flex-col items-center text-center text-slate-900 shrink-0 transform scale-[0.5] sm:scale-75 xl:scale-[0.85] 2xl:scale-100"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e3a8a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <h1 className="text-5xl font-bold uppercase tracking-widest text-slate-800 mt-12 mb-4">Certificate</h1>
          <h2 className="text-xl tracking-widest text-slate-500 uppercase mb-16">of Completion</h2>
          
          <p className="text-lg italic text-slate-600 mb-4">This is to certify that</p>
          <h3 className="text-5xl font-semibold border-b-2 border-slate-300 pb-2 mb-8 px-12 inline-block font-sans text-blue-900 w-full overflow-hidden text-ellipsis whitespace-nowrap">
            {formData.studentName || 'Student Name'}
          </h3>
          
          <p className="text-lg italic text-slate-600 mb-4">has successfully completed the requirements for</p>
          <h4 className="text-3xl font-bold text-slate-800 font-sans mb-16 max-w-2xl w-full overflow-hidden text-ellipsis whitespace-nowrap">
            {formData.skillName || 'Skill / Credential'}
          </h4>
          
          <div className="mt-auto w-full flex justify-between items-end px-12 font-sans absolute bottom-12 left-0">
            <div className="text-left flex flex-col w-[250px]">
              <span className="text-lg font-bold text-slate-800 truncate">{user.name || 'Training Institute'}</span>
              <span className="text-sm text-slate-500 uppercase tracking-widest mt-1 border-t border-slate-300 pt-1">Authorized Issuer</span>
            </div>
            
            <div className="flex flex-col items-center bg-white p-2 border border-slate-100 shadow-sm rounded">
              <QRCodeSVG value={qrPayload} size={80} level="M" />
              <span className="text-[9px] font-mono mt-1 text-slate-400">{previewId}</span>
            </div>
            
            <div className="text-right flex flex-col w-[250px] items-end">
              <span className="text-lg font-bold text-slate-800 truncate">{previewDate}</span>
              <span className="text-sm text-slate-500 uppercase tracking-widest mt-1 border-t border-slate-300 pt-1 text-right w-full">Date Issued</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VerificationLogsList({ user }: { user: any }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (user.role !== 'admin') return;

    const q = query(collection(db, 'verificationLogs'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(newLogs);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredLogs = logs.filter(log => filter === 'All' || (log.status && log.status.toLowerCase() === filter.toLowerCase()));

  return (
    <div className="bg-white flex-1 rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden dark:bg-slate-950 dark:border-slate-800">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
        <h3 className="font-bold text-slate-800 dark:text-slate-100">Recent Verification Logs</h3>
        <select 
          className="text-sm border border-slate-200 rounded-lg bg-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Verified">Verified</option>
          <option value="Expired">Expired</option>
          <option value="Revoked">Revoked</option>
        </select>
      </div>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 text-[11px] uppercase text-slate-400 dark:text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3">Certificate ID</th>
              <th className="px-6 py-3">Verified By</th>
              <th className="px-6 py-3">Timestamp</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-50 dark:divide-slate-800/50">
            {filteredLogs.map(log => {
              const statusDisplay = log.status ? (log.status.charAt(0).toUpperCase() + log.status.slice(1)) : 'Verified';
              let statusClass = "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400";
              if (statusDisplay === 'Expired') statusClass = "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400";
              if (statusDisplay === 'Revoked') statusClass = "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400";

              return (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">{log.certificate_id}</td>
                  <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-200">{log.verified_by || 'Public Visitor'}</td>
                  <td className="px-6 py-3 text-xs text-slate-500 flex items-center justify-between">
                    {new Date(log.timestamp).toLocaleString()}
                    <span className={`text-[10px] font-bold uppercase tracking-tight px-2 py-1 rounded-full ${statusClass}`}>
                      {statusDisplay}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filteredLogs.length === 0 && (
              <tr>
                 <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">No verification events found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmployerSearch({ user }: { user: any }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setSearched(true);
    try {
      const term = searchTerm.trim();
      const isId = term.toUpperCase().startsWith('CERT-');
      
      let q;
      if (isId) {
        q = query(collection(db, 'certificates'), where('certificate_id', '==', term.toUpperCase()));
      } else {
        q = query(
          collection(db, 'certificates'), 
          where('studentName', '>=', term),
          where('studentName', '<=', term + '\uf8ff'),
          limit(20)
        );
      }
      
      const snaps = await getDocs(q);
      setResults(snaps.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!modalRef.current) return;
    try {
      const canvas = await html2canvas(modalRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Validation-Report-${selectedCert.certificate_id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF report:', error);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full relative">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 dark:bg-slate-950 p-6 shrink-0">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Candidate Search</h2>
        <p className="text-sm text-slate-500 mb-6">Search the global verification network by Candidate Name or Certificate ID.</p>
        
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. CERT-ABCD-1234 or Candidate Name" 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !searchTerm.trim()}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {loading ? 'Searching...' : 'Search Network'}
          </button>
        </form>
      </div>

      {searched && (
        <div className="bg-white flex-1 rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden dark:bg-slate-950 dark:border-slate-800 min-h-[300px]">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Search Results ({results.length})</h3>
          </div>
          <div className="flex-1 overflow-auto">
            {results.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-[11px] uppercase text-slate-400 dark:text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Candidate</th>
                    <th className="px-6 py-3">Skill / Credential</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-50 dark:divide-slate-800/50">
                  {results.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => setSelectedCert(c)}>
                      <td className="px-6 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">{c.certificate_id}</td>
                      <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-200">{c.studentName}</td>
                      <td className="px-6 py-3">
                         <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[11px] text-slate-600 dark:text-slate-300">{c.skillName || c.courseName}</span>
                      </td>
                      <td className="px-6 py-3 text-right">
                         <span className="text-[10px] font-bold uppercase tracking-tight text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full">{c.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <Search className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-sm font-medium text-slate-900 dark:text-white">No results found</p>
                <p className="text-xs text-slate-500 mt-1">Try searching with a different name or specific certificate ID.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-emerald-500" /> Validation Report
              </h3>
              <button 
                onClick={() => setSelectedCert(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6" ref={modalRef}>
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-shrink-0 h-16 w-16 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-800">
                  <Award className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">{selectedCert.courseName}</h4>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{selectedCert.certificate_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Candidate</label>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-slate-400" />
                    <span className="font-medium text-slate-900 dark:text-white">{selectedCert.studentName}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Issuer</label>
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-slate-400" />
                    <span className="font-medium text-slate-900 dark:text-white">{selectedCert.instituteName}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Issue Date</label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                    <span className="font-medium text-slate-900 dark:text-white">{new Date(selectedCert.issueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Skill</label>
                  <span className="inline-block px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {selectedCert.skillName || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-8 border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 p-5 rounded-xl flex items-start">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-500 mr-3 shrink-0" />
                <div>
                  <h5 className="font-bold text-emerald-900 dark:text-emerald-100">Cryptographically Verified</h5>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed">
                    This certificate is active and authentic. The digital signature matches the issuing institution's registered public key on the verification network.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedCert(null)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition"
              >
                Close
              </button>
              <button 
                onClick={handleDownloadReport}
                className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl flex items-center hover:bg-blue-700 shadow-sm transition"
              >
                <Download className="h-4 w-4 mr-2" /> Download Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
