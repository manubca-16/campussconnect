import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { CreditCard, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import { apiFetch } from "../utils/api";

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Save registrations to database
    try {
      for (const item of cart) {
        await apiFetch("/api/registrations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            userName: user?.name,
            userEmail: user?.email,
            eventId: item._id,
            eventName: item.name,
            college: item.college,
            price: item.price
          })
        });
      }
    } catch (error) {
      console.error("Failed to save registrations:", error);
    }

    setIsProcessing(false);
    setIsSuccess(true);
    
    // Simulate saving registration
    setTimeout(() => {
      clearCart();
      navigate("/dashboard/student");
    }, 3000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-[#00FFF5]/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-16 h-16 text-[#00FFF5]" />
          </div>
          <h2 className="text-4xl font-black mb-4">Payment Successful!</h2>
          <p className="text-white/60 text-lg mb-8">Your registrations are confirmed. Redirecting to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-black mb-12">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Order Summary */}
          <section className="bg-[#1F1F3A] rounded-3xl p-8 border border-white/10">
            <h3 className="text-xl font-bold mb-6">Order Summary</h3>
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item._id} className="flex justify-between items-center">
                  <span className="text-white/70">{item.name}</span>
                  <span className="font-bold">{item.price === 0 ? 'FREE' : `₹${item.price}`}</span>
                </div>
              ))}
              <hr className="border-white/10" />
              <div className="flex justify-between items-center text-xl font-black">
                <span>Total</span>
                <span className="text-[#00FFF5]">₹{total}</span>
              </div>
            </div>
          </section>

          {/* Payment Form */}
          <section className="bg-[#1F1F3A] rounded-3xl p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-8">
              <CreditCard className="w-6 h-6 text-[#7C3AED]" />
              <h3 className="text-xl font-bold">Payment Details</h3>
            </div>

            <form onSubmit={handlePayment} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-white/50 text-sm font-bold uppercase mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="xxxx xxxx xxxx xxxx"
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-4 focus:border-[#7C3AED] outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/50 text-sm font-bold uppercase mb-2">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      required
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-4 focus:border-[#7C3AED] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 text-sm font-bold uppercase mb-2">CVV</label>
                    <input
                      type="password"
                      placeholder="xxx"
                      required
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-4 focus:border-[#7C3AED] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#00FFF5]/5 rounded-xl border border-[#00FFF5]/10">
                <ShieldCheck className="w-5 h-5 text-[#00FFF5]" />
                <span className="text-xs text-white/60">Your payment is secured with 256-bit SSL encryption.</span>
              </div>

              <button
                disabled={isProcessing}
                className="w-full py-5 bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] rounded-2xl font-black text-xl shadow-xl shadow-[#7C3AED]/30 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ₹${total}`
                )}
              </button>
            </form>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#1F1F3A] to-[#0F0F1A] rounded-3xl p-8 border border-white/10 sticky top-28">
            <h3 className="text-xl font-bold mb-6">Student Info</h3>
            <div className="space-y-4 mb-8">
              <div>
                <div className="text-white/40 text-xs font-bold uppercase">Name</div>
                <div className="font-bold">{user?.name}</div>
              </div>
              <div>
                <div className="text-white/40 text-xs font-bold uppercase">Email</div>
                <div className="font-bold">{user?.email}</div>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-sm text-white/50 italic">"Get ready for an unforgettable experience at {cart[0]?.college || "the event"}!"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
