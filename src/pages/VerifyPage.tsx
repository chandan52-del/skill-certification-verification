import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VerifyPage() {
  const [certId, setCertId] = useState('');
  const navigate = useNavigate();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (certId.trim()) {
      navigate(`/verify/${encodeURIComponent(certId.trim())}`);
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Verify Certificate</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Enter the unique certificate ID to verify its authenticity instantly.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="certId" className="sr-only">Certificate ID</label>
            <input
              type="text"
              id="certId"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="e.g. CERT-123456789"
              className="w-full rounded-xl border-slate-300 px-4 py-4 text-base shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              required
            />
          </div>
          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95"
          >
            Verify Now
          </button>
        </form>

        <div className="mt-8 flex items-start gap-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
           <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
           <p className="text-xs text-slate-500 dark:text-slate-400">
             Our verification process checks cryptographic signatures against our secure database to ensure the credential has not been tampered with or revoked.
           </p>
        </div>
      </motion.div>
    </div>
  );
}
