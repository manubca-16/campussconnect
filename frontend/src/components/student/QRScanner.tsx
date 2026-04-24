import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '../../utils/api';

interface QRScannerProps {
  onClose: () => void;
}

export default function QRScanner({ onClose }: QRScannerProps) {
  const [status, setStatus] = useState<'scanning' | 'success' | 'already_marked' | 'expired' | 'error'>('scanning');
  const [message, setMessage] = useState<string>('');
  const scannerId = "reader";

  useEffect(() => {
    let html5QrcodeScanner: Html5QrcodeScanner | null = null;
    if (status === 'scanning') {
      html5QrcodeScanner = new Html5QrcodeScanner(
        scannerId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      html5QrcodeScanner.render(
        async (decodedText) => {
          html5QrcodeScanner?.clear();
          handleScan(decodedText);
        },
        (err) => {
          // Ignore general scan errors
        }
      );
    }

    return () => {
      html5QrcodeScanner?.clear().catch(console.error);
    };
  }, [status]);

  const handleScan = async (token: string) => {
    try {
      const res = await apiFetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await res.json();
      if (res.status === 201) {
        setStatus('success');
        setMessage('Attendance marked successfully!');
      } else if (res.status === 409) {
        setStatus('already_marked');
        setMessage('You have already marked attendance for this event.');
      } else if (res.status === 400 && data.message === 'QR code expired') {
        setStatus('expired');
        setMessage('QR code has expired. Please ask your admin to refresh.');
      } else {
        setStatus('error');
        setMessage(data.message || 'Invalid QR code.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  const retry = () => {
    setStatus('scanning');
    setMessage('');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#1F1F3A] w-full max-w-md rounded-[3rem] p-8 md:p-10 border border-white/10 relative z-10 shadow-[0_0_100px_rgba(0,255,245,0.15)] flex flex-col items-center text-center"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-black mb-8">Scan QR Code</h2>

        {status === 'scanning' && (
          <div className="w-full bg-black/30 rounded-3xl overflow-hidden border border-white/10 mb-6 relative">
            <div id={scannerId} className="w-full"></div>
            <style>
              {`
                #reader__scan_region { background: black !important; }
                #reader__dashboard_section_csr span { color: white !important; font-family: inherit !important; font-weight: bold; }
                #reader__dashboard_section_swaplink { color: #00FFF5 !important; text-decoration: none !important; font-weight: bold; font-family: inherit !important; }
                #reader button { background: rgba(124,58,237,0.2) !important; color: #7C3AED !important; border: 1px solid rgba(124,58,237,0.5) !important; border-radius: 12px !important; padding: 8px 16px !important; font-weight: bold !important; font-family: inherit !important; transition: all 0.2s !important; margin: 10px 0 !important; cursor: pointer; }
                #reader button:hover { background: rgba(124,58,237,0.4) !important; }
              `}
            </style>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center py-8">
            <CheckCircle2 className="w-20 h-20 text-green-400 mb-6" />
            <p className="text-lg font-bold text-green-400">{message}</p>
          </div>
        )}

        {status === 'already_marked' && (
          <div className="flex flex-col items-center py-8">
            <AlertCircle className="w-20 h-20 text-[#00FFF5] mb-6" />
            <p className="text-lg font-bold text-[#00FFF5]">{message}</p>
          </div>
        )}

        {(status === 'expired' || status === 'error') && (
          <div className="flex flex-col items-center py-8">
            <AlertTriangle className="w-20 h-20 text-red-500 mb-6" />
            <p className="text-lg font-bold text-red-500 mb-8">{message}</p>
            <button
              onClick={retry}
              className="px-8 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-4 mt-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black transition-all border border-white/10 active:scale-95"
        >
          {status === 'scanning' ? 'Stop Scanning' : 'Close'}
        </button>
      </motion.div>
    </div>
  );
}
