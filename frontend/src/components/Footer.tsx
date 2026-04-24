import { Link } from "react-router-dom";
import { Github, Twitter, Instagram, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0F0F1A] border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-[#7C3AED] to-[#F43F5E] rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold">CAMPUS CONNECT</span>
            </Link>
            <p className="text-white/60 leading-relaxed">
              The ultimate platform for college events. Discover fests, hackathons, and workshops across the country.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/events" className="text-white/60 hover:text-white transition-colors">Explore Events</Link></li>
              <li><Link to="/about" className="text-white/60 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/auth" className="text-white/60 hover:text-white transition-colors">Register College</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Connect With Us</h4>
            <div className="flex gap-4 mb-6">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <Twitter className="w-5 h-5 text-white/70" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <Instagram className="w-5 h-5 text-white/70" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <Github className="w-5 h-5 text-white/70" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Mail className="w-5 h-5" />
              <span>support@campusconnect.edu</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © 2026 Campus Connect. All rights reserved.
          </p>
          <div className="flex gap-8">
            <span className="text-white/40 text-sm">Made with ❤️ for Students</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
