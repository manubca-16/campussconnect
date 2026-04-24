import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Award, Calendar, Ticket, History, Settings, ExternalLink, X, Save, Bell, LogOut, Star, Search, Scan } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import QRScanner from "../components/student/QRScanner";
import { apiFetch } from "../utils/api";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (user?.id) {
      apiFetch(`/api/registrations?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setRegistrations(Array.isArray(data) ? data : []));
    }
    apiFetch("/api/events")
      .then(res => res.json())
      .then(data => setAllEvents(Array.isArray(data) ? data : []));
  }, [user]);

  const registerForEvent = async (event: any) => {
    const already = registrations.find(r => r.eventId === event._id);
    if (already) { setToast("Already registered!"); setTimeout(() => setToast(""), 3000); return; }
    const res = await apiFetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.id,
        eventId: event._id,
        eventName: event.name || event.title,
        userName: user?.name,
        college: event.college,
        price: event.price || 0,
      })
    });
    if (res.ok) {
      const reg = await res.json();
      setRegistrations([...registrations, reg]);
      setToast("Successfully registered! ✅"); setTimeout(() => setToast(""), 3000);
    }
  };

  const handleLogout = () => { logout(); navigate("/auth"); };

  const filteredEvents = allEvents.filter(e =>
    (e.name || e.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: "dashboard", label: "My Dashboard", icon: <Ticket className="w-4 h-4" /> },
    { id: "browse", label: "Browse Events", icon: <Calendar className="w-4 h-4" /> },
    { id: "registrations", label: "My Registrations", icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A15] flex">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-[100] bg-[#1F1F3A] border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold shadow-2xl"
          >{toast}</motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="w-64 bg-[#0F0F1A] border-r border-white/5 flex flex-col fixed h-full pt-20">
        <div className="px-6 py-6 border-b border-white/5">
          <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#F43F5E] rounded-2xl flex items-center justify-center font-black text-xl mb-3">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <p className="font-black">{user?.name}</p>
          <p className="text-white/30 text-xs truncate">{user?.email}</p>
          <span className="mt-2 inline-block px-2 py-0.5 bg-[#00FFF5]/20 text-[#00FFF5] text-xs font-bold rounded-full">Student</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? "bg-[#7C3AED]/20 text-[#7C3AED]" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
          <Link
            to="/student/certificates"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            <Award className="w-4 h-4" /> My Certificates
          </Link>
          <button onClick={() => setShowEditModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all mt-2">
            <Settings className="w-4 h-4" /> Edit Profile
          </button>
        </nav>
        <div className="px-4 py-6 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8 pt-28">
        <AnimatePresence mode="wait">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 className="text-3xl font-black mb-8">Hey, {user?.name?.split(" ")[0]}! 👋</h1>
              <div className="grid grid-cols-3 gap-6 mb-10">
                {[
                  { label: "Registered Events", value: registrations.length, color: "#7C3AED", icon: <Ticket className="w-5 h-5" /> },
                  { label: "Events Available", value: allEvents.length, color: "#00FFF5", icon: <Calendar className="w-5 h-5" /> },
                  { label: "Events Completed", value: registrations.filter(r => new Date(r.eventDate) < new Date()).length, color: "#F43F5E", icon: <Star className="w-5 h-5" /> },
                ].map((s, i) => (
                  <div key={i} className="bg-[#1F1F3A] rounded-2xl p-6 border border-white/10">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
                    <p className="text-2xl font-black">{s.value}</p>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#1F1F3A] rounded-2xl border border-white/10 p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Bell className="w-5 h-5 text-[#7C3AED]" /> Recent Activity</h2>
                {registrations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white/20 text-sm mb-3">No registrations yet</p>
                    <button onClick={() => setActiveTab("browse")} className="text-[#7C3AED] text-sm font-bold hover:underline">Browse Events →</button>
                  </div>
                ) : registrations.slice(0, 5).map((reg, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all">
                    <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                    <div>
                      <p className="text-sm font-bold">Registered for <span className="text-[#7C3AED]">{reg.eventName}</span></p>
                      <p className="text-white/30 text-xs">{new Date(reg.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Browse Events Tab */}
          {activeTab === "browse" && (
            <motion.div key="browse" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black">Browse Events</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="text" placeholder="Search events..." className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-white/20"
                    value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEvents.map(event => {
                  const registered = registrations.find(r => r.eventId === event._id);
                  return (
                    <div key={event._id} className="bg-[#1F1F3A] rounded-2xl border border-white/10 p-6 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-[#7C3AED]/20 text-[#7C3AED] rounded-full text-xs font-bold">{event.category || "Event"}</span>
                        <span className="text-white/30 text-xs">{event.date}</span>
                      </div>
                      <h3 className="font-black text-lg">{event.name || event.title}</h3>
                      <p className="text-white/40 text-sm line-clamp-1">{event.college || "Campus Event"}</p>
                      <p className="text-white/40 text-sm line-clamp-2 flex-1">{event.description}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="font-bold text-[#00FFF5]">₹{event.price || 0}</span>
                        <button
                          onClick={() => registerForEvent(event)}
                          disabled={!!registered}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${registered ? "bg-green-500/20 text-green-400 cursor-default" : "bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] hover:opacity-90"}`}
                        >
                          {registered ? "Registered ✓" : "Register"}
                        </button>
                      </div>
                    </div>
                  );
                })}
                {filteredEvents.length === 0 && <p className="text-white/20 col-span-3 text-center py-16">No events found.</p>}
              </div>
            </motion.div>
          )}

          {/* Registrations Tab */}
          {activeTab === "registrations" && (
            <motion.div key="registrations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black">My Registrations</h1>
                <button onClick={() => setShowScanner(true)} className="px-6 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#7C3AED]/20 hover:scale-105 transition-transform">
                  <Scan className="w-5 h-5" /> Scan QR
                </button>
              </div>
              <div className="space-y-4">
                {registrations.map(reg => (
                  <div key={reg._id} className="bg-[#1F1F3A] rounded-2xl border border-white/10 p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#7C3AED]/20 rounded-xl flex items-center justify-center font-black text-[#7C3AED]">{reg.eventName?.[0]}</div>
                      <div>
                        <p className="font-bold">{reg.eventName}</p>
                        <p className="text-white/40 text-xs">{reg.college || "Campus Event"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">Confirmed</span>
                      <span className="text-white/30 text-xs">{new Date(reg.date).toLocaleDateString()}</span>
                      <Link to={`/events/${reg.eventId}`} className="p-2 text-white/30 hover:text-white transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
                {registrations.length === 0 && (
                  <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p className="text-white/20 text-sm mb-3">No registrations yet</p>
                    <button onClick={() => setActiveTab("browse")} className="text-[#7C3AED] font-bold hover:underline text-sm">Browse Events →</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1F1F3A] w-full max-w-md rounded-[2rem] p-8 border border-white/10 relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black">Edit Profile</h2>
                <button onClick={() => setShowEditModal(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); setShowEditModal(false); setToast("Profile updated!"); setTimeout(() => setToast(""), 3000); }}>
                <div>
                  <label className="block text-white/40 text-xs font-bold uppercase mb-2">Full Name</label>
                  <input type="text" required className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 focus:border-[#7C3AED] outline-none"
                    value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-white/40 text-xs font-bold uppercase mb-2">Email</label>
                  <input type="email" required className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 focus:border-[#7C3AED] outline-none"
                    value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                </div>
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] rounded-xl font-bold flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
