import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ShoppingCart, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Events", path: "/events" },
    { name: "About", path: "/about" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F1A]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#F43F5E] rounded-lg flex items-center justify-center shadow-lg shadow-[#7C3AED]/20">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              CAMPUS CONNECT
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-white/70 hover:text-white transition-colors font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-6">
            {user && user.role === "student" && (
              <Link to="/cart" className="relative group">
                <ShoppingCart className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#F43F5E] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                    {cart.length}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to={`/dashboard/${user.role === "college_admin" ? "college" : user.role === "super_admin" ? "admin" : "student"}`}
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-white/70 hover:text-[#F43F5E] transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-6 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] rounded-full font-bold text-sm hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-[#7C3AED]/20"
              >
                Login / Register
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            {user && user.role === "student" && (
              <Link to="/cart" className="relative">
                <ShoppingCart className="w-6 h-6 text-white" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#F43F5E] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Link>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#1F1F3A] border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-medium text-white/70 hover:text-white"
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-white/10" />
              {user ? (
                <>
                  <Link
                    to={`/dashboard/${user.role === "college_admin" ? "college" : user.role === "super_admin" ? "admin" : "student"}`}
                    onClick={() => setIsOpen(false)}
                    className="block text-lg font-medium text-white/70"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block text-lg font-medium text-[#F43F5E]"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="block text-center py-3 bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] rounded-xl font-bold"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
