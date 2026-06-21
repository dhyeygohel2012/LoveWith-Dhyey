"use client";

import React from "react";
import { motion } from "framer-motion";
import { StoryData } from "@/utils/storage";

interface TemplateProps {
  data: StoryData;
  mediaUrls: Record<string, string>;
  isInteractive?: boolean;
}

export default function CinematicMemory({ data, mediaUrls, isInteractive = true }: TemplateProps) {
  return (
    <div className="flex-grow w-full min-h-screen py-16 px-6 flex flex-col items-center bg-gradient-to-b from-[#FFF8E7] to-[#F8D7DA]/30">
      
      {/* Intro Hero Section */}
      <div className="max-w-3xl w-full flex flex-col items-center text-center mb-24">
        <motion.span
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 0.6, letterSpacing: "0.2em" }}
          transition={{ duration: 1.5 }}
          className="text-xs font-semibold text-rose-400 uppercase mb-3 block"
        >
          A Memory Film
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-heading font-extrabold text-[#4A2B2D] tracking-tight leading-tight mb-6"
        >
          {data.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="text-lg md:text-xl font-body text-gray-600 italic font-light max-w-xl"
        >
          "{data.subtitle}"
        </motion.p>
      </div>

      {/* Chapters Content */}
      <div className="max-w-2xl w-full flex flex-col gap-24 md:gap-32">
        {data.cards.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col items-center glass-card rounded-3xl p-6 md:p-10 shadow-2xl relative"
          >
            <span className="text-xs text-rose-400/80 font-bold mb-4 font-body tracking-wider">
              CHAPTER {idx + 1} — {card.title || "Memory"}
            </span>

            {/* Photo Card */}
            {card.type === "photo" && (
              <>
                <div className="w-full rounded-2xl overflow-hidden shadow-inner aspect-video mb-6 relative bg-gray-100 group">
                  <motion.img
                    initial={{ scale: 1 }}
                    whileInView={{ scale: 1.05 }}
                    viewport={{ once: true }}
                    transition={{ duration: 10, ease: "easeOut" }}
                    src={mediaUrls[card.content] || card.content}
                    className="w-full h-full object-cover"
                    alt={card.title || "Memory photo"}
                  />
                </div>
                {card.caption && (
                  <p className="font-body text-gray-700 text-center leading-relaxed italic text-md px-2">
                    "{card.caption}"
                  </p>
                )}
              </>
            )}

            {/* Video Card */}
            {card.type === "video" && (
              <>
                <div className="w-full rounded-2xl overflow-hidden shadow-inner aspect-video mb-6 bg-black flex items-center justify-center">
                  <video
                    src={mediaUrls[card.content] || card.content}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
                {card.caption && (
                  <p className="font-body text-gray-700 text-center leading-relaxed italic text-md px-2">
                    "{card.caption}"
                  </p>
                )}
              </>
            )}

            {/* Text Card */}
            {card.type === "text" && (
              <div className="w-full py-6 text-center">
                <p className="text-2xl md:text-3xl font-heading text-[#4A2B2D] font-light leading-relaxed italic px-4">
                  "{card.content}"
                </p>
              </div>
            )}
          </motion.div>
        ))}

        {/* Cinematic Final Outro */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex flex-col items-center glass-card rounded-3xl p-10 md:p-14 shadow-2xl text-center border-t-2 border-rose-200/40"
        >
          <div className="text-6xl mb-6 animate-pulse">💝</div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-[#4A2B2D] mb-6">Forever and Always</h2>
          
          <p className="text-md font-body text-gray-600 max-w-md mx-auto mb-10 leading-relaxed">
            Every memory shared, every life lesson taught, every laugh enjoyed, has shaped who I am. Thank you for always being there.
          </p>

          <div className="border-t border-rose-200/30 pt-6 w-full max-w-xs">
            <p className="font-handwriting text-3xl text-[#E98B92]">With infinite love,</p>
            <p className="font-heading text-xl font-bold mt-1 text-[#4A2B2D]">{data.senderName}</p>
          </div>
        </motion.div>
      </div>

      <div className="mt-20 font-handwriting text-2xl opacity-60 text-[#4A2B2D]">
        Dedicated to: {data.receiverName}
      </div>
    </div>
  );
}
