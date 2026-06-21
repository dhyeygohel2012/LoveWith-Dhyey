"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardData, StoryData } from "@/utils/storage";

interface TemplateProps {
  data: StoryData;
  mediaUrls: Record<string, string>;
  isInteractive?: boolean;
}

export default function BalloonPop({ data, mediaUrls, isInteractive = true }: TemplateProps) {
  const [poppedIds, setPoppedIds] = useState<string[]>([]);
  const [activeCard, setActiveCard] = useState<CardData | null>(null);
  const [balloons, setBalloons] = useState<Array<{ id: string; left: number; delay: number; speed: number; color: string; scale: number; card: CardData }>>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Colors mapping for balloon options
  const colors = [
    "#F8D7DA", // Blush Pink
    "#D6EAF8", // Baby Blue
    "#E8DAEF", // Lavender
    "#FFF8E7", // Cream
    "#FAD7A0", // Peach
    "#D5F5E3", // Mint Green
  ];

  // Initialize balloon layout
  useEffect(() => {
    const spawned = data.cards.map((card, idx) => {
      return {
        id: card.id,
        left: 10 + Math.random() * 70, // 10% to 80% width
        delay: idx * 1.8, // Staggered entry
        speed: 10 + Math.random() * 6, // float speed
        color: colors[idx % colors.length],
        scale: 0.9 + Math.random() * 0.3,
        card,
      };
    });
    setBalloons(spawned);
    setPoppedIds([]);
    setActiveCard(null);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [data.cards]);

  // Synthesis pop sound using Web Audio
  const playPopSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch (e) {
      console.warn("AudioContext blocked or unsupported", e);
    }
  };

  // Sparkle/Particle Burst
  const triggerBurst = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset canvas dimensions to screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
      decay: number;
      color: string;
    }> = [];

    const burstColors = ["#E98B92", "#7FB3D5", "#BB8FCE", "#F5B041", "#58D68D"];

    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 3 + Math.random() * 4,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.03,
        color: burstColors[Math.floor(Math.random() * burstColors.length)],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // Gravity
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          active = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      if (active) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animate();
  };

  const handlePop = (e: React.MouseEvent, id: string, card: CardData) => {
    if (!isInteractive) return;
    e.stopPropagation();

    // Play Pop sound
    playPopSound();

    // Trigger Particle burst
    triggerBurst(e.clientX, e.clientY);

    setPoppedIds((prev) => {
      const next = [...prev, id];
      // Auto open modal
      setActiveCard(card);
      return next;
    });
  };

  const isCompleted = poppedIds.length === data.cards.length && data.cards.length > 0;

  return (
    <div className="flex-grow w-full min-h-screen relative overflow-hidden flex flex-col justify-between p-6 select-none bg-gradient-to-b from-blue-50 to-[#FCFCFC]">
      {/* Sparkles Canvas overlay */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50 w-full h-full" />

      {/* Floating hearts/sparkles when completed */}
      {isCompleted && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: "110vh", x: `${Math.random() * 100}vw`, scale: 0.5 + Math.random() * 0.8, opacity: 0.2 }}
              animate={{
                y: "-10vh",
                x: [`${Math.random() * 100}vw`, `${Math.random() * 100}vw`],
                rotate: 360,
                opacity: [0.2, 0.8, 0],
              }}
              transition={{
                duration: 8 + Math.random() * 8,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear",
              }}
              className="absolute text-rose-300 text-3xl"
            >
              💖
            </motion.div>
          ))}
        </div>
      )}

      {/* Header Info */}
      <div className="text-center mt-6 z-20">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-5xl font-heading font-extrabold text-[#4A2B2D] tracking-tight mb-2"
        >
          {data.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-sm font-body text-gray-600 max-w-md mx-auto"
        >
          {data.subtitle}
        </motion.p>

        {/* Counter */}
        <div className="mt-4 px-4 py-2 glass rounded-full inline-block text-xs font-semibold text-[#4A2B2D] shadow-sm">
          🎈 Popped: <span className="font-bold text-[#E98B92]">{poppedIds.length}</span> / {data.cards.length}
        </div>
      </div>

      {/* Balloon Floating Arena */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <AnimatePresence>
          {balloons.map((balloon) => {
            const isPopped = poppedIds.includes(balloon.id);
            if (isPopped) return null;

            return (
              <motion.div
                key={balloon.id}
                initial={{ y: "110vh", opacity: 0 }}
                animate={{ y: "-20vh", opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  y: {
                    duration: balloon.speed,
                    repeat: Infinity,
                    delay: balloon.delay,
                    ease: "linear",
                  },
                  opacity: { duration: 0.5 },
                }}
                style={{
                  left: `${balloon.left}%`,
                  width: `${120 * balloon.scale}px`,
                  height: `${150 * balloon.scale}px`,
                }}
                className="absolute bottom-0 cursor-pointer pointer-events-auto z-10 flex flex-col items-center"
                onClick={(e) => handlePop(e, balloon.id, balloon.card)}
              >
                {/* Balloon Body */}
                <div
                  className="relative w-full h-full rounded-t-full rounded-b-[70%] flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-105 border-2 border-white/30"
                  style={{ backgroundColor: balloon.color }}
                >
                  {/* Glossy sheen */}
                  <div className="absolute top-3 left-4 w-6 h-10 bg-white/40 rounded-full rotate-[-30deg]" />

                  {/* Bubble custom text */}
                  <span className="px-2 text-center text-xs font-bold text-gray-800 drop-shadow-sm font-body select-none">
                    {balloon.card.bubbleText || "Pop Me! 🎈"}
                  </span>

                  {/* Balloon Tie */}
                  <div
                    className="absolute bottom-[-6px] left-1/2 -translate-x-[50%] border-t-[8px] border-x-[6px] border-x-transparent"
                    style={{ borderTopColor: balloon.color }}
                  />

                  {/* Thread String */}
                  <svg className="absolute bottom-[-66px] left-1/2 -translate-x-[50%] w-6 h-16 pointer-events-none" viewBox="0 0 20 60">
                    <path d="M 10,0 Q 5,15 15,30 T 10,60" fill="none" stroke="#A9B2C3" strokeWidth="1.5" />
                  </svg>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Climax Surprise Card */}
      {isCompleted && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 60, delay: 0.5 }}
          className="max-w-md w-full glass-card rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center mx-auto my-auto z-30"
        >
          <div className="text-6xl mb-4 animate-bounce">💝</div>
          <h2 className="text-3xl font-heading font-extrabold text-[#4A2B2D] mb-4">Happy Father's Day!</h2>
          <p className="font-body text-sm text-gray-700 leading-relaxed mb-6">
            Thank you for being my anchor, my teacher, and my best friend. Your support means the world to me. I love you, Dad!
          </p>

          <div className="border-t border-rose-200/50 pt-4 w-full">
            <p className="font-handwriting text-3xl text-[#E98B92]">With love always,</p>
            <p className="font-heading text-lg font-bold text-[#4A2B2D] mt-1">{data.senderName}</p>
          </div>
        </motion.div>
      )}

      {/* Memory Content Pop Modal */}
      <AnimatePresence>
        {activeCard && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setActiveCard(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="max-w-md w-full glass-card rounded-3xl p-6 shadow-2xl relative flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveCard(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold hover:scale-110 transition-transform"
              >
                ✕
              </button>

              <h3 className="text-2xl font-heading font-extrabold text-[#4A2B2D] mb-4 text-center">
                {activeCard.title || "A Precious Memory"}
              </h3>

              {/* Media Content */}
              {activeCard.type === "photo" && (
                <div className="w-full rounded-2xl overflow-hidden shadow-inner max-h-[300px] mb-4 bg-gray-100 flex items-center justify-center">
                  <img
                    src={mediaUrls[activeCard.content] || activeCard.content}
                    className="w-full h-full object-cover"
                    alt="Memory photo"
                  />
                </div>
              )}

              {activeCard.type === "video" && (
                <div className="w-full rounded-2xl overflow-hidden shadow-inner max-h-[300px] mb-4 bg-black flex items-center justify-center">
                  <video
                    src={mediaUrls[activeCard.content] || activeCard.content}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Message Content */}
              {activeCard.type === "text" ? (
                <p className="text-center font-body text-gray-700 leading-relaxed text-md italic my-4 px-2">
                  "{activeCard.content}"
                </p>
              ) : (
                activeCard.caption && (
                  <p className="text-center font-body text-gray-600 text-sm leading-relaxed italic px-2">
                    "{activeCard.caption}"
                  </p>
                )
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Signature */}
      <div className="z-20 text-center font-handwriting text-2xl opacity-70 text-[#4A2B2D] pb-2">
        To: {data.receiverName}
      </div>
    </div>
  );
}
