"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StoryData } from "@/utils/storage";

interface TemplateProps {
  data: StoryData;
  mediaUrls: Record<string, string>;
  isInteractive?: boolean;
}

export default function Scrapbook({ data, mediaUrls, isInteractive = true }: TemplateProps) {
  const [pageIndex, setPageIndex] = useState(0);

  const nextPage = () => {
    if (pageIndex < data.cards.length - 1) {
      setPageIndex((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (pageIndex > 0) {
      setPageIndex((prev) => prev - 1);
    }
  };

  const activeCard = data.cards[pageIndex];

  return (
    <div className="flex-grow w-full min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#FFFDF5] to-[#FAD7A0]/20">
      
      {/* Album Header */}
      <div className="text-center mb-8 max-w-md">
        <h1 className="text-4xl font-heading font-bold text-[#4D3819] mb-2">{data.title}</h1>
        <p className="text-xs font-body text-gray-500 tracking-wide uppercase">Interactive Scrapbook — Page {pageIndex + 1} of {data.cards.length}</p>
      </div>

      {/* Book Mockup container */}
      <div className="relative w-full max-w-md aspect-[4/5] md:aspect-[5/6] rounded-3xl p-6 shadow-2xl flex flex-col justify-between scrapbook-paper border-2 border-[#FAD7A0] overflow-hidden">
        
        {/* Binder Rings */}
        <div className="absolute left-6 top-0 bottom-0 w-2 flex flex-col justify-around pointer-events-none z-30">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-7 h-3.5 bg-gradient-to-r from-gray-400/30 to-gray-500/50 rounded-full border border-gray-400/50 -translate-x-2.5 shadow-sm"
            />
          ))}
        </div>

        {/* Content Box */}
        <div className="flex-grow w-full flex flex-col justify-between pl-6 relative">
          
          {/* Header page details */}
          <div className="flex justify-between items-center mb-4">
            <span className="font-handwriting text-2xl text-[#F5B041] select-none">
              My Memories
            </span>
            <span className="text-xs font-handwriting text-gray-400">
              For: {data.receiverName}
            </span>
          </div>

          {/* Active page renderer with AnimatePresence */}
          <div className="flex-grow flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {activeCard && (
                <motion.div
                  key={activeCard.id}
                  initial={{ opacity: 0, rotate: -3, scale: 0.95 }}
                  animate={{ opacity: 1, rotate: activeCard.type === "photo" ? 2 : activeCard.type === "video" ? -2 : 1, scale: 1 }}
                  exit={{ opacity: 0, rotate: 3, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="w-full flex flex-col items-center justify-center"
                >
                  {/* Polaroid Frame for Photos */}
                  {activeCard.type === "photo" && (
                    <div className="bg-white p-3.5 shadow-xl rounded-md max-w-[280px] w-full border border-gray-200 relative group">
                      
                      {/* Decorative Tape sticker */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-6 bg-[#F8D7DA]/60 backdrop-blur-[1px] rotate-[-5deg] border border-white/20 shadow-sm" />
                      
                      <div className="w-full aspect-square overflow-hidden bg-gray-100 mb-3 relative rounded-sm">
                        <img
                          src={mediaUrls[activeCard.content] || activeCard.content}
                          className="w-full h-full object-cover"
                          alt="Scrapbook snap"
                        />
                      </div>
                      <div className="font-handwriting text-xl text-center text-gray-700 font-bold select-none leading-tight py-1">
                        {activeCard.caption || "Lovely day!"}
                      </div>
                    </div>
                  )}

                  {/* Polaroid Frame for Videos */}
                  {activeCard.type === "video" && (
                    <div className="bg-white p-3.5 shadow-xl rounded-md max-w-[280px] w-full border border-gray-200 relative group">
                      {/* Decorative Tape sticker */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-6 bg-[#D6EAF8]/60 backdrop-blur-[1px] rotate-[5deg] border border-white/20 shadow-sm" />
                      
                      <div className="w-full aspect-square overflow-hidden bg-black mb-3 relative rounded-sm flex items-center justify-center">
                        <video
                          src={mediaUrls[activeCard.content] || activeCard.content}
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="font-handwriting text-xl text-center text-gray-700 font-bold select-none leading-tight py-1">
                        {activeCard.caption || "A video memory!"}
                      </div>
                    </div>
                  )}

                  {/* Glass Card for pure Text message */}
                  {activeCard.type === "text" && (
                    <div className="text-center p-6 glass rounded-3xl max-w-xs w-full border border-[#FAD7A0] relative shadow-lg">
                      {/* Heart Pin sticker */}
                      <div className="absolute -top-3 left-4 text-2xl select-none animate-bounce">📌</div>
                      <h3 className="font-handwriting text-2xl font-bold mb-4 text-[#F5B041]">
                        {activeCard.title || "A Note For You"}
                      </h3>
                      <p className="font-handwriting text-2xl text-gray-700 leading-relaxed italic">
                        "{activeCard.content}"
                      </p>
                    </div>
                  )}

                  {/* Subtitle / Title caption */}
                  {activeCard.type !== "text" && activeCard.title && (
                    <motion.h3
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.9 }}
                      className="font-handwriting text-2xl font-bold mt-4 text-[#4D3819]"
                    >
                      {activeCard.title}
                    </motion.h3>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Book Navigation Footer */}
          <div className="mt-6 flex justify-between w-full z-20">
            <button
              onClick={prevPage}
              disabled={pageIndex === 0}
              className={`px-4 py-2 glass rounded-full text-xs font-semibold hover:bg-white/80 transition-all select-none ${pageIndex === 0 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
            >
              ← Prev
            </button>
            
            <button
              onClick={nextPage}
              disabled={pageIndex === data.cards.length - 1}
              className={`px-4 py-2 bg-[#F5B041] text-white rounded-full text-xs font-semibold shadow hover:scale-105 transition-all select-none ${pageIndex === data.cards.length - 1 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="mt-8 font-handwriting text-3xl text-[#4D3819] opacity-80 select-none">
        Love, {data.senderName}
      </div>
    </div>
  );
}
