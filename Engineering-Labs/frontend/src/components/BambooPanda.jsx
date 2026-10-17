import { useState, useEffect, useRef } from "react";

/**
 * BambooPanda - Retro Pixel Mascot climbing a bamboo stalk
 * - Attached directly to the top-right corner of the top window.
 * - Climbs down the bamboo stalk as the user scrolls down ("moves down with us").
 * - Climbs back up as the user scrolls up ("when we go up it goes up").
 * - Features active climbing micro-animations, particle bursts, and interactive comic speech bubble.
 */
export default function BambooPanda() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDir, setScrollDir] = useState("idle"); // 'down' | 'up' | 'idle'
  const [windowHeight, setWindowHeight] = useState(800);
  const [pageHeight, setPageHeight] = useState(3500);
  const [isClicked, setIsClicked] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const [particles, setParticles] = useState([]);

  const lastScrollYRef = useRef(0);
  const scrollTimeoutRef = useRef(null);
  const quoteIndexRef = useRef(0);

  const quotes = [
    "🎋 Fresh bamboo! Climbing down with you!",
    "⛩ Anchored tight to the top window!",
    "🐾 Scroll down to see all the retro deals!",
    "🛍 Don't forget your Cart & Wishlist!",
    "🎮 100% Retro Gamer Panda Approved!",
    "✨ Bamboo power activated! Keep scrolling!",
  ];

  // Track scroll position, direction, and document dimensions
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
      const h = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        window.innerHeight + 1000
      );
      setPageHeight(h);
      setWindowHeight(window.innerHeight || 800);
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
    setTimeout(() => setIsClicked(false), 500);

    // Cycle quote
    const nextQuote = quotes[quoteIndexRef.current % quotes.length];
    quoteIndexRef.current += 1;
    setSpeechText(nextQuote);

    // Spawn floating particle emojis
    const newParticles = [
      { id: Date.now() + 1, emoji: "🍃", dx: -28, dy: -40 },
      { id: Date.now() + 2, emoji: "🎋", dx: 26, dy: -45 },
      { id: Date.now() + 3, emoji: "♥", dx: -14, dy: -60 },
      { id: Date.now() + 4, emoji: "✨", dx: 22, dy: -55 },
    ];
    setParticles((prev) => [...prev, ...newParticles]);

    // Clean up particles
    setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.some((np) => np.id === p.id))
      );
    }, 900);
  };

  const handleCloseBubble = (e) => {
    e.stopPropagation();
    setSpeechText("");
  };

  // Auto-dismiss bubble after 4.5 seconds
  useEffect(() => {
    if (!speechText) return;
    const timer = setTimeout(() => setSpeechText(""), 4500);
    return () => clearTimeout(timer);
  }, [speechText]);

  // Precise Scroll-Linked Climbing Math:
  // - Top window is at headerTop ≈ 16px.
  // - At scrollY === 0, panda is at top of bamboo: climbY = 10px, viewportY = 26px.
  // - As scrollY increases, viewport target smoothly glides down from 26px to ~175px (clamped above taskbar).
  // - climbY = scrollY + desiredViewportY - 16px.
  // - When scrolling up, climbY decreases back to 10px.
  const headerTop = 16;
  const maxViewportTarget = Math.max(100, Math.min(185, windowHeight - 250));
  const desiredViewportY = Math.min(26 + scrollY * 0.35, maxViewportTarget);
  const climbY = Math.max(10, scrollY + desiredViewportY - headerTop);

  // Generate alternating bamboo leaves along the stalk
  const leafCount = Math.floor(pageHeight / 75);
  const leafSegments = Array.from({ length: Math.min(leafCount, 55) }, (_, i) => ({
    top: 55 + i * 75,
    side: i % 2 === 0 ? "left" : "right",
  }));

  return (
    <div
      className="bamboo-climbing-container absolute top-0 right-0 pointer-events-none z-30"
      style={{ height: `${pageHeight}px`, width: "160px" }}
      aria-hidden="true"
    >
      {/* =========================================================
          TOP WINDOW ATTACHMENT BRACKET
          Attached to top-right corner of the top window frame (right: 12px, top: 16px)
          ========================================================= */}
      <div className="absolute top-4 right-[6px] sm:right-[10px] pointer-events-auto flex items-center justify-center">
        {/* Retro Wooden/Bamboo Corner Fastener */}
        <div
          className="relative bg-[#3e2106] border-2 border-[#163608] px-1 py-0.5 shadow-[2px_2px_0px_#163608] flex items-center gap-0.5 text-[8px] font-pixel-body text-[#ffe6a7] select-none"
          title="Bamboo Anchor Point (Attached to Top Window)"
        >
          <span className="text-[10px]">🎋</span>
          <span className="hidden sm:inline text-[7px] text-[#bbf56e] font-bold">BAMBOO</span>
        </div>

        {/* Decorative Top Leaves Sprouting Over Window Edge */}
        <div className="absolute -top-3 -right-2 flex pointer-events-none">
          <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
            <path
              d="M12 18 C14 10, 18 4, 26 2 C22 8, 18 14, 12 18 Z"
              fill="#74b72e"
              stroke="#153308"
              strokeWidth="1.5"
            />
            <path
              d="M10 16 C8 8, 4 3, 0 2 C4 7, 8 12, 10 16 Z"
              fill="#9ce54e"
              stroke="#153308"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      {/* =========================================================
          VERTICAL CONTINUOUS BAMBOO STALK
          Hangs down from top window corner through the page
          ========================================================= */}
      <div
        className="absolute top-4 right-[16px] sm:right-[20px] w-[14px] pointer-events-none"
        style={{
          height: `${pageHeight}px`,
          background:
            "linear-gradient(to right, #9fe84b 0%, #68aa2c 35%, #68aa2c 70%, #3e6d18 100%)",
          borderLeft: "2px solid #163608",
          borderRight: "2px solid #163608",
          boxShadow: "2px 0 0 rgba(0,0,0,0.18)",
        }}
      >
        {/* Repeating Bamboo Nodes (Joint Rings) */}
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to bottom, 
                transparent 0px, 
                transparent 44px, 
                #163608 44px, 
                #163608 46px, 
                #bdf56e 46px, 
                #bdf56e 48px, 
                transparent 48px
              )
            `,
            backgroundSize: "100% 48px",
          }}
        />

        {/* Pixel Bamboo Leaves Sprouting Along the Stalk */}
        {leafSegments.map((leaf, idx) => (
          <div
            key={idx}
            className={`absolute pointer-events-none ${
              leaf.side === "left" ? "-left-5 -scale-x-100" : "-right-5"
            }`}
            style={{ top: `${leaf.top}px` }}
          >
            <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
              <path
                d="M2 12 C6 7, 13 3, 20 2 C16 7, 10 10, 2 12 Z"
                fill="#72b43a"
                stroke="#153308"
                strokeWidth="1.2"
              />
              <path
                d="M2 12 C7 10, 12 8, 17 9 C12 11, 7 12, 2 12 Z"
                fill="#9ce54e"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* =========================================================
          THE MASCOT PANDA
          Climbs down as scroll increases, climbs up when scroll decreases
          ========================================================= */}
      <div
        className="panda-climber absolute transition-transform duration-75 ease-out pointer-events-auto cursor-pointer select-none"
        style={{
          top: `${climbY}px`,
          right: "calc(16px - 42px)", // Stalk in sprite matches background stalk
          width: "125px",
        }}
        onClick={handlePandaClick}
        title="ShopKart Mascot Panda - Click to interact! 🐼"
      >
        {/* Climbing Motion / Tilt Wrapper */}
        <div
          className={`relative transition-all duration-150 ${
            isClicked ? "scale-110 -translate-y-2 rotate-[-6deg]" : ""
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

          {/* Interactive Comic Speech Bubble */}
          {speechText && (
            <div
              className="absolute -top-16 -left-44 w-44 bg-[#fffdf0] border-2 border-[#2b1802] p-2 shadow-[3px_3px_0px_#2b1802] z-50 pointer-events-auto animate-bubble-pop"
              onClick={handleCloseBubble}
            >
              <p className="font-pixel-body text-[9px] text-[#2b1802] leading-tight mb-1">
                {speechText}
              </p>
              <div className="flex justify-between items-center text-[7px] text-[#8c5300] border-t border-[#d8ba82] pt-0.5">
                <span>SHOPKART MASCOT</span>
                <span className="text-[#e63946] font-bold">✕</span>
              </div>
              {/* Bubble Pointer Arrow pointing to Panda */}
              <div
                className="absolute top-5 -right-2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-[#2b1802]"
              />
            </div>
          )}

          {/* Mascot Panda Climbing Sprite */}
          <img
            src="/assets/panda_climbing.png"
            alt="Pixel Mascot Panda Climbing Bamboo"
            className="w-full h-auto drop-shadow-[2px_3px_0px_rgba(43,24,2,0.6)]"
            style={{
              imageRendering: "pixelated",
            }}
          />

          {/* Small Mascot Status Tag */}
          <div className="text-center -mt-2">
            <span className="inline-block bg-[#ffaa00] text-[#2b1802] font-pixel-body text-[7px] font-bold px-1.5 py-0.2 border border-[#2b1802] shadow-[1px_1px_0px_#2b1802]">
              {scrollDir === "down"
                ? "▼ CLIMBING DOWN"
                : scrollDir === "up"
                ? "▲ CLIMBING UP"
                : "🎋 MASCOT"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
