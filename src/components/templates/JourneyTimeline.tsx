"use client";

import React from "react";
import { motion } from "framer-motion";
import { StoryData } from "@/utils/storage";

interface TemplateProps {
  data: StoryData;
  mediaUrls: Record<string, string>;
  isInteractive?: boolean;
}

export default function JourneyTimeline({ data, mediaUrls, isInteractive = true }: TemplateProps) {
  return (
    <div className="flex-grow w-full min-h-screen py-16 px-6 flex flex-col items-center bg-gradient-to-b from-[#E8DAEF]/20 to-[#FCFCFC]">
      
      {/* Intro Header */}
      <div className="text-center mb-16 max-w-md">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.8, y: 0 }}
          className="text-xs tracking-widest text-[#BB8FCE] font-bold uppercase mb-2 block"
        >
          Our Lifetime Journey
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-heading font-extrabold text-[#3A2244] mb-4"
        >
          {data.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-sm font-body text-gray-500"
        >
          {data.subtitle}
        </motion.p>
      </div>

      {/* Vertical Timeline container */}
      <div className="relative w-full max-w-xl flex flex-col gap-12">
        
        {/* Timeline Connecting Vertical Line */}
        <div className="absolute left-4 md:left-1/2 top-2 bottom-2 w-[2px] bg-dashed bg-gradient-to-b from-[#BB8FCE] to-[#E8DAEF] opacity-60 z-0" />

        {data.cards.map((card, idx) => {
          const isLeft = idx % 2 === 0;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="relative flex flex-col md:flex-row items-start md:items-center w-full"
            >
              {/* Central Timeline node bullet */}
              <div className="absolute left-4 md:left-1/2 -translate-x-[7px] w-4 h-4 rounded-full bg-[#BB8FCE] border-4 border-white shadow z-10" />

              {/* Left/Right Aligned Content Card */}
              <div className={`w-full pl-12 md:pl-0 md:w-1/2 flex ${isLeft ? "md:justify-end md:pr-12" : "md:justify-start md:pl-12 md:order-2"}`}>
                <div className="glass-card p-5 rounded-3xl shadow-lg w-full max-w-sm hover:scale-[1.02] transition-transform duration-300">
                  
                  {/* Card Header info */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-[#BB8FCE] bg-[#E8DAEF]/40 px-3 py-1 rounded-full">
                      {card.date || `Memory #${idx + 1}`}
                    </span>
                    {card.title && (
                      <span className="font-heading text-sm text-[#3A2244] font-bold">
                        {card.title}
                      </span>
                    )}
                  </div>

                  {/* Photo content */}
                  {card.type === "photo" && (
                    <>
                      <div className="w-full aspect-video rounded-xl overflow-hidden mb-3 bg-gray-100 shadow-inner">
                        <img
                          src={mediaUrls[card.content] || card.content}
                          className="w-full h-full object-cover"
                          alt="Timeline snap"
                        />
                      </div>
                      {card.caption && (
                        <p className="font-body text-xs text-gray-500 italic leading-relaxed">
                          "{card.caption}"
                        </p>
                      )}
                    </>
                  )}

                  {/* Video content */}
                  {card.type === "video" && (
                    <>
                      <div className="w-full aspect-video rounded-xl overflow-hidden bg-black mb-3 shadow-inner">
                        <video
                          src={mediaUrls[card.content] || card.content}
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {card.caption && (
                        <p className="font-body text-xs text-gray-500 italic leading-relaxed">
                          "{card.caption}"
                        </p>
                      )}
                    </>
                  )}

                  {/* Text content */}
                  {card.type === "text" && (
                    <p className="font-body text-sm text-gray-700 leading-relaxed italic">
                      "{card.content}"
                    </p>
                  )}

                </div>
              </div>

              {/* Desktop Spacer */}
              <div className="hidden md:block w-1/2" />
            </motion.div>
          );
        })}

        {/* Final Outro Node Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative flex flex-col items-center w-full mt-6"
        >
          <div className="w-12 h-12 rounded-full bg-[#BB8FCE] flex items-center justify-center text-white text-xl shadow-lg z-10 mb-4 animate-bounce">
            ❤️
          </div>
          
          <div className="glass-card p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-2 border-purple-100/30">
            <h3 className="font-heading text-3xl font-extrabold text-[#3A2244] mb-3">Happy Father's Day!</h3>
            <p className="font-body text-sm text-gray-600 leading-relaxed mb-6">
              Thank you for guiding me, inspiring me, and walking with me at every stage of my life. You are the best Dad in the world.
            </p>
            
            <div className="border-t border-purple-200/20 pt-4">
              <p className="font-handwriting text-3xl text-[#BB8FCE]">With love and gratitude,</p>
              <p className="font-heading text-lg font-bold text-[#3A2244] mt-1">{data.senderName}</p>
            </div>
          </div>
        </motion.div>

      </div>

      <div className="mt-20 font-handwriting text-2xl opacity-60 text-[#3A2244]">
        Dedicated to: {data.receiverName}
      </div>
    </div>
  );
}
