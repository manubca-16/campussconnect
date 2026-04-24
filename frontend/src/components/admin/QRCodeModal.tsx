import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, RefreshCw, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '../../utils/api';

interface QRCodeModalProps {
  eventId: string;
  eventName: string;
  onClose: () => void;
}

export default function QRCodeModal({ eventId, eventName, onClose }: QRCodeModalProps) {
  const [token, setToken] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchToken = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/attendance/qr/${eventId}`);
      if (!res.ok) throw new Error('Failed to fetch QR token');
      const data = await res.json();
      setToken(data.token);
      setTimeLeft(data.expiresIn || 45);
      setError('');
    } catch (err: any) {
      console.error(err);
      setError('Could not load QR code');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToken();
  }, [eventId]);

  useEffect(() => {
    if (timeLeft <= 0) {
      fetchToken();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleDownloadExcel = async () => {
    try {
      const res = await apiFetch(`/api/attendance/export/${eventId}`);
      if (!res.ok) throw new Error('Failed to download excel');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${eventId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download attendance data');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#1F1F3A] w-full max-w-md rounded-[3rem] p-8 md:p-10 border border-white/10 relative z-10 shadow-[0_0_100px_rgba(124,58,237,0.15)] flex flex-col items-center text-center"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-black mb-2 line-clamp-1 w-[90%]">{eventName}</h2>
        <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-8">Scan to Mark Attendance</p>

        <div className="bg-white p-4 rounded-3xl mb-6 relative">
          {loading && !token && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-3xl">
              <RefreshCw className="w-8 h-8 text-[#7C3AED] animate-spin" />
            </div>
          )}
          {error ? (
            <div className="w-64 h-64 flex items-center justify-center text-red-500 font-bold">{error}</div>
          ) : token ? (
            <QRCodeSVG value={token} size={256} className={loading ? 'opacity-50' : 'opacity-100'} />
          ) : (
            <div className="w-64 h-64 bg-gray-200 animate-pulse rounded-2xl" />
          )}
        </div>

        <div className="flex items-center gap-2 text-white/60 font-bold mb-8">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refreshes in <span className="text-[#00FFF5]">{timeLeft}s</span>
        </div>

        <button
          onClick={handleDownloadExcel}
          className="w-full py-4 bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] text-white rounded-2xl font-black shadow-lg shadow-[#7C3AED]/30 hover:shadow-[#F43F5E]/30 active:scale-95 transition-all outline-none flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" /> Download Attendance (.xlsx)
        </button>
      </motion.div>
    </div>
  );
}
