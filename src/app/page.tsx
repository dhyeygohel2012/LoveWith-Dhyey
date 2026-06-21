"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Star, Sparkles, Heart, Smartphone, Download, Share2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex-grow w-full min-h-screen relative flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#FFF8E7] via-[#F8D7DA]/20 to-[#E8DAEF]/30">
      
      {/* Floating particles background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              y: "110vh",
              x: `${Math.random() * 100}vw`,
              scale: 0.4 + Math.random() * 0.6,
              opacity: 0.1,
            }}
            animate={{
              y: "-10vh",
              x: [`${Math.random() * 100}vw`, `${Math.random() * 100}vw`],
              opacity: [0.1, 0.4, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
            className="absolute text-rose-300"
          >
            <Heart fill="currentColor" size={16} />
          </motion.div>
        ))}
      </div>

      {/* Brand Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-float">✉️</span>
          <span className="font-heading font-extrabold text-xl text-[#4A2B2D]">LoveWith Dhyey</span>
        </div>
        <div className="flex gap-4">
          <Link
            href="/builder"
            className="px-5 py-2.5 bg-[#4A2B2D] text-white rounded-full text-xs font-bold shadow hover:scale-105 transition-all"
          >
            Create Your Story
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center items-center text-center px-6 py-12 md:py-24 z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 50, duration: 1 }}
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <div className="px-4 py-1.5 bg-rose-50 border border-rose-100 rounded-full text-[10px] font-bold text-[#E98B92] tracking-wider uppercase mb-6 flex items-center gap-1">
            <Sparkles size={10} className="animate-spin" /> 100% Free & Serverless
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-extrabold text-[#4A2B2D] tracking-tight leading-tight max-w-3xl mb-6">
            Create unforgettable memories with beautiful interactive stories
          </h1>

          <p className="text-sm md:text-md font-body text-gray-600 max-w-xl mb-10 leading-relaxed font-light">
            Design personal animated greeting websites for your loved ones in seconds. No account required. Download as a standalone offline ZIP or share via link.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link
              href="/builder"
              className="px-8 py-4 bg-[#4A2B2D] text-white rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-all hover:shadow-xl"
            >
              Start Creating Now ✨
            </Link>
            <Link
              href="/story"
              className="px-8 py-4 bg-white/70 backdrop-blur border border-white/30 text-[#4A2B2D] rounded-full text-sm font-bold shadow hover:scale-105 transition-all hover:bg-white/90"
            >
              View Sample Demo
            </Link>
          </div>
        </motion.div>

        {/* Template Showcase Grid */}
        <section className="w-full mt-8 flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#4A2B2D] mb-12">
            Explore 4 Beautiful Story Templates
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
            {[
              {
                title: "Balloon Pop Memories",
                desc: "Drifting pastel balloons that pop to reveal custom photographs, letters, or videos. Ends with a celebration climax.",
                emoji: "🎈",
                bg: "bg-[#F8D7DA]/40 border-[#F8D7DA]",
              },
              {
                title: "Cinematic Memory Story",
                desc: "A full-bleed screen experience. Smooth scroll-triggered fade-ins and dynamic zoom Ken Burns frame transitions.",
                emoji: "🎥",
                bg: "bg-[#D6EAF8]/40 border-[#D6EAF8]",
              },
              {
                title: "Interactive Scrapbook",
                desc: "A virtual 3D scrapbook album decorated with pastel tapes, polaroid templates, heart pins, and handwriting note stickers.",
                emoji: "📖",
                bg: "bg-[#FFF8E7]/50 border-[#FAD7A0]",
              },
              {
                title: "Journey Timeline",
                desc: "An elegant vertical milestone timeline path tracking your favorite moments from childhood days to present year.",
                emoji: "🌟",
                bg: "bg-[#E8DAEF]/40 border-[#E8DAEF]",
              },
            ].map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className={`p-6 rounded-3xl border flex gap-4 text-left glass shadow-sm hover:scale-[1.02] transition-transform duration-300 ${t.bg}`}
              >
                <div className="text-4xl">{t.emoji}</div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#4A2B2D] mb-2">{t.title}</h3>
                  <p className="text-xs font-body text-gray-500 leading-relaxed">{t.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="w-full mt-24 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 text-center">
              <div className="p-4 bg-rose-50 rounded-full text-rose-400 mb-4">
                <Smartphone size={24} />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#4A2B2D] mb-2">Mobile Responsive</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-body">Every template runs seamlessly on phones, tablets, and desktops alike at 60 FPS.</p>
            </div>
            
            <div className="flex flex-col items-center p-6 text-center">
              <div className="p-4 bg-blue-50 rounded-full text-blue-400 mb-4">
                <Download size={24} />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#4A2B2D] mb-2">Offline ZIP Export</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-body">Download a fully self-contained HTML/CSS/JS folder containing all your custom assets.</p>
            </div>

            <div className="flex flex-col items-center p-6 text-center">
              <div className="p-4 bg-purple-50 rounded-full text-purple-400 mb-4">
                <Share2 size={24} />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#4A2B2D] mb-2">Instant URL Sharing</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-body">Compress your story config directly into the URL fragment. Scan QR codes or copy links immediately.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 text-center text-[10px] text-gray-400 border-t border-white/10 z-10">
        <p className="mb-2">LoveWith Dhyey © 2026. Made with love for unforgettable moments. Completely free.</p>
        <div className="flex justify-center gap-3 font-semibold uppercase tracking-wider text-rose-400/80">
          <span>No Ads</span> • <span>No Paywalls</span> • <span>No Signups</span>
        </div>
      </footer>
    </div>
  );
}
