import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Zap, Trophy, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20">
        {/* Background Particles/Glow */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7C3AED]/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F43F5E]/20 blur-[120px] rounded-full animate-pulse delay-700" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#00FFF5] text-sm font-bold mb-6 tracking-wider uppercase">
              The Future of Campus Life
            </span>
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              CAMPUS <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7C3AED] via-[#F43F5E] to-[#00FFF5] animate-gradient-x">
                CONNECT
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-12 leading-relaxed">
              Discover, Participate, and Experience Campus Events Across Colleges. From Hackathons to Cultural Fests, your next big adventure starts here.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/events"
                className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-2xl shadow-[#7C3AED]/40 flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Explore Events
              </Link>
              <Link
                to="/auth"
                className="w-full sm:w-auto px-10 py-4 bg-white/5 border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                Register as Student
              </Link>
            </div>
          </motion.div>

          {/* Floating Icons */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -left-10 md:left-20 opacity-20"
          >
            <Trophy className="w-20 h-20 text-[#00FFF5]" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-0 -right-10 md:right-20 opacity-20"
          >
            <Users className="w-24 h-24 text-[#7C3AED]" />
          </motion.div>
        </div>
      </section>

      {/* Featured Stats */}
      <section className="py-20 bg-[#1F1F3A]/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Colleges", value: "500+" },
              { label: "Events", value: "2,500+" },
              { label: "Students", value: "50k+" },
              { label: "Prizes", value: "₹1Cr+" },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl md:text-5xl font-black text-white mb-2">{stat.value}</div>
                <div className="text-white/50 font-medium uppercase tracking-widest text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Campus Connect */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Campus Connect?</h2>
            <p className="text-white/60 max-w-2xl mx-auto">We bridge the gap between talent and opportunity across campuses.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Centralized Discovery",
                desc: "Find every event from fests to workshops in one place. No more missing out.",
                icon: <Sparkles className="w-8 h-8 text-[#00FFF5]" />,
                color: "from-[#00FFF5]/20",
              },
              {
                title: "Seamless Registration",
                desc: "Register for multiple events across different colleges with a single checkout.",
                icon: <Zap className="w-8 h-8 text-[#7C3AED]" />,
                color: "from-[#7C3AED]/20",
              },
              {
                title: "Verified Colleges",
                desc: "Every college on our platform is verified to ensure authentic and quality events.",
                icon: <Trophy className="w-8 h-8 text-[#F43F5E]" />,
                color: "from-[#F43F5E]/20",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className={`p-8 rounded-3xl bg-gradient-to-b ${feature.color} to-transparent border border-white/10 hover:border-white/20 transition-all`}
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-black/10" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black mb-8">Ready to Level Up Your Campus Experience?</h2>
              <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">Join thousands of students and hundreds of colleges today.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/auth" className="px-10 py-4 bg-white text-[#7C3AED] rounded-full font-bold text-lg hover:scale-105 transition-transform">
                  Get Started Now
                </Link>
                <Link to="/about" className="px-10 py-4 bg-transparent border-2 border-white rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
