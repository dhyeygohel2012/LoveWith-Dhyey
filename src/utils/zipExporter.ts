import JSZip from "jszip";
import { StoryData, getFile } from "./storage";

// Helper to extract file extension from MIME type
function getExtension(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
    case "video/mp4":
      return "mp4";
    case "video/webm":
      return "webm";
    case "audio/mpeg":
    case "audio/mp3":
      return "mp3";
    case "audio/ogg":
      return "ogg";
    case "audio/wav":
      return "wav";
    case "audio/webm":
      return "webm";
    default:
      return "bin";
  }
}

export async function exportToZip(story: StoryData): Promise<Blob> {
  const zip = new JSZip();
  const assetsFolder = zip.folder("assets")!;

  // Create a deep copy of story data to modify file references
  const exportedStory = JSON.parse(JSON.stringify(story)) as StoryData;

  // Track file processing to avoid duplicate exports
  const processedFiles: { [key: string]: string } = {};

  async function processMediaUrl(url: string): Promise<string> {
    if (!url || !url.startsWith("db://")) return url;
    if (processedFiles[url]) return processedFiles[url];

    const fileId = url.replace("db://", "");
    const fileRecord = await getFile(fileId);
    if (!fileRecord) return "";

    const ext = getExtension(fileRecord.type);
    const filename = `${fileId}.${ext}`;
    const relativePath = `./assets/${filename}`;

    // Write file to ZIP
    assetsFolder.file(filename, fileRecord.data);

    processedFiles[url] = relativePath;
    return relativePath;
  }

  // Process settings files
  exportedStory.musicUrl = await processMediaUrl(story.musicUrl);
  exportedStory.voiceNoteUrl = await processMediaUrl(story.voiceNoteUrl);

  // Process cards files
  for (let i = 0; i < story.cards.length; i++) {
    if (story.cards[i].type === "photo" || story.cards[i].type === "video") {
      exportedStory.cards[i].content = await processMediaUrl(story.cards[i].content);
    }
  }

  // Generate index.html content
  const htmlContent = generateHtml(exportedStory);
  zip.file("index.html", htmlContent);

  // Return generated zip blob
  return await zip.generateAsync({ type: "blob" });
}

