import React, { useMemo, useState } from "react";
import { CheckCircle2, FileUp, Loader2, Sparkles } from "lucide-react";
import { apiFetch } from "../../utils/api";

type Props = {
  event: any;
  onStatusChange: () => void;
};

export default function CertificateControls({ event, onStatusChange }: Props) {
  const status = event?.status || "upcoming";
  const certificatesGenerated = Boolean(event?.certificatesGenerated);

  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const canMarkCompleted = status !== "completed";
  const canUploadTemplate = status === "completed";
  const canGenerate = status === "completed" && !certificatesGenerated;

  const selectedFileName = useMemo(() => templateFile?.name || "", [templateFile]);

  const showToast = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3500);
  };

  const readJson = async (res: Response) => {
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error(
        `API returned non-JSON (status ${res.status}). Is the backend running? (${text.slice(0, 80)}…)`
      );
    }
    return res.json();
  };

  const markCompleted = async () => {
    const ok = window.confirm(
      "Are you sure you want to mark this event as completed? This cannot be undone."
    );
    if (!ok) return;

    setLoading(true);
    try {
      const res = await apiFetch(`/api/certificates/event/${event._id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data?.message || "Failed to mark event completed");
      showToast(data?.message || "Event marked as completed");
      onStatusChange();
    } catch (err: any) {
      showToast(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const uploadTemplate = async () => {
    if (!templateFile) return null;
    const form = new FormData();
    form.append("template", templateFile);

    const res = await apiFetch("/api/certificates/upload-template", {
      method: "POST",
      body: form,
    });
    const data = await readJson(res);
    if (!res.ok) throw new Error(data?.message || "Template upload failed");
    return data?.templatePath as string;
  };

  const generate = async () => {
    setLoading(true);
    try {
      const templatePath = await uploadTemplate();
      const res = await apiFetch(`/api/certificates/generate/${event._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templatePath ? { templatePath } : {}),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data?.message || "Certificate generation failed");
      showToast(`Certificates generated for ${data?.total ?? 0} students`);
      setTemplateFile(null);
      onStatusChange();
    } catch (err: any) {
      showToast(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
      {message && (
        <div className="text-xs font-bold text-white/80 bg-black/20 border border-white/10 rounded-xl px-3 py-2">
          {message}
        </div>
      )}

      {canMarkCompleted && (
        <button
          disabled={loading}
          onClick={markCompleted}
          className="w-full px-4 py-2.5 rounded-xl font-black text-sm bg-gradient-to-r from-[#00FFF5] to-[#7C3AED] text-black hover:opacity-95 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Mark as Completed
        </button>
      )}

      {canUploadTemplate && (
        <div className="space-y-2">
          <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest">
            Upload Custom Certificate Template (optional)
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer px-4 py-2.5 rounded-xl border border-white/10 bg-black/20 hover:bg-black/30 transition-all flex items-center gap-2">
              <FileUp className="w-4 h-4 text-white/50" />
              <span className="text-xs font-bold text-white/70 truncate">
                {selectedFileName || "Choose .png / .jpg"}
              </span>
              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
              />
            </label>
            {templateFile && (
              <button
                type="button"
                disabled={loading}
                onClick={() => setTemplateFile(null)}
                className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-xs font-black disabled:opacity-60"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {canGenerate && (
        <button
          disabled={loading}
          onClick={generate}
          className="w-full px-4 py-2.5 rounded-xl font-black text-sm bg-gradient-to-r from-[#F43F5E] to-[#FB7185] text-white hover:opacity-95 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Generating…" : "Generate Certificates"}
        </button>
      )}

      {certificatesGenerated && (
        <div className="w-full px-4 py-2.5 rounded-xl border border-green-400/20 bg-green-400/10 text-green-300 text-xs font-black flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Certificates Already Generated
        </div>
      )}
    </div>
  );
}
