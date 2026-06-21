"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { decompressStory, StoryData, DEFAULT_STORY } from "@/utils/storage";
import TemplateRenderer from "@/components/TemplateRenderer";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Mail } from "lucide-react";

function StoryViewer() {
  const searchParams = useSearchParams();
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const voiceNoteRef = useRef<HTMLAudioElement | null>(null);

  // Load from URL hash or query params
  useEffect(() => {
    if (typeof window === "undefined") return;

    let compressed = window.location.hash.replace("#", "");
    if (!compressed) {
      compressed = searchParams.get("data") || "";
    }

    if (compressed) {
      const data = decompressStory(compressed);
      if (data) {
        setStoryData(data);
      } else {
        setStoryData(DEFAULT_STORY);
      }
    } else {
      setStoryData(DEFAULT_STORY);
    }
    setLoading(false);
  }, [searchParams]);

  // Audio Playback trigger
  const handleUnlock = () => {
    setUnlocked(true);

    // Audio playback logic
    setTimeout(() => {
      if (bgMusicRef.current && storyData?.musicUrl) {
        bgMusicRef.current.volume = 0.5;
        bgMusicRef.current.play().catch((err) => {
          console.warn("Audio play blocked by browser", err);
        });
      }

      if (voiceNoteRef.current && storyData?.voiceNoteUrl) {
        // Drop bg music volume for voice note
        if (bgMusicRef.current) bgMusicRef.current.volume = 0.15;
        
        voiceNoteRef.current.play()
          .then(() => {
            voiceNoteRef.current!.onended = () => {
              if (bgMusicRef.current) bgMusicRef.current.volume = 0.5;
            };
          })
          .catch((err) => {
            console.warn("Voice note play blocked", err);
          });
      }
    }, 400);
  };

  const toggleMute = () => {
    if (bgMusicRef.current) {
      bgMusicRef.current.muted = !isMuted;
    }
    if (voiceNoteRef.current) {
      voiceNoteRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5F2]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-400 rounded-full animate-spin mb-4" />
          <p className="font-body text-gray-500 text-sm">Unpacking special memory...</p>
        </div>
      </div>
    );
  }

  if (!storyData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5F2] p-6 text-center">
        <div className="glass-card max-w-md p-8 rounded-3xl">
          <h1 className="text-3xl font-heading font-extrabold text-[#4A2B2D] mb-4">No Story Found</h1>
          <p className="font-body text-gray-600 mb-6">The link might be broken or incomplete. Please check the URL and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col relative bg-themeBg">
      
      {/* Audio elements */}
      {storyData.musicUrl && (
        <audio ref={bgMusicRef} loop src={storyData.musicUrl} />
      )}
      {storyData.voiceNoteUrl && (
        <audio ref={voiceNoteRef} src={storyData.voiceNoteUrl} />
      )}

      {/* Floating Audio mute control */}
      {unlocked && (storyData.musicUrl || storyData.voiceNoteUrl) && (
        <div className="fixed top-6 right-6 z-50">
          <button
            onClick={toggleMute}
            className="p-3.5 glass rounded-full shadow-lg hover:scale-105 transition-all text-[#4A2B2D]"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      )}

      {/* Interactive Unlocking Gate */}
      <AnimatePresence>
        {!unlocked && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-[#FFF8E7]/95 z-[999] flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 20 }}
              className="max-w-md w-full glass-card p-8 md:p-10 rounded-3xl shadow-2xl flex flex-col items-center border border-white/40"
            >
              <div className="p-6 bg-rose-50 rounded-full mb-6 text-rose-400">
                <Mail size={48} className="animate-pulse" />
              </div>
              
              <h1 className="text-3xl font-heading font-bold text-[#4A2B2D] mb-3">
                A Message for {storyData.receiverName} ❤️
              </h1>
              
              <p className="text-sm font-body text-gray-500 mb-8 leading-relaxed">
                You have received a beautiful interactive memory story created by <span className="font-semibold text-rose-400">{storyData.senderName}</span>.
              </p>

              <button
                onClick={handleUnlock}
                className="w-full py-4 bg-gradient-to-r from-[#E98B92] to-[#BB8FCE] text-white rounded-full font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                Open Memory Story ✨
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Template renderer */}
      {unlocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-grow w-full flex flex-col"
        >
          <TemplateRenderer data={storyData} mediaUrls={{}} />
        </motion.div>
      )}
    </div>
  );
}

export default function StoryViewerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5F2]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-400 rounded-full animate-spin mb-4" />
          <p className="font-body text-gray-500 text-sm">Loading memory story...</p>
        </div>
      </div>
    }>
      <StoryViewer />
    </Suspense>
  );
}
