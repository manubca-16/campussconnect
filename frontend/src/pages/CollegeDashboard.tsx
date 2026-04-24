import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Plus, LayoutDashboard, Calendar, Users, IndianRupee, Settings, Trash2, Edit3, LogOut, ShieldAlert, Download, QrCode } from "lucide-react";
import * as XLSX from "xlsx";
import QRCodeModal from "../components/admin/QRCodeModal";
import { apiFetch } from "../utils/api";

export default function CollegeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [selectedQR, setSelectedQR] = useState<any>(null);
  const [isFest, setIsFest] = useState(false);
  const [subEvents, setSubEvents] = useState<any[]>([]);
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
    contactEmail: user?.email || "",
    prizeDetails: "",
    poster: "",
    paymentOptions: [] as string[]
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      if (target === 'main') {
        setNewEvent(prev => ({ ...prev, poster: base64 }));
      } else {
        const updated = [...subEvents];
        updated[target].poster = base64;
        setSubEvents(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchData = () => {
    apiFetch("/api/events")
      .then(res => res.json())
      .then(data => setEvents(Array.isArray(data) ? data : []));
    
    if (user?.id) {
      apiFetch(`/api/registrations?collegeId=${user.id}`)
        .then(res => res.json())
        .then(data => setRegistrations(data));
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingEvent ? "PUT" : "POST";
      const url = editingEvent ? `/api/events/${editingEvent._id}` : "/api/events";
      
      // Auto-assign category for Fests
      const payload = { ...newEvent, isFest, college: user?.name, collegeId: user?.id };
      if (isFest) {
        payload.category = "Fest";
        payload.venue = payload.venue || "Multiple Venues / Campus";
      }

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        const createdFest = await res.json();
        
        // Save sub-events if this is a new Fest
        if (isFest && subEvents.length > 0 && !editingEvent) {
           for (const sub of subEvents) {
              await apiFetch("/api/events", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ 
                     ...sub, 
                     isFest: false, 
                     parentFestId: createdFest._id, 
                     college: user?.name, 
                     collegeId: user?.id 
                  })
              });
           }
        }

        fetchData();
        closeModal();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to save event: ${errData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("A network error occurred while saving the event.");
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
    if (event.collegeId !== user?.id && event.college !== user?.name) return;
    setEditingEvent(event);
    setIsFest(event.isFest || false);
    setNewEvent(event);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingEvent(null);
    setIsFest(false);
    setSubEvents([]);
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
      contactEmail: user?.email || "",
      prizeDetails: "",
      poster: "",
      paymentOptions: [] as string[]
    });
  };

  const totalRevenue = registrations.reduce((acc, reg) => acc + (reg.price || 0), 0);

  const downloadExcel = () => {
    const headers = ["Student Name", "Student Email", "Event Name", "College", "Registration Date", "Entry Fee", "Payment Status"];
    
    const rows = registrations.map(reg => {
      const event = events.find(e => e._id === reg.eventId);
      const fee = event ? (event.price || 0) : (reg.price || 0);
      const paymentStatus = fee > 0 ? "Paid" : "Free";
      const dateStr = new Date(reg.date).toLocaleDateString(undefined, { dateStyle: 'medium' });

      return [
        reg.userName || '',
        reg.userEmail || '',
        reg.eventName || (event ? event.name : ''),
        reg.college || '',
        dateStr,
        fee,
        paymentStatus
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
    
    const colWidths = headers.map(h => ({ wch: Math.max(15, h.length + 5) }));
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, "Event_Registrations.xlsx");
  };

  const handleLogout = () => { logout(); navigate("/auth"); };

  return (
    <div className="min-h-screen bg-[#0A0A15] flex text-white relative">
      {/* Sidebar */}
      <div className="w-64 bg-[#0F0F1A] border-r border-white/5 flex flex-col fixed h-full pt-20 z-20">
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7C3AED]/20 rounded-xl flex items-center justify-center font-black text-[#7C3AED] leading-none">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="font-black text-sm truncate">{user?.name}</p>
              <span className="text-[10px] font-bold text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-0.5 rounded-full uppercase">College Admin</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: "events", label: "Manage Events", icon: <Calendar className="w-4 h-4" /> },
            { id: "registrations", label: "Registrations", icon: <Users className="w-4 h-4" /> },
            { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === item.id ? "bg-[#7C3AED]/20 text-[#7C3AED]" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-6 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-64 flex-1 p-8 pt-28 min-h-screen">
        {activeTab === "dashboard" && (
          <div className="space-y-12 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black mb-2">College Dashboard</h1>
                <p className="text-white/40 font-medium">Welcome back, {user?.name}</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#7C3AED]/20 hover:scale-105 transition-transform"
              >
                <Plus className="w-5 h-5" /> Add Event
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { label: "My Events", value: events.filter(e => e.collegeId === user?.id).length, icon: <Calendar className="text-[#7C3AED]" />, color: "bg-[#7C3AED]/10" },
                { label: "Total Registrations", value: registrations.length, icon: <Users className="text-[#00FFF5]" />, color: "bg-[#00FFF5]/10" },
                { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: <IndianRupee className="text-[#F43F5E]" />, color: "bg-[#F43F5E]/10" },
              ].map((stat, idx) => (
                <div key={idx} className="bg-[#1F1F3A] p-8 rounded-[2rem] border border-white/10 flex items-center gap-6 shadow-xl shadow-black/20">
                  <div className={`w-16 h-16 rounded-2xl ${stat.color} flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-3xl font-black">{stat.value}</div>
                    <div className="text-white/40 text-sm font-bold uppercase tracking-wider">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <section>
              <h3 className="text-2xl font-bold mb-8">Recent Campus Activity</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {events.slice(0, 4).length > 0 ? (
                  events.slice(0, 4).map((event) => {
                    const isOwn = event.collegeId === user?.id || event.college === user?.name;
                    return (
                      <div key={event._id} className="bg-[#1F1F3A] p-6 rounded-3xl border border-white/10 flex items-center justify-between group hover:border-[#7C3AED]/50 transition-all shadow-lg hover:shadow-[#7C3AED]/10">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 ${isOwn ? "bg-[#7C3AED]/20" : "bg-red-500/20"} rounded-2xl flex items-center justify-center font-black text-xl ${isOwn ? "text-[#7C3AED]" : "text-red-400"}`}>
                            {isOwn ? event.name?.[0] : <ShieldAlert className="w-6 h-6" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-lg group-hover:text-[#7C3AED] transition-colors">{event.name}</h4>
                              {!isOwn && <span className="text-[8px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Global</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-white/40 text-[10px] uppercase font-black tracking-widest">{event.category}</span>
                              <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                              <span className="text-white/40 text-[10px] uppercase font-black tracking-widest">{event.college || "Global"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-lg">₹{event.price}</div>
                          <div className={`${isOwn ? "text-[#00FFF5]" : "text-white/20"} text-[10px] font-bold uppercase`}>{isOwn ? registrations.filter(r => r.eventId === event._id).length + " Registered" : event.date}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 py-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <p className="text-white/40 font-bold">No events available.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black">Manage Events</h2>
              <button 
                onClick={() => setShowAddModal(true)} 
                className="px-6 py-2.5 bg-[#7C3AED] text-white rounded-xl font-bold hover:bg-[#6D28D9] transition-colors flex items-center gap-2 shadow-lg shadow-[#7C3AED]/20"
              >
                <Plus className="w-5 h-5" /> New Event
              </button>
            </div>

            <div className="bg-[#1F1F3A] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-8 py-5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Event Details</th>
                      <th className="px-8 py-5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">College Source</th>
                      <th className="px-8 py-5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Date & Price</th>
                      <th className="px-8 py-5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {events.length > 0 ? (
                      events.map((event) => {
                        const isOwn = event.collegeId === user?.id || event.college === user?.name;
                        return (
                          <tr key={event._id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-8 py-6">
                              <div className="font-black text-lg group-hover:text-[#7C3AED] transition-colors flex items-center gap-3">
                                {event.name}
                                {!isOwn && <ShieldAlert className="w-4 h-4 text-red-500" />}
                              </div>
                              <div className="text-white/40 text-xs mt-1">{event.venue}</div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col gap-1">
                                <span className={`text-xs font-bold ${isOwn ? "text-[#7C3AED] bg-[#7C3AED]/10" : "text-red-400 bg-red-400/10"} px-2 py-0.5 rounded-md w-fit`}>{isOwn ? "My College" : "Super Admin"}</span>
                                <span className="text-xs text-white/40">{event.college}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="font-black">₹{event.price}</div>
                              <div className="text-white/40 text-xs">{event.date}</div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex justify-center gap-3">
                                {isOwn ? (
                                  <>
                                    <button onClick={() => setSelectedQR(event)} className="p-2.5 bg-white/5 rounded-xl text-white/40 hover:text-[#7C3AED] hover:bg-[#7C3AED]/10 transition-all"><QrCode className="w-5 h-5" /></button>
                                    <button onClick={() => openEditModal(event)} className="p-2.5 bg-white/5 rounded-xl text-white/40 hover:text-[#00FFF5] hover:bg-[#00FFF5]/10 transition-all"><Edit3 className="w-5 h-5" /></button>
                                    <button onClick={() => deleteEvent(event._id)} className="p-2.5 bg-white/5 rounded-xl text-white/40 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 transition-all"><Trash2 className="w-5 h-5" /></button>
                                  </>
                                ) : (
                                  <span className="text-white/10 text-[10px] font-black uppercase italic">Read Only</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center text-white/30 font-bold italic">No events found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "registrations" && (
          <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black">Event Registrations</h2>
              <button 
                onClick={downloadExcel}
                className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg"
              >
                <Download className="w-5 h-5 text-[#00FFF5]" /> Download Excel
              </button>
            </div>
            <div className="bg-[#1F1F3A] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-8 py-5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Student</th>
                      <th className="px-8 py-5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Event Name</th>
                      <th className="px-8 py-5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Registration Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {registrations.length > 0 ? (
                      registrations.map((reg) => (
                        <tr key={reg._id} className="hover:bg-white/5 transition-colors">
                          <td className="px-8 py-6">
                            <div className="font-black">{reg.userName}</div>
                            <div className="text-white/40 text-xs italic">{reg.userEmail || 'registered student'}</div>
                          </td>
                          <td className="px-8 py-6 font-bold text-[#7C3AED]">{reg.eventName}</td>
                          <td className="px-8 py-6 text-white/40 text-sm font-medium">{new Date(reg.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-8 py-12 text-center text-white/30 font-bold italic">No registrations yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-black">College Settings</h2>
            <div className="bg-[#1F1F3A] p-10 rounded-[2.5rem] border border-white/10 space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-white/5">
                <Settings className="w-32 h-32 rotate-12" />
              </div>
              <div className="relative z-10 space-y-6">
                <div>
                  <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">College Name</label>
                  <div className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-white/60 font-bold backdrop-blur-md">
                    {user?.name}
                  </div>
                </div>
                <div>
                  <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Admin Email</label>
                  <div className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-white/40 font-bold backdrop-blur-md italic">
                    {user?.email}
                  </div>
                </div>
                <div className="pt-4">
                  <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black transition-all border border-white/10 hover:border-white/20 active:scale-95">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={closeModal} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#1F1F3A] w-full max-w-2xl rounded-[3rem] p-8 md:p-12 border border-white/10 relative z-10 max-h-[90vh] overflow-y-auto shadow-[0_0_100px_rgba(124,58,237,0.15)]"
          >
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black">{editingEvent ? "Edit Event" : "Create New Event"}</h2>
              <div className="w-12 h-12 bg-[#7C3AED]/20 rounded-2xl flex items-center justify-center text-[#7C3AED]">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            
            <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {!editingEvent && (
                <div className="md:col-span-2 flex items-center gap-6 bg-black/20 p-4 rounded-3xl border border-white/5">
                  <span className="text-white/40 text-sm font-bold uppercase tracking-widest">Type:</span>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-white transition-opacity hover:opacity-80">
                    <input type="radio" checked={!isFest} onChange={() => setIsFest(false)} className="accent-[#7C3AED]" />
                    Single Event
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-white transition-opacity hover:opacity-80">
                    <input type="radio" checked={isFest} onChange={() => setIsFest(true)} className="accent-[#7C3AED]" />
                    College Fest
                  </label>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">
                  {isFest ? "Fest Name" : "Event Name"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isFest ? "e.g., TechBlitz 2025" : "e.g., Hackathon"}
                  className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-6 focus:border-[#7C3AED] outline-none transition-all placeholder:text-white/10 font-bold"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                />
              </div>

              {!isFest && (
                <div>
                  <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Category</label>
                  <select
                    className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-6 focus:border-[#7C3AED] outline-none font-bold"
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  >
                    <option>Technical</option>
                    <option>Cultural</option>
                    <option>Sports</option>
                    <option>Workshop</option>
                    <option>Hackathon</option>
                  </select>
                </div>
              )}

              <div className={isFest ? "md:col-span-2" : ""}>
                <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Scope</label>
                <select
                  className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-6 focus:border-[#7C3AED] outline-none font-bold"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                >
                  <option>Inter College</option>
                  <option>College Level</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Poster</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'main')}
                  className="w-full bg-black/30 border border-white/10 rounded-2xl py-3 px-4 focus:border-[#7C3AED] outline-none font-medium file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-[#7C3AED] file:text-white hover:file:bg-[#6D28D9] transition-all cursor-pointer text-white/40"
                />
                {newEvent.poster && <img src={newEvent.poster} alt="Poster Preview" className="mt-4 h-32 rounded-xl object-contain border border-white/10 bg-black/50" />}
              </div>

              <div>
                <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Start Date</label>
                <input type="date" required className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-6 focus:border-[#7C3AED] outline-none font-bold" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
              </div>

              <div>
                <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Start Time</label>
                <input type="time" required className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-6 focus:border-[#7C3AED] outline-none font-bold" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
              </div>

              {!isFest && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Venue</label>
                    <input type="text" required placeholder="Auditorium, Main Hall, etc." className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-6 focus:border-[#7C3AED] outline-none font-bold" value={newEvent.venue} onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Entry Fee (₹)</label>
                    <input type="number" required className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-6 focus:border-[#7C3AED] outline-none font-bold" value={newEvent.price} onChange={(e) => setNewEvent({ ...newEvent, price: parseInt(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Payment Options</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-white/70">
                        <input type="checkbox" checked={newEvent.paymentOptions.includes("Online")} onChange={(e) => {
                          const opts = e.target.checked ? [...newEvent.paymentOptions, "Online"] : newEvent.paymentOptions.filter(o => o !== "Online");
                          setNewEvent({ ...newEvent, paymentOptions: opts });
                        }} className="w-4 h-4 accent-[#7C3AED]" /> Online
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-white/70">
                        <input type="checkbox" checked={newEvent.paymentOptions.includes("COD")} onChange={(e) => {
                          const opts = e.target.checked ? [...newEvent.paymentOptions, "COD"] : newEvent.paymentOptions.filter(o => o !== "COD");
                          setNewEvent({ ...newEvent, paymentOptions: opts });
                        }} className="w-4 h-4 accent-[#7C3AED]" /> COD
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Max Capacity</label>
                    <input type="number" required className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-6 focus:border-[#7C3AED] outline-none font-bold" value={newEvent.maxParticipants} onChange={(e) => setNewEvent({ ...newEvent, maxParticipants: parseInt(e.target.value) })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Description</label>
                    <textarea required rows={4} placeholder="Event description..." className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-6 focus:border-[#7C3AED] outline-none resize-none font-medium" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
                  </div>
                </>
              )}
              
              {isFest && (
                <div className="md:col-span-2">
                    <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Fest Description / Intro</label>
                    <textarea required rows={4} placeholder="General fest details..." className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-6 focus:border-[#7C3AED] outline-none resize-none font-medium text-white/80" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
                </div>
              )}

              {isFest && !editingEvent && (
                <div className="md:col-span-2 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Sub-Events</h3>
                    <button type="button" onClick={() => setSubEvents([...subEvents, { name: "", category: "Technical", type: newEvent.type, description: "", date: newEvent.date, time: newEvent.time, venue: "", price: 0, maxParticipants: 100, contactEmail: newEvent.contactEmail, poster: "", paymentOptions: ["Online"] }])} className="px-4 py-2 bg-[#7C3AED]/20 text-[#7C3AED] rounded-xl font-bold hover:bg-[#7C3AED]/30 transition-all text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add Sub-Event
                    </button>
                  </div>
                  <div className="space-y-6">
                    {subEvents.map((sub, idx) => (
                       <div key={idx} className="bg-black/20 p-6 flex flex-col gap-4 rounded-3xl border border-white/5 relative">
                         <button type="button" onClick={() => setSubEvents(subEvents.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-white/30 hover:text-red-400"><Trash2 className="w-5 h-5"/></button>
                         <h4 className="font-bold text-[#00FFF5] text-lg mb-2">Event {idx + 1}</h4>
                         
                         <div>
                           <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Event Name</label>
                           <input type="text" placeholder="e.g., Coding Relay" required className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 focus:border-[#7C3AED] outline-none font-bold text-sm" value={sub.name} onChange={(e) => { const n = [...subEvents]; n[idx].name = e.target.value; setSubEvents(n); }} />
                         </div>

                         <div>
                           <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Event Poster</label>
                           <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, idx)} className="w-full text-xs text-white/40 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-black file:bg-[#7C3AED] file:text-white hover:file:bg-[#6D28D9] transition-all cursor-pointer bg-black/30 border border-white/10 rounded-xl py-1.5 px-2" />
                           {sub.poster && <img src={sub.poster} alt="Preview" className="h-20 mt-4 rounded-xl object-contain bg-black/50 border border-white/10 p-1"/>}
                         </div>

                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                           <div>
                             <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Start Date</label>
                             <input type="date" required className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 outline-none font-bold text-sm text-white/60 focus:border-[#7C3AED] transition-colors" value={sub.date} onChange={(e) => { const n = [...subEvents]; n[idx].date = e.target.value; setSubEvents(n); }} />
                           </div>
                           <div>
                             <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Start Time</label>
                             <input type="time" required className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 outline-none font-bold text-sm text-white/60 focus:border-[#7C3AED] transition-colors" value={sub.time} onChange={(e) => { const n = [...subEvents]; n[idx].time = e.target.value; setSubEvents(n); }} />
                           </div>
                           <div>
                             <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Entry Fee (₹)</label>
                             <input type="number" placeholder="e.g., 500" required className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 outline-none font-bold text-sm text-white/60 focus:border-[#7C3AED] transition-colors" value={sub.price} onChange={(e) => { const n = [...subEvents]; n[idx].price = parseInt(e.target.value); setSubEvents(n); }} />
                           </div>
                           <div>
                             <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Venue</label>
                             <input type="text" placeholder="e.g., Room 101" required className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 outline-none font-bold text-sm text-white/60 focus:border-[#7C3AED] transition-colors" value={sub.venue} onChange={(e) => { const n = [...subEvents]; n[idx].venue = e.target.value; setSubEvents(n); }} />
                           </div>
                         </div>
                         
                         <div>
                           <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Payment Options</label>
                           <div className="flex gap-6">
                               <label className="text-white/70 text-sm font-bold flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80">
                                 <input type="checkbox" className="w-4 h-4 accent-[#7C3AED]" checked={sub.paymentOptions?.includes('Online')} onChange={(e) => { const n = [...subEvents]; n[idx].paymentOptions = e.target.checked ? [...n[idx].paymentOptions, 'Online'] : n[idx].paymentOptions.filter((o: string) => o !== 'Online'); setSubEvents(n); }} /> 
                                 Online Payment
                               </label>
                               <label className="text-white/70 text-sm font-bold flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80">
                                 <input type="checkbox" className="w-4 h-4 accent-[#7C3AED]" checked={sub.paymentOptions?.includes('COD')} onChange={(e) => { const n = [...subEvents]; n[idx].paymentOptions = e.target.checked ? [...n[idx].paymentOptions, 'COD'] : n[idx].paymentOptions.filter((o: string) => o !== 'COD'); setSubEvents(n); }} /> 
                                 COD
                               </label>
                           </div>
                         </div>

                         <div>
                           <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Description & Rules</label>
                           <textarea required rows={3} placeholder="Specific rules and description for this event..." className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 focus:border-[#7C3AED] outline-none text-sm font-medium text-white/80 resize-none transition-colors" value={sub.description} onChange={(e) => { const n = [...subEvents]; n[idx].description = e.target.value; setSubEvents(n); }} />
                         </div>
                       </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="md:col-span-2 flex gap-4 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black transition-all border border-white/10 active:scale-95">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] text-white rounded-2xl font-black shadow-lg shadow-[#7C3AED]/30 hover:shadow-[#F43F5E]/30 active:scale-95 transition-all outline-none">
                  {editingEvent ? "Update" : isFest ? "Create Fest & Sub-Events" : "Create Event"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {selectedQR && (
        <QRCodeModal
          eventId={selectedQR._id}
          eventName={selectedQR.name || selectedQR.title}
          onClose={() => setSelectedQR(null)}
        />
      )}
    </div>
  );
}
