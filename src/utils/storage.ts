import LZString from "lz-string";

export interface CardData {
  id: string;
  type: "text" | "photo" | "video";
  content: string; // The message text, or URL, or db://fileID for local storage
  title?: string; // Optional title (used in timeline/scrapbook)
  bubbleText?: string; // Balloon text (for Balloon Pop template)
  caption?: string; // Card caption
  date?: string; // Date string (for timeline template)
}

export interface StoryData {
  title: string;
  subtitle: string;
  templateId: "balloon" | "cinematic" | "scrapbook" | "timeline";
  themeColor: string; // blush-pink, baby-blue, lavender, cream, peach, mint-green, light-beige, soft-white
  fontHeading: string; // font-playfair, font-cormorant, font-dancing
  fontBody: string; // font-poppins, font-inter, font-caveat
  musicUrl: string; // URL or db://fileID
  musicName?: string;
  voiceNoteUrl: string; // URL or db://fileID
  voiceNoteName?: string;
  cards: CardData[];
  senderName: string;
  receiverName: string;
}

const DB_NAME = "LoveWithDhyeyDB";
const STORE_DRAFTS = "drafts";
const STORE_FILES = "files";

// Open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB is only available in the browser"));
      return;
    }
    const request = indexedDB.open(DB_NAME, 2);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
        db.createObjectStore(STORE_DRAFTS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES, { keyPath: "id" });
      }
    };
  });
}

// File Storage Helpers
export async function storeFile(id: string, file: File | Blob): Promise<string> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_FILES, "readwrite");
    const store = transaction.objectStore(STORE_FILES);
    const request = store.put({ id, data: file, name: (file as File).name || "file", type: file.type });

    request.onsuccess = () => resolve(`db://${id}`);
    request.onerror = () => reject(request.error);
  });
}

export async function getFile(id: string): Promise<{ data: Blob; name: string; type: string } | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_FILES, "readonly");
    const store = transaction.objectStore(STORE_FILES);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function getFileAsDataUrl(dbUrl: string): Promise<string> {
  if (!dbUrl.startsWith("db://")) return dbUrl;
  const id = dbUrl.replace("db://", "");
  const fileRecord = await getFile(id);
  if (!fileRecord) return "";
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(fileRecord.data);
  });
}

export async function getFileAsObjectUrl(dbUrl: string): Promise<string> {
  if (!dbUrl.startsWith("db://")) return dbUrl;
  const id = dbUrl.replace("db://", "");
  const fileRecord = await getFile(id);
  if (!fileRecord) return "";
  return URL.createObjectURL(fileRecord.data);
}

// Draft Helpers
export async function saveDraft(story: StoryData): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_DRAFTS, "readwrite");
    const store = transaction.objectStore(STORE_DRAFTS);
    const request = store.put({ id: "current_draft", story });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function loadDraft(): Promise<StoryData | null> {
  if (typeof window === "undefined") return null;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_DRAFTS, "readonly");
      const store = transaction.objectStore(STORE_DRAFTS);
      const request = store.get("current_draft");

      request.onsuccess = () => resolve(request.result?.story || null);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Failed to load draft", e);
    return null;
  }
}

// URL Compression Helpers
export function compressStory(story: StoryData): string {
  // We strip local database references for the shareable URL because they won't exist on another client
  const shareableStory = {
    ...story,
    musicUrl: story.musicUrl.startsWith("db://") ? "" : story.musicUrl,
    voiceNoteUrl: story.voiceNoteUrl.startsWith("db://") ? "" : story.voiceNoteUrl,
    cards: story.cards.map((c) => ({
      ...c,
      content: c.content.startsWith("db://") ? "" : c.content,
    })),
  };
  return LZString.compressToEncodedURIComponent(JSON.stringify(shareableStory));
}

export function decompressStory(compressed: string): StoryData | null {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    if (!decompressed) return null;
    return JSON.parse(decompressed) as StoryData;
  } catch (e) {
    console.error("Failed to decompress story data", e);
    return null;
  }
}

// Default/Sample Story Data for preview & initialization
export const DEFAULT_STORY: StoryData = {
  title: "Happy Father's Day, Dad!",
  subtitle: "To the man who gave me everything and asked for nothing.",
  templateId: "balloon",
  themeColor: "blush-pink",
  fontHeading: "font-playfair",
  fontBody: "font-poppins",
  musicUrl: "",
  musicName: "",
  voiceNoteUrl: "",
  voiceNoteName: "",
  senderName: "Dhyey",
  receiverName: "Dad",
  cards: [
    {
      id: "card_1",
      type: "text",
      content: "Thank you for always being my hero, my guide, and my biggest supporter. You showed me what strength, kindness, and love truly mean.",
      title: "My Hero",
      bubbleText: "Read Me ❤️",
    },
    {
      id: "card_2",
      type: "photo",
      content: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
      title: "Strength & Wisdom",
      bubbleText: "A Special Moment 📸",
      caption: "You have always been there to support my dreams.",
    },
    {
      id: "card_3",
      type: "text",
      content: "No matter how old I grow, I will always look up to you. I'm so grateful to have you in my life.",
      title: "Forever Grateful",
      bubbleText: "Warm Hugs 🤗",
    },
    {
      id: "card_4",
      type: "photo",
      content: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80",
      title: "Endless Laughs",
      bubbleText: "Best Dad Ever 🌟",
      caption: "Your laughter fills our home with endless happiness.",
    },
  ],
};
