import { motion } from "framer-motion";
import { School, Users, Zap, ShieldCheck, Globe, Award } from "lucide-react";

export default function About() {
  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-[#7C3AED]/10 to-transparent blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black mb-8"
          >
            Connecting the <br />
            <span className="text-[#00FFF5]">Campus Ecosystem</span>
          </motion.h1>
          <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
            Campus Connect is a centralized platform where colleges can promote events and students can discover and register for them easily. We're building the infrastructure for the next generation of campus life.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-[#1F1F3A]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8">Our Mission</h2>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                We believe that some of the most important learning happens outside the classroom. Whether it's a 48-hour hackathon, a cultural dance competition, or a technical workshop, these experiences shape who we are.
              </p>
              <div className="space-y-6">
                {[
                  { icon: <Zap className="text-[#7C3AED]" />, text: "Accelerating student growth through participation" },
                  { icon: <Globe className="text-[#00FFF5]" />, text: "Building a borderless campus community" },
                  { icon: <ShieldCheck className="text-[#F43F5E]" />, text: "Ensuring trust and transparency in event management" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="font-bold text-white/80">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[3rem] overflow-hidden border border-white/10">
                <img
                  src="https://picsum.photos/seed/campus/800/800"
                  alt="Campus Life"
                  className="w-full h-full object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#7C3AED] rounded-3xl -z-10 blur-3xl opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="p-12 rounded-[3rem] bg-gradient-to-br from-[#7C3AED]/20 to-transparent border border-[#7C3AED]/20">
              <School className="w-12 h-12 text-[#7C3AED] mb-8" />
              <h3 className="text-3xl font-bold mb-6">For Colleges</h3>
              <ul className="space-y-4 text-white/60">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                  Promote events to a global student audience
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                  Increase participation and visibility
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                  Manage registrations and payments seamlessly
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                  Real-time analytics and reporting
                </li>
              </ul>
            </div>

            <div className="p-12 rounded-[3rem] bg-gradient-to-br from-[#00FFF5]/20 to-transparent border border-[#00FFF5]/20">
              <Users className="w-12 h-12 text-[#00FFF5] mb-8" />
              <h3 className="text-3xl font-bold mb-6">For Students</h3>
              <ul className="space-y-4 text-white/60">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00FFF5]" />
                  Discover events across all major colleges
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00FFF5]" />
                  Participate in fests, hackathons, and more
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00FFF5]" />
                  Stay updated with personalized notifications
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00FFF5]" />
                  Build a portfolio of participation certificates
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Colleges */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white/40 uppercase tracking-[0.3em] mb-16">Trusted by Leading Institutions</h2>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale">
            {["IIT Bombay", "NIT Trichy", "BITS Pilani", "SRM University", "VIT Vellore"].map((college, idx) => (
              <div key={idx} className="text-2xl font-black italic">{college}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