function generateHtml(story: StoryData): string {
  // Theme styling configurations
  const themeColors: Record<string, { bg: string; text: string; primary: string; card: string }> = {
    "blush-pink": { bg: "#F8D7DA", text: "#4A2B2D", primary: "#E98B92", card: "rgba(255, 255, 255, 0.6)" },
    "baby-blue": { bg: "#D6EAF8", text: "#1A364A", primary: "#7FB3D5", card: "rgba(255, 255, 255, 0.6)" },
    "lavender": { bg: "#E8DAEF", text: "#3A2244", primary: "#BB8FCE", card: "rgba(255, 255, 255, 0.6)" },
    "cream": { bg: "#FFF8E7", text: "#4E3E28", primary: "#E5C185", card: "rgba(255, 255, 255, 0.7)" },
    "peach": { bg: "#FAD7A0", text: "#4D3819", primary: "#F5B041", card: "rgba(255, 255, 255, 0.65)" },
    "mint-green": { bg: "#D5F5E3", text: "#1B3B2B", primary: "#58D68D", card: "rgba(255, 255, 255, 0.6)" },
    "light-beige": { bg: "#F8F5F2", text: "#3E3B39", primary: "#D9C3B0", card: "rgba(255, 255, 255, 0.75)" },
    "soft-white": { bg: "#FCFCFC", text: "#2A2A2A", primary: "#D5D8DC", card: "rgba(255, 255, 255, 0.8)" },
  };

  const fonts: Record<string, string> = {
    "font-playfair": "'Playfair Display', serif",
    "font-cormorant": "'Cormorant Garamond', serif",
    "font-dancing": "'Dancing Script', cursive",
    "font-poppins": "'Poppins', sans-serif",
    "font-inter": "'Inter', sans-serif",
    "font-caveat": "'Caveat', cursive",
  };

  const selectedTheme = themeColors[story.themeColor] || themeColors["blush-pink"];
  const headingFont = fonts[story.fontHeading] || "'Playfair Display', serif";
  const bodyFont = fonts[story.fontBody] || "'Poppins', sans-serif";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${story.title}</title>
  <!-- Load fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Dancing+Script:wght@400..700&family=Inter:wght@300..700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:wght@300..700&display=swap" rel="stylesheet">
  <!-- Tailwind CSS Play CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            themeBg: "${selectedTheme.bg}",
            themeText: "${selectedTheme.text}",
            themePrimary: "${selectedTheme.primary}",
            themeCard: "${selectedTheme.card}",
          },
          fontFamily: {
            heading: [${headingFont}],
            body: [${bodyFont}],
            handwriting: ["Caveat", "cursive"],
          }
        }
      }
    }
  </script>
  <style>
    body {
      background-color: ${selectedTheme.bg};
      color: ${selectedTheme.text};
      font-family: ${bodyFont};
      overflow-x: hidden;
      margin: 0;
      padding: 0;
    }
    h1, h2, h3, .heading-font {
      font-family: ${headingFont};
    }
    .glass {
      background: ${selectedTheme.card};
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.4);
    }
    /* Simple CSS Floating Keyframes */
    @keyframes floatUp {
      0% {
        transform: translateY(100vh) scale(1) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 0.8;
      }
      90% {
        opacity: 0.8;
      }
      100% {
        transform: translateY(-20vh) scale(1.1) rotate(15deg);
        opacity: 0;
      }
    }
    
    .floating-balloon {
      position: absolute;
      bottom: 0;
      animation: floatUp 15s linear infinite;
      cursor: pointer;
      z-index: 10;
    }

    /* Scrapbook transitions */
    .scrapbook-page {
      transition: transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1);
      transform-origin: left center;
      transform-style: preserve-3d;
    }
    .scrapbook-page.flipped {
      transform: rotateY(-180deg);
    }
    .backface-hidden {
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    
    /* Paper texture */
    .paper-texture {
      background-color: #FFF8E7;
      background-image: radial-gradient(#FAD7A0 0.5px, transparent 0.5px), radial-gradient(#FAD7A0 0.5px, #FFF8E7 0.5px);
      background-size: 20px 20px;
      background-position: 0 0, 10px 10px;
    }

    /* Scroll animations */
    .fade-in-section {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 1s ease-out, transform 1s ease-out;
    }
    .fade-in-section.visible {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between overflow-x-hidden selection:bg-themePrimary/20">

  <!-- Autoplay Interaction Overlay -->
  <div id="interactionOverlay" class="fixed inset-0 bg-[#FCFCFC]/90 z-[999] flex flex-col items-center justify-center p-6 text-center transition-opacity duration-500">
    <div class="max-w-md p-8 glass rounded-3xl shadow-xl flex flex-col items-center animate-bounce">
      <div class="text-6xl mb-6">✉️</div>
      <h1 class="text-3xl font-heading font-bold mb-4">You have a special message!</h1>
      <p class="text-sm font-body text-gray-600 mb-8">Tap below to unlock this memory story with music and ambient voice notes.</p>
      <button onclick="startExperience()" class="px-8 py-4 bg-themePrimary text-white rounded-full font-bold shadow-lg hover:scale-105 transition-all duration-300">
        Open Memory Box ✨
      </button>
    </div>
  </div>

  <!-- Music Elements -->
  <audio id="bgMusic" loop preload="auto">
    ${story.musicUrl ? `<source src="${story.musicUrl}" type="audio/mpeg">` : ""}
  </audio>
  <audio id="voiceNote" preload="auto">
    ${story.voiceNoteUrl ? `<source src="${story.voiceNoteUrl}" type="audio/mpeg">` : ""}
  </audio>

  <!-- Main Content Container -->
  <main id="appContent" class="flex-grow w-full flex flex-col relative hidden">
    <!-- Music control floating toggle -->
    <div class="fixed top-6 right-6 z-50 flex gap-2">
      <button id="musicToggleBtn" onclick="toggleMusic()" class="p-3 glass rounded-full shadow-md text-xl hover:scale-105 transition-all duration-200">
        🔊
      </button>
    </div>

    <!-- Template Injection Target -->
    <div id="templateRoot" class="flex-grow w-full flex flex-col"></div>
  </main>

  <!-- Confetti Canvas -->
  <canvas id="confettiCanvas" class="fixed inset-0 pointer-events-none z-[100] w-full h-full"></canvas>

  <script>
    // Story Data Configuration
    window.storyData = ${JSON.stringify(story)};

    // State Variables
    let musicPlaying = false;
    const bgMusic = document.getElementById('bgMusic');
    const voiceNote = document.getElementById('voiceNote');

    // Experience entry point
    function startExperience() {
      const overlay = document.getElementById('interactionOverlay');
      overlay.style.opacity = 0;
      setTimeout(() => {
        overlay.classList.add('hidden');
        document.getElementById('appContent').classList.remove('hidden');
        renderTemplate();
        playMedia();
      }, 500);
    }

    function playMedia() {
      // Try autoplaying background music
      if (bgMusic && bgMusic.src) {
        bgMusic.play()
          .then(() => {
            musicPlaying = true;
            document.getElementById('musicToggleBtn').innerText = '🔊';
          })
          .catch(err => console.log("Autoplay blocked by browser. Interaction will enable music."));
      }

      // Try autoplaying voice note
      if (voiceNote && voiceNote.src) {
        // Pause bg music slightly for voice note if active
        if (bgMusic) bgMusic.volume = 0.2;
        voiceNote.play()
          .then(() => {
            voiceNote.onended = () => {
              if (bgMusic) bgMusic.volume = 1.0;
            };
          })
          .catch(err => console.log("Voice note autoplay failed."));
      }
    }

    function toggleMusic() {
      if (!bgMusic || !bgMusic.src) return;
      if (musicPlaying) {
        bgMusic.pause();
        musicPlaying = false;
        document.getElementById('musicToggleBtn').innerText = '🔇';
      } else {
        bgMusic.play();
        musicPlaying = true;
        document.getElementById('musicToggleBtn').innerText = '🔊';
      }
    }

    // Render templates
    function renderTemplate() {
      const root = document.getElementById('templateRoot');
      const data = window.storyData;

      if (data.templateId === 'balloon') {
        renderBalloonPop(root, data);
      } else if (data.templateId === 'cinematic') {
        renderCinematic(root, data);
      } else if (data.templateId === 'scrapbook') {
        renderScrapbook(root, data);
      } else if (data.templateId === 'timeline') {
        renderTimeline(root, data);
      }
    }

    // --- TEMPLATE 1: BALLOON POP ---
    let poppedBalloons = 0;
    function renderBalloonPop(root, data) {
      root.className = "flex-grow flex flex-col justify-between items-center relative p-6 select-none overflow-hidden h-screen bg-gradient-to-b from-blue-100 to-themeBg";
      
      let html = \`
        <div class="text-center mt-8 z-20">
          <h1 class="text-4xl md:text-5xl font-heading font-extrabold text-themeText drop-shadow-sm mb-2">\${data.title}</h1>
          <p class="text-sm md:text-md text-gray-700 max-w-md mx-auto">\${data.subtitle}</p>
          <div class="mt-4 px-4 py-2 glass rounded-full inline-block text-xs font-semibold text-themeText/70 animate-pulse">
            🎈 Pop all balloons to reveal your surprise! (<span id="popCount">0</span>/\${data.cards.length})
          </div>
        </div>

        <div id="balloonArea" class="absolute inset-0 w-full h-full overflow-hidden"></div>

        <!-- Pop Modal Overlay -->
        <div id="popModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 hidden">
          <div class="max-w-md w-full glass rounded-3xl p-6 shadow-2xl relative scale-95 transition-all duration-300 flex flex-col items-center">
            <button onclick="closePopModal()" class="absolute top-4 right-4 text-2xl hover:scale-110 transition-all duration-150">✖️</button>
            <h3 id="modalTitle" class="text-2xl font-heading font-bold text-themeText mb-4"></h3>
            <div id="modalMedia" class="w-full rounded-2xl overflow-hidden mb-4"></div>
            <p id="modalText" class="text-center font-body text-gray-700 leading-relaxed"></p>
          </div>
        </div>

        <!-- Climax Card -->
        <div id="climaxCard" class="max-w-md w-full glass rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center mx-auto my-auto z-40 hidden animate-float">
          <div class="text-6xl mb-4 animate-bounce">💖</div>
          <h2 class="text-4xl font-heading font-bold text-themeText mb-4">Happy Father's Day!</h2>
          <p class="font-body text-gray-700 leading-relaxed mb-6">
            \${data.cards.map(c => c.type === 'text' ? c.content : '').filter(Boolean).slice(0,2).join(' ')}
          </p>
          <div class="border-t border-themePrimary/20 pt-4 w-full">
            <p class="font-handwriting text-3xl text-themePrimary">With lots of love,</p>
            <p class="font-heading text-xl font-bold mt-1 text-themeText">\${data.senderName}</p>
          </div>
        </div>

        <div class="mb-6 z-20 text-center font-handwriting text-2xl opacity-70 text-themeText">
          To: \${data.receiverName}
        </div>
      \`;

      root.innerHTML = html;
      spawnBalloons(data.cards);
    }

    function spawnBalloons(cards) {
      const area = document.getElementById('balloonArea');
      cards.forEach((card, idx) => {
        const balloon = document.createElement('div');
        balloon.className = 'floating-balloon flex flex-col items-center justify-center';
        
        // Random placement, sizing, and styling
        const width = 110 + Math.random() * 40;
        const left = 5 + Math.random() * 80; // range 5% to 85%
        const delay = idx * 2.5; // Staggered entry
        const speed = 12 + Math.random() * 6; // float duration
        const color = ['#F8D7DA', '#D6EAF8', '#E8DAEF', '#FFF8E7', '#FAD7A0', '#D5F5E3'][idx % 6];
        
        balloon.style.left = left + '%';
        balloon.style.width = width + 'px';
        balloon.style.height = (width * 1.25) + 'px';
        balloon.style.animationDuration = speed + 's';
        balloon.style.animationDelay = delay + 's';
        
        balloon.innerHTML = \`
          <!-- Balloon Body -->
          <div class="relative w-full h-full rounded-t-full rounded-b-[70%] flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-105" style="background-color: \${color}; border: 2px solid rgba(255,255,255,0.4)">
            <!-- Highlight/Sheen -->
            <div class="absolute top-3 left-4 w-6 h-10 bg-white/40 rounded-full rotate-[-30deg]"></div>
            
            <!-- Balloon Text -->
            <span class="px-2 text-center text-xs font-semibold text-gray-800 drop-shadow-sm font-body select-none">
              \${card.bubbleText || 'Pop Me! 🎈'}
            </span>

            <!-- Balloon Tie -->
            <div class="absolute bottom-[-6px] left-1/2 translate-x-[-50%] border-t-[8px] border-x-[6px] border-x-transparent" style="border-t-color: \${color}"></div>
            <!-- String -->
            <svg class="absolute bottom-[-66px] left-1/2 translate-x-[-50%] w-6 h-16 pointer-events-none" viewBox="0 0 20 60">
              <path d="M 10,0 Q 5,15 15,30 T 10,60" fill="none" stroke="#A9B2C3" stroke-width="1.5" />
            </svg>
          </div>
        \`;

        balloon.onclick = () => popBalloon(balloon, card, cards.length);
        area.appendChild(balloon);
      });
    }

    function popBalloon(balloonEl, card, totalCards) {
      // Play pop sound via Synthesizer API (Offline friendly!)
      playPopSound();

      // Spawn burst particles
      spawnParticles(balloonEl.offsetLeft + balloonEl.offsetWidth/2, balloonEl.offsetTop + balloonEl.offsetHeight/2);

      // Remove balloon element
      balloonEl.remove();

      poppedBalloons++;
      document.getElementById('popCount').innerText = poppedBalloons;

      // Open Modal
      openPopModal(card);

      if (poppedBalloons === totalCards) {
        setTimeout(() => {
          triggerCelebration();
        }, 1500);
      }
    }

    function openPopModal(card) {
      const modal = document.getElementById('popModal');
      const title = document.getElementById('modalTitle');
      const text = document.getElementById('modalText');
      const media = document.getElementById('modalMedia');

      title.innerText = card.title || 'Special Memory';
      text.innerText = card.type === 'text' ? '' : (card.caption || '');
      media.innerHTML = '';

      if (card.type === 'photo') {
        media.innerHTML = \`<img src="\${card.content}" class="w-full object-cover max-h-[300px] hover:scale-[1.02] transition-transform duration-300" alt="Memory Photo" />\`;
      } else if (card.type === 'video') {
        media.innerHTML = \`<video src="\${card.content}" controls class="w-full max-h-[300px]"></video>\`;
      } else {
        // Text type
        text.innerText = card.content;
      }

      modal.classList.remove('hidden');
      modal.firstElementChild.classList.remove('scale-95');
      modal.firstElementChild.classList.add('scale-100');
    }

    function closePopModal() {
      const modal = document.getElementById('popModal');
      modal.firstElementChild.classList.remove('scale-100');
      modal.firstElementChild.classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 150);
    }

    function playPopSound() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      } catch (e) {}
    }

    // --- TEMPLATE 2: CINEMATIC STORY ---
    function renderCinematic(root, data) {
      root.className = "flex-grow flex flex-col items-center bg-gradient-to-b from-[#FFF8E7] to-themeBg min-h-screen py-16 px-6";
      
      let html = \`
        <div class="max-w-3xl w-full flex flex-col items-center text-center mb-16 fade-in-section visible">
          <span class="text-xs tracking-[0.2em] font-semibold text-themePrimary uppercase mb-2">A Memory Film</span>
          <h1 class="text-5xl md:text-6xl font-heading font-extrabold text-themeText tracking-tight mb-4">\${data.title}</h1>
          <p class="text-lg font-body text-gray-600 italic font-light max-w-xl">\${data.subtitle}</p>
        </div>

        <div class="max-w-2xl w-full flex flex-col gap-24">
      \`;

      data.cards.forEach((card, index) => {
        html += \`
          <div class="fade-in-section flex flex-col items-center glass rounded-3xl p-6 md:p-8 shadow-xl">
            <h2 class="text-3xl font-heading font-semibold text-themeText mb-6">\${card.title || 'Chapter ' + (index + 1)}</h2>
        \`;

        if (card.type === 'photo') {
          html += \`
            <div class="w-full rounded-2xl overflow-hidden shadow-inner group aspect-video mb-6 relative bg-gray-100">
              <img src="\${card.content}" class="w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-[8000ms] ease-out" alt="Cinematic Memory" />
            </div>
            <p class="font-body text-gray-700 text-center leading-relaxed italic">"\${card.caption || ''}"</p>
          \`;
        } else if (card.type === 'video') {
          html += \`
            <div class="w-full rounded-2xl overflow-hidden shadow-inner aspect-video mb-6 bg-black">
              <video src="\${card.content}" controls class="w-full h-full object-cover"></video>
            </div>
            <p class="font-body text-gray-700 text-center leading-relaxed italic">"\${card.caption || ''}"</p>
          \`;
        } else {
          html += \`
            <div class="w-full py-4 text-center">
              <p class="text-xl md:text-2xl font-body text-themeText font-light leading-relaxed italic">"\${card.content}"</p>
            </div>
          \`;
        }

        html += \`</div>\`;
      });

      // Ending Climax Block
      html += \`
        <div class="fade-in-section flex flex-col items-center glass rounded-3xl p-8 md:p-12 shadow-2xl text-center">
          <div class="text-6xl mb-6 animate-pulse">💝</div>
          <h2 class="text-4xl md:text-5xl font-heading font-bold text-themeText mb-6">Forever and Always</h2>
          <p class="text-md font-body text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
            Every memory shared, every life lesson taught, every laugh enjoyed, has shaped who I am. Thank you.
          </p>
          <div class="border-t border-themePrimary/20 pt-6 w-full max-w-xs">
            <p class="font-handwriting text-3xl text-themePrimary">With absolute love,</p>
            <p class="font-heading text-xl font-bold mt-1 text-themeText">\${data.senderName}</p>
          </div>
        </div>
      </div>
      \`;

      root.innerHTML = html;

      // Handle scroll reveal logic
      setTimeout(initScrollReveal, 100);
    }

    function initScrollReveal() {
      const sections = document.querySelectorAll('.fade-in-section');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.1 });

      sections.forEach(s => observer.observe(s));
    }

    // --- TEMPLATE 3: INTERACTIVE SCRAPBOOK ---
    let currentPageIndex = 0;
    function renderScrapbook(root, data) {
      root.className = "flex-grow flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#FFFDF5] to-themeBg min-h-screen";
      
      const scrapbookCards = data.cards;
      
      let html = \`
        <div class="text-center mb-8 max-w-md">
          <h1 class="text-3xl md:text-4xl font-heading font-bold text-themeText mb-2">\${data.title}</h1>
          <p class="text-xs font-body text-gray-500">Flip the pages to browse our memory scrapbook 📖</p>
        </div>

        <div class="relative w-full max-w-lg aspect-[4/5] md:aspect-[5/6] glass rounded-3xl p-4 shadow-2xl flex flex-col justify-between paper-texture border-2 border-themePrimary/30">
          <!-- Binding Spiral -->
          <div class="absolute left-6 top-0 bottom-0 w-2 flex flex-col justify-around pointer-events-none z-30">
            \${Array(8).fill(0).map(() => '<div class="w-6 h-3 bg-gray-400/30 rounded-full border border-gray-400/50 -translate-x-2"></div>').join('')}
          </div>

          <!-- Scrapbook Page Content -->
          <div id="scrapbookContainer" class="flex-grow w-full flex flex-col justify-between pl-6 relative">
            <div class="flex justify-between items-center mb-4">
              <span class="font-handwriting text-xl text-themePrimary">Page <span id="pageIndexDisplay">1</span> of \${scrapbookCards.length}</span>
              <span class="text-sm font-handwriting text-gray-400">To: \${data.receiverName}</span>
            </div>
            
            <div id="scrapbookPageBody" class="flex-grow flex flex-col items-center justify-center"></div>

            <div class="mt-6 flex justify-between w-full">
              <button onclick="prevScrapbookPage()" class="px-4 py-2 glass rounded-full text-xs font-semibold hover:bg-white/80 transition-all">← Prev</button>
              <button onclick="nextScrapbookPage()" class="px-4 py-2 bg-themePrimary text-white rounded-full text-xs font-semibold shadow hover:scale-105 transition-all">Next →</button>
            </div>
          </div>
        </div>

        <div class="mt-8 font-handwriting text-2xl text-themeText opacity-75">
          Love, \${data.senderName}
        </div>
      \`;

      root.innerHTML = html;
      loadScrapbookPage();
    }

    function loadScrapbookPage() {
      const data = window.storyData;
      const card = data.cards[currentPageIndex];
      const pageBody = document.getElementById('scrapbookPageBody');
      const pageDisplay = document.getElementById('pageIndexDisplay');
      
      pageDisplay.innerText = currentPageIndex + 1;
      pageBody.className = "w-full flex-grow flex flex-col items-center justify-center animate-float-delayed";

      let pageHtml = '';
      if (card.type === 'photo') {
        pageHtml = \`
          <div class="bg-white p-3 shadow-lg rounded-md rotate-[2deg] max-w-[280px] w-full border border-gray-200">
            <div class="w-full aspect-square overflow-hidden bg-gray-100 mb-2 relative">
              <img src="\${card.content}" class="w-full h-full object-cover" alt="Scrapbook Memory" />
            </div>
            <div class="font-handwriting text-lg text-center text-gray-700 mt-1">\${card.caption || ''}</div>
          </div>
          <h3 class="font-handwriting text-2xl font-bold mt-4 text-themeText">\${card.title || ''}</h3>
        \`;
      } else if (card.type === 'video') {
        pageHtml = \`
          <div class="bg-white p-3 shadow-lg rounded-md rotate-[-2deg] max-w-[280px] w-full border border-gray-200">
            <div class="w-full aspect-square overflow-hidden bg-black mb-2 relative">
              <video src="\${card.content}" controls class="w-full h-full object-cover"></video>
            </div>
            <div class="font-handwriting text-lg text-center text-gray-700 mt-1">\${card.caption || ''}</div>
          </div>
          <h3 class="font-handwriting text-2xl font-bold mt-4 text-themeText">\${card.title || ''}</h3>
        \`;
      } else {
        pageHtml = \`
          <div class="text-center p-6 glass rounded-2xl max-w-sm w-full border border-themePrimary/20 rotate-[1deg]">
            <h3 class="font-handwriting text-2xl font-bold mb-4 text-themePrimary">\${card.title || 'A Note for You'}</h3>
            <p class="font-handwriting text-2xl text-gray-700 leading-relaxed italic">"\${card.content}"</p>
          </div>
        \`;
      }

      pageBody.innerHTML = pageHtml;
    }

    function prevScrapbookPage() {
      const cards = window.storyData.cards;
      if (currentPageIndex > 0) {
        currentPageIndex--;
        loadScrapbookPage();
      }
    }

    function nextScrapbookPage() {
      const cards = window.storyData.cards;
      if (currentPageIndex < cards.length - 1) {
        currentPageIndex++;
        loadScrapbookPage();
      } else {
        // Climax Trigger on Scrapbook Complete
        triggerCelebration();
      }
    }

    // --- TEMPLATE 4: JOURNEY TIMELINE ---
    function renderTimeline(root, data) {
      root.className = "flex-grow flex flex-col items-center bg-gradient-to-b from-themeBg to-[#FCFCFC] min-h-screen py-16 px-6";
      
      let html = \`
        <div class="text-center mb-16 max-w-md fade-in-section visible">
          <span class="text-xs tracking-widest text-themePrimary font-bold uppercase mb-2">Our Lifetime Journey</span>
          <h1 class="text-4xl md:text-5xl font-heading font-bold text-themeText mb-4">\${data.title}</h1>
          <p class="text-sm font-body text-gray-500">\${data.subtitle}</p>
        </div>

        <div class="relative w-full max-w-xl flex flex-col gap-12">
          <!-- Vertical center line -->
          <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-dashed bg-gradient-to-b from-themePrimary to-themeBg opacity-60"></div>
      \`;

      data.cards.forEach((card, idx) => {
        const isLeft = idx % 2 === 0;
        html += \`
          <!-- Timeline Card -->
          <div class="relative flex flex-col md:flex-row items-start md:items-center w-full fade-in-section">
            
            <!-- Bullet Point -->
            <div class="absolute left-4 md:left-1/2 -translate-x-[7px] w-4 h-4 rounded-full bg-themePrimary border-4 border-white shadow z-10"></div>
            
            <!-- Content Box -->
            <div class="w-full pl-12 md:pl-0 md:w-1/2 flex \${isLeft ? 'md:justify-end md:pr-12' : 'md:justify-start md:pl-12 md:order-2'\}">
              <div class="glass p-6 rounded-3xl shadow-lg w-full max-w-sm hover:scale-[1.02] transition-transform duration-300">
                <div class="flex justify-between items-center mb-3">
                  <span class="text-xs font-bold text-themePrimary bg-themePrimary/10 px-3 py-1 rounded-full">\${card.date || 'Memory'}</span>
                  <span class="font-heading text-sm text-themeText font-semibold">\${card.title || ''}</span>
                </div>
        \`;

        if (card.type === 'photo') {
          html += \`
            <div class="w-full aspect-video rounded-xl overflow-hidden mb-3">
              <img src="\${card.content}" class="w-full h-full object-cover" alt="Timeline Photo" />
            </div>
            <p class="font-body text-xs text-gray-500 italic">"\${card.caption || ''}"</p>
          \`;
        } else if (card.type === 'video') {
          html += \`
            <div class="w-full aspect-video rounded-xl overflow-hidden bg-black mb-3">
              <video src="\${card.content}" controls class="w-full h-full object-cover"></video>
            </div>
            <p class="font-body text-xs text-gray-500 italic">"\${card.caption || ''}"</p>
          \`;
        } else {
          html += \`<p class="font-body text-sm text-gray-700 leading-relaxed">"\${card.content}"</p>\`;
        }

        html += \`
              </div>
            </div>

            <!-- Empty spacer for desktop layout alignment -->
            <div class="hidden md:block w-1/2 \${isLeft ? 'order-2' : ''\}"></div>
          </div>
        \`;
      });

      // Timeline Climax Block
      html += \`
          <!-- Climax Bullet & Block -->
          <div class="relative flex flex-col items-center w-full mt-8 fade-in-section">
            <div class="w-12 h-12 rounded-full bg-themePrimary flex items-center justify-center text-white text-xl shadow-lg z-10 mb-4 animate-bounce">❤️</div>
            <div class="glass p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
              <h3 class="font-heading text-3xl font-bold text-themeText mb-3">Happy Father's Day!</h3>
              <p class="font-body text-sm text-gray-600 leading-relaxed mb-6">
                Thank you for being the anchor of my life. I love you, Dad.
              </p>
              <div class="border-t border-themePrimary/20 pt-4">
                <p class="font-handwriting text-3xl text-themePrimary">With all my heart,</p>
                <p class="font-heading text-lg font-bold mt-1 text-themeText">\${data.senderName}</p>
              </div>
            </div>
          </div>
        </div>
      \`;

      root.innerHTML = html;

      // Handle scroll reveal logic
      setTimeout(initScrollReveal, 100);
      
      // Auto-trigger confetti when they scroll near the end
      window.addEventListener('scroll', checkTimelineEnd);
    }

    function checkTimelineEnd() {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      if (scrollTop + clientHeight >= scrollHeight - 150) {
        triggerCelebration();
        window.removeEventListener('scroll', checkTimelineEnd);
      }
    }

    // --- CELEBRATION EFFECTS ---
    function triggerCelebration() {
      // Confetti burst
      const canvas = document.getElementById('confettiCanvas');
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles = [];
      const colors = ['#F8D7DA', '#D6EAF8', '#E8DAEF', '#FFF8E7', '#FAD7A0', '#D5F5E3', '#E98B92', '#7FB3D5'];

      for (let i = 0; i < 150; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          r: 5 + Math.random() * 8,
          d: Math.random() * canvas.height,
          color: colors[Math.floor(Math.random() * colors.length)],
          tilt: Math.random() * 10 - 5,
          tiltAngleIncremental: Math.random() * 0.07 + 0.02,
          tiltAngle: 0
        });
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let active = false;
        particles.forEach((p, idx) => {
          p.tiltAngle += p.tiltAngleIncremental;
          p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
          p.x += Math.sin(p.tiltAngle);
          p.tilt = Math.sin(p.tiltAngle - idx/3) * 15;

          if (p.y <= canvas.height) {
            active = true;
          }

          ctx.beginPath();
          ctx.lineWidth = p.r;
          ctx.strokeStyle = p.color;
          ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
          ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
          ctx.stroke();
        });

        if (active) {
          requestAnimationFrame(draw);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }

      draw();
    }

    // --- PARTICLE BURST FOR BALLOON POPPING ---
    function spawnParticles(x, y) {
      const canvas = document.getElementById('confettiCanvas');
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles = [];
      const colors = ['#E98B92', '#7FB3D5', '#BB8FCE', '#F5B041', '#58D68D'];

      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 8;
        particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 2 + Math.random() * 4,
          alpha: 1,
          decay: 0.02 + Math.random() * 0.03,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }

      function animate() {
        let active = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.1; // gravity
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
          requestAnimationFrame(animate);
        }
      }

      animate();
    }
  </script>
</body>
</html>
`;
}
