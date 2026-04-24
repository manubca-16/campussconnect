import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  School, Users, Calendar, Check, X, ShieldAlert, BarChart3,
  UserCheck, UserX, RefreshCw, LogOut, Search, Bell, TrendingUp,
  Plus, Edit3, Trash2, IndianRupee, MapPin, Clock, Mail, Trophy
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CertificateControls from "../components/admin/CertificateControls";
import { apiFetch } from "../utils/api";

type TabType = "overview" | "colleges" | "users" | "events" | "registrations";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [colleges, setColleges] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Event Modal State
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [newEvent, setNewEvent] = useState({
    name: "",
    category: "Technical",
    type: "Inter College",
    description: "",
    rules: "",
    date: "",
    time: "",
    venue: "",
    price: 0,
    maxParticipants: 100,
    contactEmail: "admin@campusconnect.com",
    prizeDetails: "",
    college: "Super Admin",
    collegeId: "super_admin"
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      apiFetch("/api/admin/colleges").then(r => r.json()),
      apiFetch("/api/admin/users").then(r => r.json()),
      apiFetch("/api/events").then(r => r.json()),
      apiFetch("/api/registrations").then(r => r.json()),
      apiFetch("/api/admin/analytics").then(r => r.json()),
    ]).then(([c, u, e, r, a]) => {
      setColleges(Array.isArray(c) ? c : []);
      setUsers(Array.isArray(u) ? u : []);
      setEvents(Array.isArray(e) ? e : []);
      setRegistrations(Array.isArray(r) ? r : []);
      setAnalytics(a || {});
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingEvent ? "PUT" : "POST";
    const url = editingEvent ? `/api/events/${editingEvent._id}` : "/api/events";
    
    const res = await apiFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    });
    
    if (res.ok) {
      fetchData();
      closeEventModal();
    }
  };

  const deleteEvent = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      const res = await apiFetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents(events.filter(e => e._id !== id));
      }
    }
  };

  const openEditModal = (event: any) => {
    setEditingEvent(event);
    setNewEvent(event);
    setShowEventModal(true);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
    setNewEvent({
      name: "",
      category: "Technical",
      type: "Inter College",
      description: "",
      rules: "",
      date: "",
      time: "",
      venue: "",
      price: 0,
      maxParticipants: 100,
      contactEmail: "admin@campusconnect.com",
      prizeDetails: "",
      college: "Super Admin",
      collegeId: "super_admin"
    });
  };

  const toggleCollege = async (id: string) => {
    const res = await apiFetch(`/api/admin/colleges/${id}/toggle`, { method: "PUT" });
    if (res.ok) {
      const data = await res.json();
      setColleges(colleges.map(c => c._id === id ? { ...c, status: data.status } : c));
    }
  };

  const approveCollege = async (id: string) => {
    const res = await apiFetch(`/api/admin/colleges/${id}/approve`, { method: "POST" });
    if (res.ok) setColleges(colleges.map(c => c._id === id ? { ...c, status: "approved" } : c));
  };

  const rejectCollege = async (id: string) => {
    if (window.confirm("Reject this college?")) {
      const res = await apiFetch(`/api/admin/colleges/${id}/reject`, { method: "POST" });
      if (res.ok) setColleges(colleges.filter(c => c._id !== id));
    }
  };

  const toggleUser = async (id: string) => {
    const res = await apiFetch(`/api/admin/users/${id}/toggle`, { method: "PUT" });
    if (res.ok) {
      const data = await res.json();
      setUsers(users.map(u => u._id === id ? { ...u, approved: data.approved } : u));
    }
  };

  const handleLogout = () => { logout(); navigate("/super-admin"); };

  const tabs = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "colleges", label: "Colleges", icon: <School className="w-4 h-4" /> },
    { id: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
    { id: "events", label: "Events", icon: <Calendar className="w-4 h-4" /> },
    { id: "registrations", label: "Registrations", icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const statCards = [
    { label: "Total Students", value: analytics.totalUsers ?? "–", icon: <Users className="w-5 h-5" />, color: "#7C3AED" },
    { label: "College Admins", value: analytics.totalAdmins ?? "–", icon: <School className="w-5 h-5" />, color: "#00FFF5" },
    { label: "Total Events", value: analytics.totalEvents ?? "–", icon: <Calendar className="w-5 h-5" />, color: "#F43F5E" },
    { label: "Pending Colleges", value: analytics.pendingColleges ?? "–", icon: <TrendingUp className="w-5 h-5" />, color: "#FBBF24" },
  ];

  const filteredColleges = colleges.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));
  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
  const filteredEvents = events.filter(e => (e.name || e.title || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0A0A15] flex text-white">
      {/* Sidebar */}
      <div className="w-64 bg-[#0F0F1A] border-r border-white/5 flex flex-col fixed h-full pt-20 z-20">
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F43F5E]/20 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-[#F43F5E]" />
            </div>
            <div>
              <p className="font-black text-sm">Super Admin</p>
              <p className="text-white/30 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? "bg-[#F43F5E]/20 text-[#F43F5E]" : "text-white/40 hover:text-white hover:bg-white/5"}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-6 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8 pt-28">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black">
            {activeTab === "overview" && "Platform Overview"}
            {activeTab === "colleges" && "College Management"}
            {activeTab === "users" && "User Management"}
            {activeTab === "events" && "All Events"}
            {activeTab === "registrations" && "All Registrations"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-white/20 outline-none"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {activeTab === "events" && (
              <button
                onClick={() => setShowEventModal(true)}
                className="px-6 py-2.5 bg-[#F43F5E] text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#F43F5E]/20 hover:scale-105 transition-transform"
              >
                <Plus className="w-5 h-5" /> Create Event
              </button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statCards.map((s, i) => (
                  <div key={i} className="bg-[#1F1F3A] rounded-2xl p-6 border border-white/10">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${s.color}20`, color: s.color }}>
                      {s.icon}
                    </div>
                    <p className="text-2xl font-black">{s.value}</p>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#1F1F3A] rounded-2xl border border-white/10 p-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Bell className="w-5 h-5 text-[#F43F5E]" /> Pending Approvals</h2>
                  <div className="space-y-4">
                    {colleges.filter(c => c.status === "pending").length === 0 ? (
                      <p className="text-white/20 text-sm text-center py-8">No pending college approvals</p>
                    ) : colleges.filter(c => c.status === "pending").map(college => (
                      <div key={college._id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#7C3AED]/20 rounded-xl flex items-center justify-center font-black text-[#7C3AED] text-sm">{college.name?.[0]}</div>
                          <div>
                            <p className="font-bold text-sm">{college.name}</p>
                            <p className="text-white/40 text-[10px] uppercase font-bold">{college.location}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => rejectCollege(college._id)} className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all text-white/40"><X className="w-4 h-4" /></button>
                          <button onClick={() => approveCollege(college._id)} className="p-2 hover:bg-green-500/20 hover:text-green-400 rounded-lg transition-all text-white/40"><Check className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1F1F3A] rounded-2xl border border-white/10 p-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[#00FFF5]" /> Recent Registrations</h2>
                  <div className="space-y-4">
                    {registrations.length === 0 ? (
                      <p className="text-white/20 text-sm text-center py-8">No registration activity yet</p>
                    ) : registrations.slice(0, 5).map((reg, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#00FFF5]/10 rounded-xl flex items-center justify-center font-black text-[#00FFF5] text-xs">
                            {reg.userName?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{reg.userName}</p>
                            <p className="text-white/40 text-[10px]">registered for <span className="text-[#00FFF5]">{reg.eventName}</span></p>
                          </div>
                        </div>
                        <p className="text-white/20 text-[10px] font-bold uppercase">{new Date(reg.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Colleges Tab */}
          {activeTab === "colleges" && (
            <motion.div key="colleges" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {filteredColleges.map(college => (
                <div key={college._id} className="bg-[#1F1F3A] rounded-2xl border border-white/10 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#7C3AED]/20 rounded-2xl flex items-center justify-center font-black text-xl text-[#7C3AED]">{college.name?.[0]}</div>
                    <div>
                      <p className="font-bold">{college.name}</p>
                      <p className="text-white/40 text-sm">{college.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${college.status === "approved" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>{college.status}</span>
                    <button onClick={() => toggleCollege(college._id)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all" title="Toggle Status">
                      <RefreshCw className="w-4 h-4 text-white/50" />
                    </button>
                    <button onClick={() => rejectCollege(college._id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all" title="Delete">
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredColleges.length === 0 && <p className="text-white/20 text-center py-16">No colleges found.</p>}
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {filteredUsers.map(u => (
                <div key={u._id} className="bg-[#1F1F3A] rounded-2xl border border-white/10 p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-black text-white/40">{u.name?.[0]}</div>
                      <div>
                        <p className="font-bold">{u.name}</p>
                        <p className="text-white/40 text-sm">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${u.role === "college_admin" ? "bg-[#7C3AED]/20 text-[#7C3AED]" : "bg-[#00FFF5]/20 text-[#00FFF5]"}`}>{u.role?.replace("_", " ")}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.approved ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{u.approved ? "Active" : "Inactive"}</span>
                      <button onClick={() => toggleUser(u._id)} className={`p-2 rounded-lg transition-all ${u.approved ? "bg-red-500/10 hover:bg-red-500/20" : "bg-green-500/10 hover:bg-green-500/20"}`}>
                        {u.approved ? <UserX className="w-4 h-4 text-red-400" /> : <UserCheck className="w-4 h-4 text-green-400" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Registrations for this student */}
                  {u.role === "student" && (
                    <div className="mt-2 pt-4 border-t border-white/5">
                      <p className="text-[10px] font-black uppercase text-white/20 mb-3 tracking-widest">Registered Events</p>
                      <div className="flex flex-wrap gap-2">
                        {registrations.filter(r => r.userId === u._id).length > 0 ? (
                          registrations.filter(r => r.userId === u._id).map((reg, idx) => (
                            <span key={idx} className="bg-white/5 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-[#7C3AED]" /> {reg.eventName}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-white/10 italic">No registrations found</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {filteredUsers.length === 0 && <p className="text-white/20 text-center py-16">No users found.</p>}
            </motion.div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <motion.div key="events" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <div key={event._id} className="bg-[#1F1F3A] rounded-2xl border border-white/10 p-6 flex flex-col group hover:border-[#F43F5E]/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-[#7C3AED]/20 text-[#7C3AED] rounded-full text-xs font-bold">{event.category || "Event"}</span>
                    <span className="text-white/30 text-xs">{event.date}</span>
                  </div>
                  <h3 className="font-black text-lg mb-2 group-hover:text-[#F43F5E] transition-colors">{event.name || event.title}</h3>
                  <p className="text-white/40 text-sm mb-4 line-clamp-2 flex-1">{event.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-white/30 text-xs">
                      <School className="w-3.5 h-3.5 text-[#F43F5E]" /> {event.college || event.collegeName || "Campus Event"}
                    </div>
                    <div className="flex items-center gap-2 text-white/30 text-xs">
                      <Users className="w-3.5 h-3.5 text-[#00FFF5]" /> {registrations.filter(r => r.eventId === event._id).length} Registered
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <div className="font-black text-[#00FFF5]">₹{event.price || 0}</div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(event)} className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-[#00FFF5] hover:bg-[#00FFF5]/10 transition-all"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => deleteEvent(event._id)} className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <CertificateControls event={event} onStatusChange={fetchData} />
                </div>
              ))}
              {filteredEvents.length === 0 && <p className="text-white/20 text-center py-16 col-span-3">No events found.</p>}
            </motion.div>
          )}
          {/* Registrations Tab */}
          {activeTab === "registrations" && (
            <motion.div key="registrations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <div className="bg-[#1F1F3A] rounded-[2rem] border border-white/10 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-8 py-5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Student</th>
                      <th className="px-8 py-5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Target Event</th>
                      <th className="px-8 py-5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Source College</th>
                      <th className="px-8 py-5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Registration Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {registrations.length > 0 ? (
                      registrations.map((reg, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="px-8 py-6">
                            <div className="font-black text-sm">{reg.userName}</div>
                            <div className="text-white/30 text-[10px] font-bold">{reg.userEmail}</div>
                          </td>
                          <td className="px-8 py-6 font-bold text-[#F43F5E] text-sm">{reg.eventName}</td>
                          <td className="px-8 py-6 text-white/40 text-xs">{reg.college || "Global"}</td>
                          <td className="px-8 py-6 text-white/30 text-xs font-bold uppercase">{new Date(reg.date).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center text-white/30 font-bold italic">No registrations recorded on the platform.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={closeEventModal} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#1F1F3A] w-full max-w-2xl rounded-[3rem] p-8 border border-white/10 relative z-10 max-h-[90vh] overflow-y-auto shadow-[0_0_100px_rgba(244,63,94,0.1)]"
          >
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black">{editingEvent ? "Edit Event" : "Create Global Event"}</h2>
              <div className="w-12 h-12 bg-[#F43F5E]/20 rounded-2xl flex items-center justify-center text-[#F43F5E]">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            
            <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Event Name</label>
                <div className="relative">
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                  <input type="text" required placeholder="Enter event name..." className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:border-[#F43F5E] outline-none transition-all placeholder:text-white/10 font-bold"
                    value={newEvent.name} onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} />
                </div>
              </div>
              
              <div>
                <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Category</label>
                <select className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-6 focus:border-[#F43F5E] outline-none appearance-none font-bold cursor-pointer"
                  value={newEvent.category} onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}>
                  <option>Technical</option>
                  <option>Cultural</option>
                  <option>Sports</option>
                  <option>Workshop</option>
                  <option>Hackathon</option>
                </select>
              </div>

              <div>
                <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Date</label>
                <input type="date" required className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-6 focus:border-[#F43F5E] outline-none font-bold"
                  value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
              </div>

              <div>
                <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Time</label>
                <input type="time" required className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-6 focus:border-[#F43F5E] outline-none font-bold"
                  value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
              </div>

              <div>
                <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Venue</label>
                <div className="relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                  <input type="text" required placeholder="Main Auditorium" className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:border-[#F43F5E] outline-none font-bold"
                    value={newEvent.venue} onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Entry Fee (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                  <input type="number" required className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:border-[#F43F5E] outline-none font-bold"
                    value={newEvent.price} onChange={(e) => setNewEvent({ ...newEvent, price: parseInt(e.target.value) })} />
                </div>
              </div>

              <div>
                <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Capacity</label>
                <div className="relative">
                  <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                  <input type="number" required className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:border-[#F43F5E] outline-none font-bold"
                    value={newEvent.maxParticipants} onChange={(e) => setNewEvent({ ...newEvent, maxParticipants: parseInt(e.target.value) })} />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Description</label>
                <textarea required rows={4} placeholder="Describe the event..." className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-6 focus:border-[#F43F5E] outline-none resize-none font-medium text-sm"
                  value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
              </div>

              <div className="md:col-span-2 flex gap-4 pt-4">
                <button type="button" onClick={closeEventModal} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black transition-all border border-white/10">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-[#F43F5E] to-[#FB7185] text-white rounded-2xl font-black shadow-lg shadow-[#F43F5E]/30 transition-all">{editingEvent ? "Update Event" : "Create Global Event"}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
