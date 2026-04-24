import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function SuperAdminAuth() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(formData.email, formData.password);
      navigate("/dashboard/admin");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full text-center">
        <div className="mb-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-[#F43F5E]/20 rounded-3xl flex items-center justify-center mb-6">
            <ShieldAlert className="w-10 h-10 text-[#F43F5E]" />
          </div>
          <h1 className="text-4xl font-black mb-4">Super Admin Access</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Platform Control Center Restricted Entry</p>
        </div>

        <div className="bg-[#1F1F3A] rounded-[2rem] p-8 border border-white/10 shadow-2xl text-left">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="email"
                  placeholder="Super Admin Email"
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:border-[#F43F5E] outline-none transition-colors"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-12 focus:border-[#F43F5E] outline-none transition-colors"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-[#F43F5E] text-sm font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full py-4 bg-[#F43F5E] hover:bg-[#E11D48] rounded-xl font-bold text-lg shadow-lg shadow-[#F43F5E]/20 flex items-center justify-center gap-2 group transition-all"
            >
              Verify Authority
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="text-center mt-8 text-white/20 text-xs font-bold uppercase tracking-[0.2em]">
            This access is monitored and strictly prohibited for unauthorized personnel.
          </p>
        </div>
      </div>
    </div>
  );
}
