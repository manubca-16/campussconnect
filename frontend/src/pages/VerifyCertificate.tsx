import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { apiFetch } from "../utils/api";

export default function VerifyCertificate() {
  const { certificateId } = useParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

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
        const res = await apiFetch(`/api/certificates/verify/${certificateId}`);
        const data = await readJson(res);
        if (!res.ok) throw new Error(data?.message || "Certificate not found");
        if (mounted) setResult(data);
      } catch (err: any) {
        if (mounted) setResult({ valid: false, message: err?.message || "Certificate not found or invalid" });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (certificateId) run();
    return () => {
      mounted = false;
    };
  }, [certificateId]);

  const valid = Boolean(result?.valid);
  const cert = result?.certificate;

  return (
    <div className="min-h-screen bg-[#0A0A15] pt-24 px-6 flex items-start justify-center">
      <div className="w-full max-w-2xl">
        {loading ? (
          <div className="bg-[#1F1F3A] rounded-2xl border border-white/10 p-8 flex items-center justify-center gap-3 text-white/60 font-black">
            <Loader2 className="w-5 h-5 animate-spin" /> Verifying…
          </div>
        ) : (
          <div
            className={`rounded-2xl border p-8 ${
              valid
                ? "bg-green-500/10 border-green-400/20"
                : "bg-red-500/10 border-red-400/20"
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              {valid ? (
                <CheckCircle2 className="w-7 h-7 text-green-300" />
              ) : (
                <XCircle className="w-7 h-7 text-red-300" />
              )}
              <div>
                <h1 className="text-2xl font-black">
                  {valid ? "Certificate Verified" : "Certificate Not Found or Invalid"}
                </h1>
                <p className="text-white/50 text-sm mt-1">
                  {valid
                    ? "This certificate exists in CampusConnect records."
                    : (result?.message || "The certificate ID could not be verified.")}
                </p>
              </div>
            </div>

            {valid && (
              <div className="bg-black/20 border border-white/10 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em]">Student</p>
                  <p className="font-black">{cert?.studentName}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em]">Event</p>
                  <p className="font-black">{cert?.eventName}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em]">Event Date</p>
                  <p className="font-black">
                    {cert?.eventDate ? new Date(cert.eventDate).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em]">Issued</p>
                  <p className="font-black">
                    {cert?.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em]">Certificate ID</p>
                  <p className="font-mono text-white/80 text-sm">{cert?.certificateId}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
