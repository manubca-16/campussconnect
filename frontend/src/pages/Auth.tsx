import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, School, Mail, Lock, Phone, MapPin, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"student" | "college_admin">("student");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    collegeName: "",
    location: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        const loggedUser = await login(formData.email, formData.password);
        if (loggedUser?.role === "super_admin") navigate("/dashboard/admin");
        else if (loggedUser?.role === "college_admin") navigate("/dashboard/college");
        else navigate("/dashboard/student");
      } else {
        await register({ ...formData, role });
        setIsLogin(true);
        alert("Registration successful! Please login.");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-4">
            {isLogin ? "Welcome Back" : "Join the Connect"}
          </h1>
          <p className="text-white/60">
            {isLogin ? "Login to access your dashboard" : "Create an account to get started"}
          </p>
        </div>

        <div className="bg-[#1F1F3A] rounded-[2rem] p-8 border border-white/10 shadow-2xl">
          {/* Toggle Login/Register */}
          <div className="flex bg-black/20 p-1 rounded-xl mb-8">
            <button
              onClick={() => { setIsLogin(true); setShowPassword(false); }}
              className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${isLogin ? "bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] text-white shadow-lg" : "text-white/50"}`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setShowPassword(false); }}
              className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${!isLogin ? "bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] text-white shadow-lg" : "text-white/50"}`}
            >
              Register
            </button>
          </div>

          {!isLogin && (
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setRole("student")}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${role === "student" ? "bg-[#7C3AED]/10 border-[#7C3AED] text-[#7C3AED]" : "bg-white/5 border-white/10 text-white/50"}`}
              >
                <User className="w-6 h-6" />
                <span className="text-xs font-bold uppercase">Student</span>
              </button>
              <button
                onClick={() => setRole("college_admin")}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${role === "college_admin" ? "bg-[#F43F5E]/10 border-[#F43F5E] text-[#F43F5E]" : "bg-white/5 border-white/10 text-white/50"}`}
              >
                <School className="w-6 h-6" />
                <span className="text-xs font-bold uppercase">College</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:border-[#7C3AED] outline-none transition-colors"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  {role === "college_admin" && (
                    <>
                      <div className="relative">
                        <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                        <input
                          type="text"
                          placeholder="College Name"
                          required
                          className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:border-[#F43F5E] outline-none transition-colors"
                          value={formData.collegeName}
                          onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                        />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                        <input
                          type="text"
                          placeholder="Location"
                          required
                          className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:border-[#F43F5E] outline-none transition-colors"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:border-[#7C3AED] outline-none transition-colors"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="email"
                placeholder="Email Address"
                required
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:border-[#7C3AED] outline-none transition-colors"
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
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 focus:border-[#7C3AED] outline-none transition-colors"
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

            {error && <p className="text-[#F43F5E] text-sm font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] rounded-xl font-bold text-lg shadow-lg shadow-[#7C3AED]/20 flex items-center justify-center gap-2 group"
            >
              {isLogin ? "Login" : "Create Account"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="text-center mt-8 text-white/40 text-sm">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
