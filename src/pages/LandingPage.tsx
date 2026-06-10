import { motion } from 'framer-motion';
import { ShieldCheck, QrCode, CheckCircle, DatabaseZap, BrainCircuit, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="flex w-full flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden border-b border-slate-200 bg-white pt-24 pb-32 dark:border-slate-800 dark:bg-slate-950">
        <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Verify Skills with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Trust</span> and Confidence
              </h1>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-xl">
                Secure Digital Certificates, Instant Verification, and Skill-Based Hiring.
                Empower your workforce with cryptographically verifiable credentials.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/login" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3.5 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-transform hover:scale-105">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link to="/verify" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-medium text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 transition-colors hover:bg-slate-50 dark:bg-slate-900 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-800">
                  Verify Certificate
                </Link>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative lg:ml-auto"
            >
              {/* Abstract Certificate Illustration */}
              <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl bg-gradient-to-tr from-slate-100 to-white p-8 shadow-2xl ring-1 ring-slate-200 dark:from-slate-800 dark:to-slate-900 dark:ring-slate-700 overflow-hidden transform rotate-2">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <ShieldCheck className="w-48 h-48" />
                </div>
                <div className="flex justify-between items-start mb-8">
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500"></div>
                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse dark:bg-slate-700"></div>
                  </div>
                  <div className="w-16 h-16 rounded shadow-sm border border-slate-200 bg-white p-1">
                    <QrCode className="w-full h-full text-slate-800" />
                  </div>
                </div>
                <div className="space-y-4">
                   <div className="h-6 w-3/4 bg-slate-200 rounded animate-pulse dark:bg-slate-700"></div>
                   <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse dark:bg-slate-700"></div>
                   <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse dark:bg-slate-700"></div>
                </div>
                <div className="mt-12 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Verified Authentic</span>
                  </div>
                  <div className="h-2 w-16 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              
              {/* Floating badges */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Tamper-Proof</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Cryptographically secure</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full bg-slate-50 py-24 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
             <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
               Enterprise-Grade Features
             </h2>
             <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Everything you need to issue and verify credentials securely.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: "Digital Certificates", desc: "Issue unalterable digital certificates powered by secure cloud architecture." },
              { icon: QrCode, title: "QR Verification", desc: "Instantly verify authenticity by scanning the embedded secure QR code." },
              { icon: Search, title: "Employer Verification", desc: "Dedicated portal for recruiters to verify candidate credentials seamlessly." },
              { icon: CheckCircle, title: "Fraud Prevention", desc: "Advanced tampering detection ensures certificate integrity." },
              { icon: DatabaseZap, title: "Secure Cloud Storage", desc: "Highly available and redundant storage for all issued credentials." },
              { icon: BrainCircuit, title: "AI Skill Assessment", desc: "Smart categorization and assessment integrations for modern skills." },
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="w-full bg-white py-24 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
             <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
               How It Works
             </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Complete Training", desc: "Student completes a course at an authorized institute." },
              { step: 2, title: "Pass Assessment", desc: "Student passes the required evaluation criteria." },
              { step: 3, title: "Receive Digital Certificate", desc: "Institute issues a secure, cryptographic credential." },
              { step: 4, title: "Share & Verify Instantly", desc: "Employers instantly scan or click to verify authenticity." },
            ].map((s, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white shadow-lg ring-4 ring-blue-50 dark:ring-blue-900/20">
                  {s.step}
                </div>
                <h4 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{s.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.desc}</p>
                {i < 3 && <div className="hidden md:block absolute top-8 left-1/2 w-full h-[2px] bg-slate-200 dark:bg-slate-800 -z-10" style={{ transform: 'translateX(50%)' }}></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="w-full bg-blue-600 py-16 dark:bg-blue-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-x divide-white/20">
            {[
              { val: "2M+", label: "Certificates Issued" },
              { val: "500k+", label: "Active Learners" },
              { val: "10k+", label: "Verified Employers" },
              { val: "1,200", label: "Training Institutes" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-4">
                <span className="text-4xl sm:text-5xl font-extrabold text-white">{s.val}</span>
                <span className="mt-2 text-sm font-medium text-blue-100">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
