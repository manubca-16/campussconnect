import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Tag, Users, Trophy, Phone, Mail, ArrowLeft, CheckCircle, Clock, Loader } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

interface Event {
  _id: string;
  name: string;
  category: string;
  type: string;
  description: string;
  rules: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  poster?: string;
  college: string;
  maxParticipants: number;
  contactEmail: string;
  prizeDetails: string;
  isFest?: boolean;
  paymentOptions?: string[];
  parentFestId?: string;
}

const categoryColors: Record<string, string> = {
  Hackathon: "#7C3AED",
  Technical: "#0EA5E9",
  Cultural: "#F43F5E",
  Sports: "#10B981",
  Workshop: "#F59E0B",
};

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [subEvents, setSubEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState("Online");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/events/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
        if (data.isFest) {
           apiFetch(`/api/events`)
             .then(r => r.json())
             .then(all => {
                 setSubEvents(all.filter((e: Event) => e.parentFestId === data._id));
             });
        }
        if (data.paymentOptions && data.paymentOptions.length > 0) {
            setPaymentChoice(data.paymentOptions[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Check if already registered
    if (user?.id) {
      apiFetch(`/api/registrations?userId=${user.id}`)
        .then(r => r.json())
        .then((regs: any[]) => {
          if (Array.isArray(regs) && regs.find(r => r.eventId === id)) {
            setRegistered(true);
          }
        });
    }
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) { navigate("/auth"); return; }
    if (registered) return;
    setRegistering(true);
    setError("");
    try {
      const res = await apiFetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          eventId: event?._id,
          eventName: event?.name,
          userName: user.name,
          userEmail: user.email,
          college: event?.college,
          price: event?.price || 0,
          paymentMethod: event?.price && event.price > 0 ? paymentChoice : "Free",
        }),
      });
      if (res.ok) {
        setRegistered(true);
        setToast("🎉 Successfully registered! Check your Student Dashboard.");
        setTimeout(() => setToast(""), 5000);
      } else {
        const d = await res.json();
        setError(d.message || "Registration failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setRegistering(false);
  };

  const color = categoryColors[event?.category || ""] || "#7C3AED";
  const daysUntil = event ? Math.ceil((new Date(event.date).getTime() - Date.now()) / 86400000) : 0;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader className="w-8 h-8 text-[#7C3AED] animate-spin" />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-white/40 text-lg">Event not found.</p>
      <Link to="/events" className="text-[#7C3AED] font-bold hover:underline">← Back to Events</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-[100] bg-[#1F1F3A] border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold shadow-2xl max-w-sm">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <Link to="/events" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </Link>

      {/* Hero Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className={`w-full ${event.poster ? 'h-[60vh] min-h-[400px]' : 'h-56'} rounded-[2rem] mb-10 flex items-end p-8 relative overflow-hidden`}
        style={{
          background: event.poster ? `url(${event.poster}) center/cover no-repeat` : `linear-gradient(135deg, ${color}40, ${color}10)`,
          border: `1px solid ${color}30`
        }}>
        <div className={`absolute inset-0 ${event.poster ? 'bg-gradient-to-t from-[#0A0A15] via-[#0A0A15]/60 to-transparent opacity-90' : 'opacity-10'}`} style={!event.poster ? { background: `radial-gradient(circle at 70% 50%, ${color}, transparent 60%)` } : {}} />
        <div className="relative z-10 w-full flex items-end justify-between">
          <div>
          <div className="flex gap-3 mb-3">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white" style={{ background: `${color}40`, border: `1px solid ${color}60` }}>{event.category}</span>
            <span className="px-4 py-1.5 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider text-white/70">{event.type}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white">{event.name}</h1>
          <p className="text-white/60 mt-1 font-medium">{event.college}</p>
        </div>
          {daysUntil > 0 && (
            <div className="ml-auto text-right">
              <p className="text-4xl font-black" style={{ color }}>{daysUntil}</p>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Days Away</p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Registration Card */}
        {!event.isFest && (
          <div className="lg:col-span-1 space-y-6">
          {/* Price + Register */}
          <div className="bg-[#1F1F3A] rounded-3xl p-8 border border-white/10 space-y-6 sticky top-24">
            <div className="flex items-center justify-between">
              <span className="text-white/50 font-medium">Registration Fee</span>
              <span className="text-3xl font-black" style={{ color: "#00FFF5" }}>
                {event.price === 0 ? "FREE" : `₹${event.price}`}
              </span>
            </div>

            {registered ? (
              <div className="w-full py-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center gap-3 font-bold text-green-400">
                <CheckCircle className="w-5 h-5" /> Registered Successfully!
              </div>
            ) : user?.role === "student" ? (
              <button onClick={handleRegister} disabled={registering}
                className="w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all hover:opacity-90 active:scale-95"
                style={{ background: `linear-gradient(135deg, ${color}, #F43F5E)`, boxShadow: `0 0 30px ${color}30` }}>
                {registering ? <Loader className="w-5 h-5 animate-spin" /> : null}
                {registering ? "Registering..." : "Register Now"}
              </button>
            ) : !user ? (
              <Link to="/auth" className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-lg text-center flex items-center justify-center gap-3 border border-white/5 transition-all">
                Login to Register
              </Link>
            ) : (
              <div className="p-4 bg-white/5 rounded-xl text-center text-white/40 text-sm">
                Registration is only available for students.
              </div>
            )}

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <div className="flex items-center gap-2 text-white/30 text-xs justify-center">
              <Clock className="w-3 h-3" /> Registration closes 24 hours before the event.
            </div>

            {event.price > 0 && event.paymentOptions && event.paymentOptions.length > 0 && !registered && user?.role === "student" && (
                <div className="pt-4 border-t border-white/5 space-y-3">
                   <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Payment Method</span>
                   <select className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 outline-none font-bold text-sm text-white focus:border-[#7C3AED]" value={paymentChoice} onChange={(e) => setPaymentChoice(e.target.value)}>
                      {event.paymentOptions.map((po: string) => <option key={po} value={po}>{po}</option>)}
                   </select>
                </div>
            )}

            {/* Quick Info pills */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-[#F43F5E]" />
                <span className="text-white/70">{new Date(event.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-[#00FFF5]" />
                <span className="text-white/70">{event.time}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-[#7C3AED]" />
                <span className="text-white/70">{event.venue}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-4 h-4 text-[#FBBF24]" />
                <span className="text-white/70">Max {event.maxParticipants} participants</span>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Right: Details */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={event.isFest ? "lg:col-span-3 space-y-10" : "lg:col-span-2 space-y-10"}>
          {/* Description */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" style={{ color }} /> About this Event
            </h2>
            <p className="text-white/70 leading-relaxed text-lg">{event.description}</p>
          </section>

          {/* Prize */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#FBBF24]" /> Prize Details
            </h2>
            <div className="bg-gradient-to-r from-[#FBBF24]/10 to-transparent border border-[#FBBF24]/20 rounded-2xl p-6 text-white/80">
              {event.prizeDetails || "Exciting prizes for winners and certificates for all participants!"}
            </div>
          </section>

          {/* Rules */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00FFF5]" /> Rules & Regulations
            </h2>
            <div className="bg-[#1F1F3A] border border-white/10 rounded-2xl p-6 space-y-2">
              {(event.rules || "Standard rules apply. Please carry your college ID card.").split(".").filter(Boolean).map((rule, i) => (
                <div key={i} className="flex items-start gap-3 text-white/70">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                  {rule.trim()}.
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="pt-6 border-t border-white/10">
            <h2 className="text-xl font-bold mb-4">Contact Information</h2>
            <div className="flex flex-wrap gap-6">
              <a href={`mailto:${event.contactEmail}`} className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
                <Mail className="w-5 h-5" style={{ color }} />
                <span>{event.contactEmail}</span>
              </a>
              <div className="flex items-center gap-3 text-white/60">
                <Phone className="w-5 h-5" style={{ color }} />
                <span>+91 98765 43210</span>
              </div>
            </div>
          </section>
        </motion.div>
      </div>

      {/* Sub-Events List for Fests */}
      {event.isFest && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-16">
          <h2 className="text-3xl font-black mb-8 border-b border-white/10 pb-4">Fest Events</h2>
          {subEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subEvents.map(sub => (
                <Link to={`/events/${sub._id}`} key={sub._id} className="bg-[#1F1F3A] p-6 rounded-3xl border border-white/10 hover:border-[#7C3AED]/50 transition-all group flex flex-col h-full hover:shadow-xl hover:shadow-[#7C3AED]/10">
                  {sub.poster && <img src={sub.poster} alt={sub.name} className="w-full h-40 object-cover rounded-xl mb-4 bg-black/50" />}
                  <h3 className="text-xl font-bold group-hover:text-[#7C3AED] transition-colors mb-2">{sub.name}</h3>
                  <div className="flex items-center gap-2 text-white/50 text-sm mb-4">
                    <Clock className="w-4 h-4"/> {sub.time} | {sub.date}
                  </div>
                  <p className="text-white/60 text-sm line-clamp-2 mb-4 flex-1">{sub.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="font-bold text-[#00FFF5]">{sub.price === 0 ? "FREE" : `₹${sub.price}`}</span>
                    <span className="text-white/40 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors flex items-center gap-1">Details <ArrowLeft className="w-3 h-3 rotate-180" /></span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl text-center text-white/40 italic font-bold">
               No events added to this fest yet.
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
