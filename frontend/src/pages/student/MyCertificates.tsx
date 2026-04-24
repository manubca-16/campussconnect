import React, { useEffect, useState } from "react";
import { ExternalLink, FileDown, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiFetch, apiUrl } from "../../utils/api";

export default function MyCertificates() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const readJson = async (res: Response) => {
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(
          `API returned non-JSON (status ${res.status}). Start the backend with npm run dev. (${text.slice(0, 80)}…)`
        );
      }
      return res.json();
    };
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiFetch(`/api/certificates/student/${user?.id}`);
        const data = await readJson(res);
        if (!res.ok) throw new Error(data?.message || "Failed to load certificates");
        if (mounted) setCertificates(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (mounted) setError(err?.message || "Something went wrong");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (user?.id) run();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-[#0A0A15] pt-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black">My Certificates</h1>
            <p className="text-white/40 text-sm mt-1">
              Download your participation certificates and verify them publicly.
            </p>
          </div>
          <Link
            to="/dashboard/student"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm font-black transition-all"
          >
            Back to Dashboard
          </Link>
        </div>

        {loading && (
          <div className="bg-[#1F1F3A] rounded-2xl border border-white/10 p-6 text-white/40 text-sm font-bold">
            Loading certificates…
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl p-6 text-sm font-bold">
            {error}
          </div>
        )}

        {!loading && !error && certificates.length === 0 && (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <p className="text-white/20 text-sm mb-3">No certificates yet. Attend events to earn certificates!</p>
            <Link to="/events" className="text-[#7C3AED] font-black hover:underline text-sm">
              Browse Events →
            </Link>
          </div>
        )}

        {!loading && !error && certificates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert._id || cert.certificateId}
                className="bg-[#1F1F3A] rounded-2xl border border-white/10 p-6"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                      Event
                    </p>
                    <p className="font-black text-lg">{cert.eventName}</p>
                    <p className="text-white/40 text-xs mt-1">
                      Event date:{" "}
                      {cert.eventDate ? new Date(cert.eventDate).toLocaleDateString() : "—"}
                    </p>
                    <p className="text-white/40 text-xs">
                      Issued on:{" "}
                      {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-green-500/15 text-green-300 rounded-full text-[10px] font-black flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </div>
                </div>

                <div className="text-white/40 text-xs font-bold mb-5">
                  <span className="text-white/30">Certificate ID:</span>{" "}
                  <span className="font-mono text-white/70">{cert.certificateId}</span>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={apiUrl(cert.fileUrl)}
                    download={`${cert.certificateId}.pdf`}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00FFF5] to-[#7C3AED] text-black font-black text-sm flex items-center justify-center gap-2 hover:opacity-95"
                  >
                    <FileDown className="w-4 h-4" /> Download PDF
                  </a>
                  <button
                    type="button"
                    onClick={() => window.open(`/verify/${cert.certificateId}`, "_blank")}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm font-black flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" /> Verify
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
