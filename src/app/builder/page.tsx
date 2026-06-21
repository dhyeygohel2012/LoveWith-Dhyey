"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  StoryData,
  CardData,
  DEFAULT_STORY,
  saveDraft,
  loadDraft,
  storeFile,
  getFileAsObjectUrl,
  compressStory,
} from "@/utils/storage";
import { exportToZip } from "@/utils/zipExporter";
import TemplateRenderer from "@/components/TemplateRenderer";
import {
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Save,
  Download,
  Share2,
  Music,
  Palette,
  Type,
  Tv,
  Smartphone,
  X,
  Check,
  Eye,
  Settings,
  Copy,
  Undo,
} from "lucide-react";

export default function BuilderPage() {
  const router = useRouter();

  // App States
  const [story, setStory] = useState<StoryData>(DEFAULT_STORY);
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">("mobile");
  
  // Modal / Loader States
  const [isExporting, setIsExporting] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load draft on mount
  useEffect(() => {
    async function init() {
      const draft = await loadDraft();
      if (draft) {
        setStory(draft);
        
        // Regenerate Object URLs for stored database files
        const urls: Record<string, string> = {};
        if (draft.musicUrl.startsWith("db://")) {
          urls[draft.musicUrl] = await getFileAsObjectUrl(draft.musicUrl);
        }
        if (draft.voiceNoteUrl.startsWith("db://")) {
          urls[draft.voiceNoteUrl] = await getFileAsObjectUrl(draft.voiceNoteUrl);
        }
        for (const card of draft.cards) {
          if (card.content.startsWith("db://")) {
            urls[card.content] = await getFileAsObjectUrl(card.content);
          }
        }
        setMediaUrls(urls);
      }
    }
    init();
  }, []);

  // Auto-save whenever story config changes
  useEffect(() => {
    if (story !== DEFAULT_STORY) {
      saveDraft(story);
    }
  }, [story]);

  // Update specific fields of story config
  const updateStoryField = (key: keyof StoryData, value: any) => {
    setStory((prev) => ({ ...prev, [key]: value }));
  };

  // Handle uploading media files (images, audios) and storing them in IndexedDB
  const handleMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (dbUrl: string, filename: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Store in IndexedDB
    const dbUrl = await storeFile(fileId, file);
    
    // Create Object URL for preview
    const previewUrl = URL.createObjectURL(file);
    setMediaUrls((prev) => ({ ...prev, [dbUrl]: previewUrl }));

    callback(dbUrl, file.name);
  };

  // Card Management
  const addCard = () => {
    const newCard: CardData = {
      id: `card_${Date.now()}`,
      type: "text",
      content: "Enter your custom greeting message here.",
      title: "New Moment",
      bubbleText: "Read Me ❤️",
      caption: "",
      date: "2026",
    };
    setStory((prev) => ({
      ...prev,
      cards: [...prev.cards, newCard],
    }));
    setSelectedCardId(newCard.id);
  };

  const deleteCard = (id: string) => {
    setStory((prev) => ({
      ...prev,
      cards: prev.cards.filter((c) => c.id !== id),
    }));
    if (selectedCardId === id) setSelectedCardId(null);
  };

  const updateCardField = (id: string, key: keyof CardData, value: any) => {
    setStory((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => (c.id === id ? { ...c, [key]: value } : c)),
    }));
  };

  const moveCard = (idx: number, direction: "up" | "down") => {
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === story.cards.length - 1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const cards = [...story.cards];
    const temp = cards[idx];
    cards[idx] = cards[targetIdx];
    cards[targetIdx] = temp;

    setStory((prev) => ({ ...prev, cards }));
  };

  // ZIP Generation Trigger
  const handleZipDownload = async () => {
    setIsExporting(true);
    try {
      const blob = await exportToZip(story);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${story.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-website.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert("Export failed. Please check your uploads and try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Share URL Generator
  const handleGenerateShareLink = () => {
    const hash = compressStory(story);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/story#${hash}`;
    setShareUrl(url);
    setCopySuccess(false);
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleResetDraft = () => {
    if (confirm("Are you sure you want to delete this draft and start over?")) {
      setStory(DEFAULT_STORY);
      setSelectedCardId(null);
      setMediaUrls({});
    }
  };

  const selectedCard = story.cards.find((c) => c.id === selectedCardId);

  return (
    <div className="flex-grow w-full min-h-screen flex flex-col bg-[#F8F5F2] select-none text-[#2d2d2d]">
      
      {/* Top Header Toolbar */}
      <header className="glass border-b border-white/20 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="text-2xl">✉️</div>
          <div>
            <h1 className="font-heading font-extrabold text-lg text-[#4A2B2D]">LoveWith Dhyey</h1>
            <p className="text-[10px] font-body text-gray-500">Free Greeting Website Creator</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleResetDraft}
            className="p-2.5 glass rounded-full hover:scale-105 transition-transform text-[#4A2B2D]"
            title="Reset Draft"
          >
            <Undo size={18} />
          </button>
          
          <button
            onClick={() => {
              saveDraft(story);
              setSaveSuccess(true);
              setTimeout(() => setSaveSuccess(false), 2000);
            }}
            className="px-4 py-2 bg-white/70 backdrop-blur border border-white/30 text-[#4A2B2D] rounded-full text-xs font-bold shadow-sm hover:scale-105 transition-all flex items-center gap-1.5"
          >
            {saveSuccess ? <Check size={14} className="text-green-500" /> : <Save size={14} />}
            {saveSuccess ? "Saved!" : "Save Draft"}
          </button>

          <button
            onClick={handleGenerateShareLink}
            className="px-4 py-2 bg-gradient-to-r from-[#E98B92] to-[#BB8FCE] text-white rounded-full text-xs font-bold shadow-sm hover:scale-105 transition-all flex items-center gap-1.5"
          >
            <Share2 size={14} />
            Share Link
          </button>

          <button
            onClick={handleZipDownload}
            className="px-4 py-2 bg-[#4A2B2D] text-white rounded-full text-xs font-bold shadow-sm hover:scale-105 transition-all flex items-center gap-1.5"
          >
            <Download size={14} />
            Export ZIP
          </button>
        </div>
      </header>

      {/* Main Workspace Workspace Layout */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-73px)]">
        
        {/* LEFT COLUMN: Settings & Content Config */}
        <aside className="w-full lg:w-[450px] border-r border-white/20 bg-white/40 backdrop-blur-md overflow-y-auto p-6 flex flex-col gap-6">
          
          {/* General Branding Section */}
          <div className="glass rounded-3xl p-5 border border-white/30 flex flex-col gap-4 shadow-sm">
            <h2 className="text-sm font-bold tracking-wider text-[#4A2B2D] uppercase flex items-center gap-2">
              <Settings size={16} /> Basic Details
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">From (Sender)</label>
                <input
                  type="text"
                  value={story.senderName}
                  onChange={(e) => updateStoryField("senderName", e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white/50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#E98B92]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">To (Receiver)</label>
                <input
                  type="text"
                  value={story.receiverName}
                  onChange={(e) => updateStoryField("receiverName", e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white/50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#E98B92]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Greeting Title</label>
              <input
                type="text"
                value={story.title}
                onChange={(e) => updateStoryField("title", e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-white/50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#E98B92] font-semibold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Tagline / Subtitle</label>
              <textarea
                value={story.subtitle}
                onChange={(e) => updateStoryField("subtitle", e.target.value)}
                rows={2}
                className="w-full mt-1 px-3 py-2 bg-white/50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#E98B92] resize-none"
              />
            </div>
          </div>

          {/* Theme styling Options */}
          <div className="glass rounded-3xl p-5 border border-white/30 flex flex-col gap-4 shadow-sm">
            <h2 className="text-sm font-bold tracking-wider text-[#4A2B2D] uppercase flex items-center gap-2">
              <Palette size={16} /> Look & Feel
            </h2>

            {/* Template Selector */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Choose Story Template</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "balloon", name: "Balloon Pop" },
                  { id: "cinematic", name: "Cinematic Film" },
                  { id: "scrapbook", name: "Interactive Scrapbook" },
                  { id: "timeline", name: "Journey Timeline" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => updateStoryField("templateId", t.id)}
                    className={`p-3 rounded-2xl text-xs font-semibold border transition-all text-center ${story.templateId === t.id ? "bg-[#4A2B2D] text-white border-[#4A2B2D]" : "bg-white/50 border-gray-200 hover:bg-white/80"}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors picker */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Theme Palette</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "blush-pink", hex: "#F8D7DA", label: "Blush" },
                  { id: "baby-blue", hex: "#D6EAF8", label: "Blue" },
                  { id: "lavender", hex: "#E8DAEF", label: "Lavender" },
                  { id: "cream", hex: "#FFF8E7", label: "Cream" },
                  { id: "peach", hex: "#FAD7A0", label: "Peach" },
                  { id: "mint-green", hex: "#D5F5E3", label: "Mint" },
                  { id: "light-beige", hex: "#F8F5F2", label: "Beige" },
                  { id: "soft-white", hex: "#FCFCFC", label: "White" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateStoryField("themeColor", c.id)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-9 h-9 rounded-full border shadow-inner transition-transform hover:scale-110 flex items-center justify-center relative ${story.themeColor === c.id ? "border-gray-800 scale-105" : "border-white/40"}`}
                    title={c.label}
                  >
                    {story.themeColor === c.id && <Check size={12} className="text-gray-700 bg-white/70 rounded-full p-0.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography fonts selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Type size={12} /> Heading Font</label>
                <select
                  value={story.fontHeading}
                  onChange={(e) => updateStoryField("fontHeading", e.target.value)}
                  className="w-full mt-1.5 px-2 py-2 bg-white/50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                >
                  <option value="font-playfair">Playfair Display</option>
                  <option value="font-cormorant">Cormorant</option>
                  <option value="font-dancing">Dancing Script</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Type size={12} /> Body Font</label>
                <select
                  value={story.fontBody}
                  onChange={(e) => updateStoryField("fontBody", e.target.value)}
                  className="w-full mt-1.5 px-2 py-2 bg-white/50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                >
                  <option value="font-poppins">Poppins</option>
                  <option value="font-inter">Inter</option>
                  <option value="font-caveat">Caveat Note</option>
                </select>
              </div>
            </div>
          </div>

          {/* Music and Voice audio settings */}
          <div className="glass rounded-3xl p-5 border border-white/30 flex flex-col gap-4 shadow-sm">
            <h2 className="text-sm font-bold tracking-wider text-[#4A2B2D] uppercase flex items-center gap-2">
              <Music size={16} /> Soundtracks & Audio
            </h2>

            {/* Background Music */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Background Soundtrack</label>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Paste audio .mp3 URL"
                  value={story.musicUrl.startsWith("db://") ? "" : story.musicUrl}
                  onChange={(e) => updateStoryField("musicUrl", e.target.value)}
                  className="w-full px-3 py-2 bg-white/50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#E98B92]"
                />
                <div className="relative">
                  <input
                    type="file"
                    accept="audio/*"
                    id="musicUpload"
                    onChange={(e) =>
                      handleMediaUpload(e, (dbUrl, filename) => {
                        updateStoryField("musicUrl", dbUrl);
                        updateStoryField("musicName", filename);
                      })
                    }
                    className="hidden"
                  />
                  <label
                    htmlFor="musicUpload"
                    className="w-full py-2 bg-white border border-dashed border-gray-300 rounded-xl text-xs text-center flex items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    📁 Upload soundtrack file
                  </label>
                </div>
                {story.musicName && story.musicUrl.startsWith("db://") && (
                  <div className="text-[10px] text-green-600 font-semibold truncate flex items-center gap-1">
                    ✓ Stored: {story.musicName}
                  </div>
                )}
              </div>
            </div>

            {/* Voice Notes */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Voice Recording / Note</label>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Paste voice recording .mp3 URL"
                  value={story.voiceNoteUrl.startsWith("db://") ? "" : story.voiceNoteUrl}
                  onChange={(e) => updateStoryField("voiceNoteUrl", e.target.value)}
                  className="w-full px-3 py-2 bg-white/50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#E98B92]"
                />
                <div className="relative">
                  <input
                    type="file"
                    accept="audio/*"
                    id="voiceUpload"
                    onChange={(e) =>
                      handleMediaUpload(e, (dbUrl, filename) => {
                        updateStoryField("voiceNoteUrl", dbUrl);
                        updateStoryField("voiceNoteName", filename);
                      })
                    }
                    className="hidden"
                  />
                  <label
                    htmlFor="voiceUpload"
                    className="w-full py-2 bg-white border border-dashed border-gray-300 rounded-xl text-xs text-center flex items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    🎙️ Upload voice recording file
                  </label>
                </div>
                {story.voiceNoteName && story.voiceNoteUrl.startsWith("db://") && (
                  <div className="text-[10px] text-green-600 font-semibold truncate flex items-center gap-1">
                    ✓ Stored: {story.voiceNoteName}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cards / Section timeline editor */}
          <div className="glass rounded-3xl p-5 border border-white/30 flex flex-col gap-4 shadow-sm flex-grow">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold tracking-wider text-[#4A2B2D] uppercase flex items-center gap-2">
                📔 Story Chapters
              </h2>
              <button
                onClick={addCard}
                className="p-1.5 bg-[#4A2B2D] text-white rounded-full hover:scale-105 transition-transform"
                title="Add Chapter Card"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* List of cards */}
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-1">
              {story.cards.map((c, idx) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCardId(c.id)}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${selectedCardId === c.id ? "bg-white border-[#E98B92] shadow-sm" : "bg-white/40 border-white/10 hover:bg-white/60"}`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-xs bg-[#4A2B2D]/10 text-[#4A2B2D] px-2 py-0.5 rounded-full font-bold">
                      {idx + 1}
                    </span>
                    <div className="text-left truncate">
                      <p className="text-xs font-bold text-[#4A2B2D] truncate">
                        {c.title || `Moment ${idx + 1}`}
                      </p>
                      <p className="text-[9px] text-gray-500 uppercase font-semibold">
                        {c.type === "photo" ? "📸 Image" : c.type === "video" ? "🎥 Video" : "✍️ Custom Text"}
                      </p>
                    </div>
                  </div>

                  {/* Rearrange Action buttons */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => moveCard(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-20 text-[#4A2B2D]"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={() => moveCard(idx, "down")}
                      disabled={idx === story.cards.length - 1}
                      className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-20 text-[#4A2B2D]"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      onClick={() => deleteCard(c.id)}
                      className="p-1 hover:bg-rose-50 text-rose-500 rounded-full"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Individual Card details popup / sheet */}
            {selectedCard && (
              <div className="mt-2 p-4 bg-white/80 rounded-2xl border border-gray-100 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-[#4A2B2D]">Edit Card Settings</h3>
                  <button onClick={() => setSelectedCardId(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                </div>

                {/* Card Type */}
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Card Content Type</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["text", "photo", "video"].map((type) => (
                      <button
                        key={type}
                        onClick={() => updateCardField(selectedCard.id, "type", type)}
                        className={`py-1.5 rounded-xl text-[10px] font-bold border capitalize transition-all ${selectedCard.type === type ? "bg-[#4A2B2D] text-white" : "bg-white border-gray-200"}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Custom Fields */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase block">Chapter Title</label>
                    <input
                      type="text"
                      value={selectedCard.title || ""}
                      onChange={(e) => updateCardField(selectedCard.id, "title", e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase block">Bubble Button Label</label>
                    <input
                      type="text"
                      placeholder="Pop Me!"
                      value={selectedCard.bubbleText || ""}
                      onChange={(e) => updateCardField(selectedCard.id, "bubbleText", e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {selectedCard.type === "text" ? (
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase block">Personal Message</label>
                    <textarea
                      value={selectedCard.content}
                      onChange={(e) => updateCardField(selectedCard.id, "content", e.target.value)}
                      rows={3}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none resize-none"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-[9px] font-bold text-gray-500 uppercase block">Media File Link (URL)</label>
                      <input
                        type="text"
                        placeholder="Paste image/video direct URL"
                        value={selectedCard.content.startsWith("db://") ? "" : selectedCard.content}
                        onChange={(e) => updateCardField(selectedCard.id, "content", e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="file"
                        accept={selectedCard.type === "photo" ? "image/*" : "video/*"}
                        id={`cardFile_${selectedCard.id}`}
                        onChange={(e) =>
                          handleMediaUpload(e, (dbUrl) => {
                            updateCardField(selectedCard.id, "content", dbUrl);
                          })
                        }
                        className="hidden"
                      />
                      <label
                        htmlFor={`cardFile_${selectedCard.id}`}
                        className="w-full py-2 bg-white border border-dashed border-gray-300 rounded-xl text-[10px] text-center flex items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        📁 Upload local file
                      </label>
                    </div>
                    {selectedCard.content.startsWith("db://") && (
                      <div className="text-[9px] text-green-600 font-semibold truncate">
                        ✓ Image saved locally
                      </div>
                    )}
                    <div>
                      <label className="text-[9px] font-bold text-gray-500 uppercase block">Caption</label>
                      <input
                        type="text"
                        placeholder="Add caption..."
                        value={selectedCard.caption || ""}
                        onChange={(e) => updateCardField(selectedCard.id, "caption", e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Timeline Specific Date */}
                {story.templateId === "timeline" && (
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase block">Timeline Date / Milestone</label>
                    <input
                      type="text"
                      placeholder="e.g. 2012, Childhood"
                      value={selectedCard.date || ""}
                      onChange={(e) => updateCardField(selectedCard.id, "date", e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: Live Viewport Renderer */}
        <section className="flex-grow bg-[#EAE7E4] p-6 flex flex-col items-center justify-center relative">
          
          {/* Preview configuration toggle header */}
          <div className="flex gap-2 glass rounded-full p-1 border border-white/40 shadow-sm mb-6 z-10">
            <button
              onClick={() => setViewportMode("mobile")}
              className={`p-2 rounded-full transition-all ${viewportMode === "mobile" ? "bg-[#4A2B2D] text-white shadow-sm" : "hover:bg-white/40 text-[#4A2B2D]"}`}
              title="Mobile Preview"
            >
              <Smartphone size={16} />
            </button>
            <button
              onClick={() => setViewportMode("desktop")}
              className={`p-2 rounded-full transition-all ${viewportMode === "desktop" ? "bg-[#4A2B2D] text-white shadow-sm" : "hover:bg-white/40 text-[#4A2B2D]"}`}
              title="Desktop Preview"
            >
              <Tv size={16} />
            </button>
          </div>

          {/* Interactive Screen viewport */}
          <div
            className={`w-full bg-[#FCFCFC] rounded-3xl border border-white/60 shadow-2xl overflow-y-auto flex flex-col transition-all duration-300 ${viewportMode === "mobile" ? "max-w-[375px] h-[667px] aspect-[9/16]" : "max-w-4xl h-[560px] aspect-[16/10]"}`}
          >
            {/* Viewport content */}
            <div className="flex-grow w-full flex flex-col">
              <TemplateRenderer data={story} mediaUrls={mediaUrls} isInteractive={false} />
            </div>
          </div>

          <div className="mt-4 text-[10px] text-gray-500 uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <Eye size={12} className="text-gray-400" /> Interactive Preview Active
          </div>
        </section>
      </div>

      {/* POPUP MODAL 1: Exporting ZIP Loader */}
      {isExporting && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] flex items-center justify-center p-6">
          <div className="max-w-xs w-full glass rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl">
            <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-400 rounded-full animate-spin mb-4" />
            <h3 className="text-lg font-bold text-[#4A2B2D] mb-1">Exporting Project...</h3>
            <p className="text-xs text-gray-500 font-body">Packaging assets and templates into a downloadable ZIP file.</p>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: Shareable Link details */}
      {shareUrl && (
        <div
          className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[998] flex items-center justify-center p-6"
          onClick={() => setShareUrl(null)}
        >
          <div
            className="max-w-md w-full glass rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative border border-white/40"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShareUrl(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold hover:scale-110 transition-transform"
            >
              ✕
            </button>

            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-2xl font-heading font-extrabold text-[#4A2B2D] mb-2">Greeting Link Generated!</h3>
            
            <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">
              Anyone with this link can view this animated story. Copy the link below or scan the QR code to share it.
              <br />
              <span className="text-[10px] text-rose-500 font-bold">
                Note: Local files uploaded cannot be embedded in URL links. Download ZIP to get the complete experience with local assets.
              </span>
            </p>

            {/* QR Graphic */}
            <div className="bg-white p-3.5 rounded-2xl shadow-inner border border-gray-100 mb-6 flex items-center justify-center aspect-square w-48">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`}
                className="w-full h-full object-contain"
                alt="Story QR Code"
              />
            </div>

            {/* URL Display */}
            <div className="w-full flex gap-2 mb-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-grow px-3 py-2 bg-white/70 border border-gray-200 rounded-xl text-xs focus:outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="p-2.5 bg-[#4A2B2D] text-white rounded-xl hover:scale-105 transition-transform flex items-center justify-center"
              >
                {copySuccess ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            {copySuccess && (
              <span className="text-[10px] text-green-600 font-bold mb-4">
                Link copied to clipboard!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
