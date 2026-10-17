import { useState, useEffect, useRef } from "react";

/**
 * BambooPanda - Retro Pixel Mascot climbing a bamboo stalk
 * - Attached directly to the top-right corner of the top window.
 * - Positioned in the right margin so it doesn't block window buttons or content.
 * - Bamboo stalk and sprite bamboo are mathematically aligned.
 * - Climbs down when scrolling down, climbs up when scrolling up.
 * - Friendly greetings on click ("Hello! 👋", "Check out our new deals! 🛍️", etc.).
 */
export default function BambooPanda() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDir, setScrollDir] = useState("idle"); // 'down' | 'up' | 'idle'
  const [windowWidth, setWindowWidth] = useState(1400);
  const [windowHeight, setWindowHeight] = useState(800);
  const [pageHeight, setPageHeight] = useState(3500);
  const [isClicked, setIsClicked] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const [particles, setParticles] = useState([]);

  const lastScrollYRef = useRef(0);
  const scrollTimeoutRef = useRef(null);
  const quoteIndexRef = useRef(0);

  // Friendly, simple quotes
  const quotes = [
    "Hello! 👋",
    "Check out our new deals! 🛍️",
    "Welcome to ShopKart! ✨",
    "Found anything you like? 🎮",
    "Hope you find great stuff today! 🎋",
  ];

  // Track scroll position, direction, and dimensions
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const prevY = lastScrollYRef.current;

      if (currentY > prevY + 2) {
        setScrollDir("down");
      } else if (currentY < prevY - 2) {
        setScrollDir("up");
      }

      lastScrollYRef.current = currentY;
      setScrollY(currentY);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setScrollDir("idle");
      }, 150);
    };

    const updateDimensions = () => {
      const w = window.innerWidth || 1400;
      const h = window.innerHeight || 800;
      const totalH = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        h + 1000
      );
      setWindowWidth(w);
      setWindowHeight(h);
      setPageHeight(totalH);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateDimensions);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Handle click on panda
  const handlePandaClick = (e) => {
    e.stopPropagation();
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 400);

    // Cycle friendly quotes
    const nextQuote = quotes[quoteIndexRef.current % quotes.length];
    quoteIndexRef.current += 1;
    setSpeechText(nextQuote);

    // Floating particles
    const newParticles = [
      { id: Date.now() + 1, emoji: "🍃", dx: -24, dy: -35 },
      { id: Date.now() + 2, emoji: "🎋", dx: 24, dy: -40 },
      { id: Date.now() + 3, emoji: "✨", dx: -14, dy: -50 },
    ];
    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.some((np) => np.id === p.id))
      );
    }, 850);
  };

  const handleCloseBubble = (e) => {
    e.stopPropagation();
    setSpeechText("");
  };

  useEffect(() => {
    if (!speechText) return;
    const timer = setTimeout(() => setSpeechText(""), 3800);
    return () => clearTimeout(timer);
  }, [speechText]);

  // =========================================================
  // GEOMETRIC ALIGNMENT & HORIZONTAL POSITIONING
  // =========================================================
  // Header is max-w-6xl (1152px).
  // Available margin on right of header = (windowWidth - 1152) / 2.
  // We place the bamboo stalk in that open yellow margin so it NEVER blocks the window content or buttons.
  const margin = Math.max(0, (windowWidth - 1152) / 2);
  
  // Calculate stalk offset from right edge of header:
  // On wide screens (margin >= 90), offset is -68px to -75px (safely outside window).
  // On medium screens (margin >= 45), offset is -35px.
  // On narrow screens (margin < 45), offset is 6px.
  let stalkRightOffset = 6;
  if (margin >= 95) {
    stalkRightOffset = -72;
  } else if (margin >= 55) {
    stalkRightOffset = -42;
  } else if (margin >= 25) {
    stalkRightOffset = -18;
  }

  // Panda dimensions & precise stalk alignment
  const PANDA_WIDTH = 120; // px
  const STALK_WIDTH = 12; // px

  // In panda_climbing.png (size 654x1087), the stalk center is at 408px from the left.
  // Ratio from right edge = (654 - 408) / 654 = 0.3761 (37.6%).
  // In a 120px wide container, the stalk center is at: 120 * 0.3761 = 45.1px from the right edge.
  const STALK_CENTER_FROM_PANDA_RIGHT = 45.1;

  // Align background stalk and panda sprite to the exact same center line:
  const backgroundStalkRight = stalkRightOffset - STALK_WIDTH / 2;
  const pandaRight = stalkRightOffset - STALK_CENTER_FROM_PANDA_RIGHT;

  // Scroll-Linked Vertical Movement Math
  const headerTop = 16;
  const maxViewportTarget = Math.max(100, Math.min(185, windowHeight - 240));
  const desiredViewportY = Math.min(26 + scrollY * 0.35, maxViewportTarget);
  const climbY = Math.max(10, scrollY + desiredViewportY - headerTop);

  // Generate subtle bamboo leaf sprouts along the stalk
  const leafCount = Math.floor(pageHeight / 85);
  const leafSegments = Array.from({ length: Math.min(leafCount, 50) }, (_, i) => ({
    top: 60 + i * 85,
    side: i % 2 === 0 ? "left" : "right",
  }));

  // Top window frame right edge is at +12px inside header.
  // Distance from window corner to vertical bamboo pole:
  const bracketSpanWidth = Math.max(20, 12 - stalkRightOffset);

  return (
    <div
      className="bamboo-climbing-container absolute top-0 right-0 pointer-events-none z-30"
      style={{ height: `${pageHeight}px`, width: "240px" }}
      aria-hidden="true"
    >
      {/* =========================================================
          TOP WINDOW ATTACHMENT BRACKET & CONNECTING BRANCH
          Fastened to top-right corner of the window frame (right: 12px, top: 16px)
          and reaching across to the vertical bamboo pole
          ========================================================= */}
      <div
        className="absolute top-4 pointer-events-auto"
        style={{
          right: `${Math.min(12, stalkRightOffset)}px`,
          width: `${bracketSpanWidth + 10}px`,
        }}
      >
        {/* Retro Wooden/Bamboo Corner Fastener at window frame edge */}
        <div
          className="absolute top-0 right-0 bg-[#3e2106] border-2 border-[#163608] px-1 py-0.5 shadow-[2px_2px_0px_#163608] flex items-center gap-0.5 text-[8px] font-pixel-body text-[#ffe6a7] select-none"
          title="Bamboo Anchor Point (Attached to Top Window Corner)"
        >
          <span className="text-[10px]">🎋</span>
          <span className="hidden sm:inline text-[7px] text-[#bbf56e] font-bold">BAMBOO</span>
        </div>

        {/* Connecting Bamboo Branch spanning from window corner to vertical pole */}
        {bracketSpanWidth > 20 && (
          <div
            className="absolute top-[8px] h-[6px] bg-[#6aa82c] border-t border-b border-[#163608] pointer-events-none"
            style={{
              right: "2px",
              width: `${bracketSpanWidth}px`,
              backgroundImage: "linear-gradient(to bottom, #9fe84b, #3e6d18)",
            }}
          />
        )}

        {/* Sprouting Corner Leaves */}
        <div className="absolute -top-3.5 right-[-8px] pointer-events-none">
          <svg width="30" height="24" viewBox="0 0 30 24" fill="none">
            <path
              d="M14 20 C16 11, 20 5, 28 3 C24 9, 20 15, 14 20 Z"
              fill="#74b72e"
              stroke="#153308"
              strokeWidth="1.5"
            />
            <path
              d="M12 18 C10 9, 6 4, 1 3 C5 8, 9 13, 12 18 Z"
              fill="#9ce54e"
              stroke="#153308"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      {/* =========================================================
          VERTICAL CONTINUOUS BAMBOO STALK
          Runs all the way down from the top window anchor
          ========================================================= */}
      <div
        className="bamboo-pole absolute top-4 pointer-events-none"
        style={{
          right: `${backgroundStalkRight}px`,
          width: `${STALK_WIDTH}px`,
          height: `${pageHeight}px`,
          backgroundImage: "url('/assets/bamboo_stalk_tile.png')",
          backgroundRepeat: "repeat-y",
          backgroundSize: "12px auto",
          borderLeft: "1.5px solid #163608",
          borderRight: "1.5px solid #163608",
          boxShadow: "2px 0 0 rgba(0,0,0,0.15)",
        }}
      >
        {/* Pixel Bamboo Leaves Sprouting Along the Stalk */}
        {leafSegments.map((leaf, idx) => (
          <div
            key={idx}
            className={`absolute pointer-events-none ${
              leaf.side === "left" ? "-left-5 -scale-x-100" : "-right-5"
            }`}
            style={{ top: `${leaf.top}px` }}
          >
            <svg width="20" height="13" viewBox="0 0 20 13" fill="none">
              <path
                d="M2 11 C6 6, 12 3, 18 2 C14 6, 9 9, 2 11 Z"
                fill="#72b43a"
                stroke="#153308"
                strokeWidth="1.2"
              />
              <path
                d="M2 11 C7 9, 11 7, 15 8 C11 10, 6 11, 2 11 Z"
                fill="#9ce54e"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* =========================================================
          THE MASCOT PANDA
          Positioned with its bamboo stalk 100% aligned with the background pole
          ========================================================= */}
      <div
        className="panda-climber absolute transition-transform duration-75 ease-out pointer-events-auto cursor-pointer select-none"
        style={{
          top: `${climbY}px`,
          right: `${pandaRight}px`,
          width: `${PANDA_WIDTH}px`,
        }}
        onClick={handlePandaClick}
        title="ShopKart Mascot Panda - Click to say hello! 🐼"
      >
        {/* Vertical Stride Animation Wrapper (NO rotation so stalk never separates) */}
        <div
          className={`relative transition-all duration-150 ${
            isClicked ? "scale-110 -translate-y-2" : ""
          } ${
            scrollDir === "down"
              ? "animate-climb-down"
              : scrollDir === "up"
              ? "animate-climb-up"
              : "hover:scale-105"
          }`}
        >
          {/* Floating Emoji Particles on Click */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute pointer-events-none z-50 text-base animate-particle-float"
              style={{
                top: "30%",
                left: "40%",
                "--tx": `${p.dx}px`,
                "--ty": `${p.dy}px`,
              }}
            >
              {p.emoji}
            </div>
          ))}

          {/* Friendly Comic Speech Bubble */}
          {speechText && (
            <div
              className="absolute -top-14 -left-36 w-36 bg-[#fffdf0] border-2 border-[#2b1802] p-2 shadow-[3px_3px_0px_#2b1802] z-50 pointer-events-auto animate-bubble-pop"
              onClick={handleCloseBubble}
            >
              <p className="font-pixel-body text-[10px] text-[#2b1802] leading-tight mb-1 font-bold">
                {speechText}
              </p>
              <div className="flex justify-between items-center text-[7px] text-[#8c5300] border-t border-[#d8ba82] pt-0.5">
                <span>SHOPKART</span>
                <span className="text-[#e63946] font-bold">✕</span>
              </div>
              {/* Bubble Pointer Arrow pointing to Panda */}
              <div
                className="absolute top-5 -right-2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[7px] border-l-[#2b1802]"
              />
            </div>
          )}

          {/* Mascot Panda Climbing Sprite */}
          <img
            src="/assets/panda_climbing.png"
            alt="Pixel Mascot Panda Climbing Bamboo"
            className="w-full h-auto drop-shadow-[2px_3px_0px_rgba(43,24,2,0.5)]"
            style={{
              imageRendering: "pixelated",
            }}
          />
        </div>
      </div>
    </div>
  );
}
