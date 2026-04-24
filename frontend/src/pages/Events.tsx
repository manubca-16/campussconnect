import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, Filter, Calendar, MapPin, Tag, ShoppingCart, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { apiFetch } from "../utils/api";

interface Event {
  _id: string;
  name: string;
  category: string;
  type: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  college: string;
  description: string;
  isFest?: boolean;
  parentFestId?: string;
  poster?: string;
}

const categoryGradients: Record<string, string> = {
  Hackathon: "from-[#7C3AED] to-[#4F46E5]",
  Technical: "from-[#0EA5E9] to-[#0284C7]",
  Cultural: "from-[#F43F5E] to-[#E11D48]",
  Sports:   "from-[#10B981] to-[#059669]",
  Workshop: "from-[#F59E0B] to-[#D97706]",
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [toast, setToast] = useState("");
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    apiFetch("/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []));
  }, []);

  const filteredEvents = events.filter((event) => {
    if (event.parentFestId) return false;
    const name = event.name || "";
    const college = event.college || "";
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "All" || event.category === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = ["All", "Technical", "Cultural", "Sports", "Workshop", "Hackathon"];

  const handleAddToCart = (event: Event) => {
    const added = addToCart({
      _id: event._id,
      name: event.name,
      price: event.price,
      college: event.college,
      category: event.category,
      date: event.date,
      venue: event.venue,
    });
    if (added) {
      setToast(`🛒 "${event.name}" added to cart!`);
    } else {
      setToast(`Already in cart!`);
    }
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-[100] bg-[#1F1F3A] border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
        <div>
          <h1 className="text-4xl font-black mb-2">Explore Events</h1>
          <p className="text-white/60 text-lg">Discover the best campus activities happening near you.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              placeholder="Search events or colleges..."
              className="bg-[#1F1F3A] border border-white/10 rounded-xl py-3 pl-12 pr-4 w-full sm:w-72 focus:border-[#7C3AED] outline-none transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <select
              className="bg-[#1F1F3A] border border-white/10 rounded-xl py-3 pl-12 pr-8 appearance-none focus:border-[#7C3AED] outline-none transition-colors"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-3 flex-wrap mb-10">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === cat ? "bg-[#7C3AED] text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, idx) => {
            const grad = categoryGradients[event.category] || "from-[#7C3AED] to-[#F43F5E]";
            const inCart = isInCart(event._id);

            return (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="group bg-[#1F1F3A] rounded-[2rem] overflow-hidden border border-white/10 hover:border-[#7C3AED]/50 transition-all hover:shadow-2xl hover:shadow-[#7C3AED]/10 flex flex-col"
              >
                {/* Banner */}
                <div className={`relative h-44 bg-gradient-to-br ${grad} flex items-end p-5 overflow-hidden`}>
                  {event.poster ? (
                    <img src={event.poster} alt={event.name} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <span className="text-5xl font-black text-white/15 select-none">{event.name?.charAt(0)}</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F1F3A] to-transparent opacity-80" />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/10 z-10">
                    {event.isFest ? "🎪 FEST" : event.category}
                  </div>
                  <div className="absolute top-4 left-4 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white z-10">
                    {event.type}
                  </div>
                  <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-sm font-bold text-[#00FFF5] z-10">
                    {event.isFest ? "Multiple Events" : (event.price === 0 ? "FREE" : `₹${event.price}`)}
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-bold mb-1 group-hover:text-[#7C3AED] transition-colors line-clamp-1">{event.name}</h3>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {event.college}
                  </p>
                  <p className="text-white/50 text-sm mb-4 line-clamp-2 flex-1">{event.description}</p>

                  <div className="space-y-1.5 mb-5 text-sm">
                    <div className="flex items-center gap-2 text-white/50">
                      <Calendar className="w-4 h-4 text-[#F43F5E] flex-shrink-0" />
                      {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-white/50">
                      <MapPin className="w-4 h-4 text-[#00FFF5] flex-shrink-0" />
                      {event.venue}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      to={`/events/${event._id}`}
                      className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-center font-bold text-sm transition-colors border border-white/5"
                    >
                      View Details
                    </Link>

                    {user?.role === "student" ? (
                      <button
                        onClick={() => handleAddToCart(event)}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                          inCart
                            ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default"
                            : "bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] shadow-lg shadow-[#7C3AED]/20 hover:opacity-90"
                        }`}
                        disabled={inCart}
                      >
                        {inCart ? (
                          <><Check className="w-4 h-4" /> In Cart</>
                        ) : (
                          <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
                        )}
                      </button>
                    ) : !user ? (
                      <Link
                        to="/auth"
                        className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-center font-bold text-sm border border-white/5 transition-colors"
                      >
                        Login
                      </Link>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center">
            <Search className="w-16 h-16 mx-auto text-white/20 mb-4" />
            <h3 className="text-2xl font-bold text-white/40">No events found</h3>
            <p className="text-white/30">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
