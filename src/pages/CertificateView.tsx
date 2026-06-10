import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, setDoc, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Download, Share2, CornerUpLeft, Search } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function CertificateView() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchCert() {
      if (!certificateId) return;
      
      let cleanId = decodeURIComponent(certificateId).trim();
      
      // Detect if the user pasted the raw QR code JSON instead of just the URL or ID
      if (cleanId.startsWith('{')) {
        try {
          const payload = JSON.parse(cleanId);
          if (payload.id) {
            cleanId = payload.id;
          }
        } catch (e) {
          // ignore parsing error
        }
      }
      
      cleanId = cleanId.toUpperCase();

      // Ensure it has CERT- prefix if they only provided the numbers/letters
      if (!cleanId.startsWith('CERT-') && cleanId.length > 5) {
         // Some users might just type ABCD-1234
         cleanId = `CERT-${cleanId}`;
      }

      try {
        const q = query(collection(db, 'certificates'), where('certificate_id', '==', cleanId));
        const snapshot = await getDocs(q);
        
        let data = null;
        if (!snapshot.empty) {
          data = snapshot.docs[0].data();
        } else {
          // Fallback: try by document ID directly for backward compatibility
          const docRef = doc(db, 'certificates', cleanId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
             data = docSnap.data();
          }
        }
        
        if (data) {
          // Log verification
          let currentStatus = data.status || 'verified';
          if (data.expiry_date && Date.now() > data.expiry_date) {
            currentStatus = 'expired';
          }
          try {
            await addDoc(collection(db, 'verificationLogs'), {
              certificate_id: data.certificate_id,
              timestamp: Date.now(),
              verified_by: 'public_visitor',
              status: currentStatus.toLowerCase()
            });
          } catch(e) {
            console.error("Failed to log verification", e);
          }
          setCert(data);
        } else {
          setError('Certificate Not Found');
        }
      } catch (err: any) {
        console.error("Verification error:", err);
        setError('Certificate Not Found');
      } finally {
        setLoading(false);
      }
    }
    fetchCert();
  }, [certificateId]);

  const downloadPDF = async () => {
    if (!certRef.current) return;
    try {
      const canvas = await html2canvas(certRef.current, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${cert?.studentName || 'certificate'}.pdf`);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center max-w-sm text-center">
          <Search className="h-16 w-16 text-slate-400 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">No Record Found</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">We could not find a matching certificate in the global registry verifying this ID. Please check the ID and try again.</p>
          <Link to="/verify" className="mt-8 flex items-center text-blue-600 hover:underline">
            <CornerUpLeft className="mr-2 h-4 w-4" /> Go back to Search
          </Link>
        </motion.div>
      </div>
    );
  }

  const isVerified = cert.status === 'verified';
  const isExpired = cert.status === 'expired' || (cert.expiry_date && cert.expiry_date < Date.now());
  const isRevoked = cert.status === 'revoked';

  return (
    <div className="flex flex-col items-center p-4 sm:p-8 w-full max-w-6xl mx-auto">
      <div className="w-full flex items-center justify-between mb-8">
        <Link to="/verify" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">
           <CornerUpLeft className="mr-2 h-4 w-4" /> Back to Search
        </Link>
        <div className="flex items-center gap-3">
           <button onClick={downloadPDF} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800">
             <Download className="h-4 w-4" /> PDF
           </button>
           <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
             <Share2 className="h-4 w-4" /> Share
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        {/* Verification Status Card */}
        <div className="lg:col-span-1 border border-slate-200 bg-white rounded-2xl p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">Status Record</h3>
          
          <div className="flex items-center gap-4 mb-8">
            {isRevoked ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100"><XCircle className="h-6 w-6 text-red-600" /></div>
            ) : isExpired ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100"><AlertTriangle className="h-6 w-6 text-yellow-600" /></div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100"><CheckCircle className="h-6 w-6 text-green-600" /></div>
            )}
            <div>
               <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                 {isRevoked ? 'Revoked' : isExpired ? 'Expired' : 'Verified Authentic'}
               </h4>
               <p className="text-xs text-slate-500">Last checked just now</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Certificate ID</span>
              <span className="font-mono font-medium text-slate-900 dark:text-white">{cert.certificate_id}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Issued On</span>
              <span className="font-medium text-slate-900 dark:text-white">{new Date(cert.issue_date).toLocaleDateString()}</span>
            </div>
            {cert.expiry_date && (
               <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Expires On</span>
                <span className="font-medium text-slate-900 dark:text-white">{new Date(cert.expiry_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Certificate Rendering */}
        <div className="lg:col-span-2 overflow-x-auto pb-4">
          <div 
            ref={certRef}
            className="min-w-[800px] w-full aspect-[1.414/1] relative bg-white border-8 border-double border-slate-200 p-12 shadow-2xl flex flex-col items-center text-center text-slate-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e3a8a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <h1 className="text-5xl font-bold uppercase tracking-widest text-slate-800 mt-12 mb-4">Certificate</h1>
            <h2 className="text-xl tracking-widest text-slate-500 uppercase mb-16">of Completion</h2>
            
            <p className="text-lg italic text-slate-600 mb-4">This is to certify that</p>
            <h3 className="text-5xl font-semibold border-b-2 border-slate-300 pb-2 mb-8 px-12 inline-block font-sans text-blue-900">
              {cert.studentName}
            </h3>
            
            <p className="text-lg italic text-slate-600 mb-4">has successfully completed the requirements for</p>
            <h4 className="text-3xl font-bold text-slate-800 font-sans mb-16 max-w-2xl">
              {cert.skillName}
            </h4>
            
            <div className="mt-auto w-full flex justify-between items-end px-12 font-sans">
              <div className="text-left flex flex-col">
                <span className="text-lg font-bold text-slate-800">{cert.instituteName}</span>
                <span className="text-sm text-slate-500 uppercase tracking-widest mt-1 border-t border-slate-300 pt-1 w-48">Authorized Issuer</span>
              </div>
              
              <div className="flex flex-col items-center bg-white p-2 border border-slate-100 shadow-sm rounded">
                <QRCodeSVG value={window.location.href} size={100} />
                <span className="text-[10px] font-mono mt-1 text-slate-400">{cert.certificate_id}</span>
              </div>
              
              <div className="text-right flex flex-col">
                <span className="text-lg font-bold text-slate-800">{new Date(cert.issue_date).toLocaleDateString()}</span>
                <span className="text-sm text-slate-500 uppercase tracking-widest mt-1 border-t border-slate-300 pt-1 w-48 text-right">Date Issued</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
