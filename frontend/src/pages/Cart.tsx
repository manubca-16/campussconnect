import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Calendar, MapPin, Tag } from "lucide-react";

export default function Cart() {
  const { cart, removeFromCart, total } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-12 h-12 text-white/20" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-white/50 mb-8 max-w-sm mx-auto">
            Browse events and click <strong>"Add to Cart"</strong> to register for multiple events at once.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] rounded-full font-bold shadow-lg shadow-[#7C3AED]/20 hover:scale-105 transition-transform"
          >
            Explore Events <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black">Your Cart</h1>
          <p className="text-white/40 text-sm mt-1">{cart.length} event{cart.length !== 1 ? "s" : ""} selected</p>
        </div>
        <Link to="/events" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold">
          <ArrowLeft className="w-4 h-4" /> Browse More
        </Link>
      </div>

      <div className="space-y-4 mb-10">
        <AnimatePresence>
          {cart.map((item) => (
            <motion.div
              key={item._id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className="bg-[#1F1F3A] rounded-2xl p-5 border border-white/10 flex items-center gap-5"
            >
              {/* Color avatar */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#F43F5E] flex items-center justify-center font-black text-xl flex-shrink-0">
                {item.name?.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold truncate">{item.name}</h3>
                <div className="flex items-center gap-4 mt-1 text-white/40 text-xs flex-wrap">
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{item.college}</span>
                  {item.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                  {item.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.venue}</span>}
                </div>
              </div>

              <div className="text-xl font-black text-[#00FFF5] flex-shrink-0">
                {item.price === 0 ? "FREE" : `₹${item.price}`}
              </div>

              <button
                onClick={() => removeFromCart(item._id)}
                className="p-2.5 text-white/30 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 rounded-xl transition-all flex-shrink-0"
                title="Remove from cart"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Totals & CTA */}
      <div className="bg-[#1F1F3A] rounded-[2rem] p-8 border border-white/10">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
          <span className="text-white/50 font-medium">{cart.length} Event{cart.length !== 1 ? "s" : ""}</span>
          <div className="text-right">
            <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-0.5">Total</div>
            <div className="text-4xl font-black text-white">
              {total === 0 ? "FREE" : `₹${total}`}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/events"
            className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-center transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Continue Browsing
          </Link>
          <Link
            to="/checkout"
            className="flex-1 px-8 py-4 bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] rounded-xl font-bold text-lg shadow-lg shadow-[#7C3AED]/20 hover:opacity-90 transition-opacity text-center flex items-center justify-center gap-2"
          >
            Proceed to Checkout <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
