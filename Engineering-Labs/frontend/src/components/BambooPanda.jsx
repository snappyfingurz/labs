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
  const [easterEggVisible, setEasterEggVisible] = useState(false);
  const [eggState, setEggState] = useState("intact"); // 'intact' | 'cracking' | 'cracked'
  const [copiedCode, setCopiedCode] = useState(false);

  const lastScrollYRef = useRef(0);
  const scrollTimeoutRef = useRef(null);
  const quoteIndexRef = useRef(0);
  const bottomTriggeredRef = useRef(false);

  // Friendly, simple quotes
  const quotes = [
    "Hello! 👋",
    "Check out our new deals! 🛍️",
    "Welcome to ShopKart! ✨",
    "Found anything you like? 🎮",
    "Hope you find great stuff today! 🎋",
  ];

  // Track scroll position, direction, dimensions, and bottom easter egg trigger
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

      // Check if user scrolled to the very bottom of the page
      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );
      const isAtBottom = currentY > 150 && currentY + window.innerHeight >= docHeight - 120;
      if (isAtBottom && !bottomTriggeredRef.current) {
        bottomTriggeredRef.current = true;
        setSpeechText("You might wanna click on this... 👀");
        setEasterEggVisible(true);
      }

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
        document.body.scrollHeight
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

  // Handle click on panda (no leaves particle animation)
  const handlePandaClick = (e) => {
    e.stopPropagation();
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 400);

    // If currently near the bottom of the page, clicking opens the easter egg
    const docHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );
    const isCurrentlyAtBottom =
      window.scrollY > 150 &&
      window.scrollY + window.innerHeight >= docHeight - 150;
    if (isCurrentlyAtBottom) {
      setSpeechText("You might wanna click on this... 👀");
      setEasterEggVisible(true);
      return;
    }

    // Otherwise cycle friendly quotes
    const nextQuote = quotes[quoteIndexRef.current % quotes.length];
    quoteIndexRef.current += 1;
    setSpeechText(nextQuote);
  };

  const handleEggClick = (e) => {
    e.stopPropagation();
    if (eggState !== "intact") return;
    setEggState("cracking");
    setTimeout(() => {
      setEggState("cracked");
    }, 550);
  };

  const handleCloseBubble = (e) => {
    e.stopPropagation();
    setSpeechText("");
  };

  useEffect(() => {
    if (!speechText) return;
    const timer = setTimeout(() => setSpeechText(""), 4500);
    return () => clearTimeout(timer);
  }, [speechText]);

  // =========================================================
  // GEOMETRIC ALIGNMENT & HORIZONTAL POSITIONING
  // =========================================================
  // Header is max-w-6xl (1152px).
  // Available margin on right of header = (windowWidth - 1152) / 2.
  const margin = Math.max(0, (windowWidth - 1152) / 2);
  
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
  const STALK_WIDTH = 14; // px

  // In panda_climbing.png (size 654x1087):
  // With 0.48deg clockwise rotation around the bottom stalk (row 1063, col 420),
  // the entire stalk runs straight along col 420 -> (654 - 420) = 234px from right.
  // In a 120px wide container, stalk center is at: (120 * 234) / 654 = 42.94px from right edge.
  const STALK_CENTER_FROM_PANDA_RIGHT = (PANDA_WIDTH * 234) / 654;

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

  return (
    <div
      className="bamboo-climbing-container absolute top-0 right-0 pointer-events-none z-50"
      style={{ height: `${pageHeight}px`, width: "240px" }}
      aria-hidden="true"
    >
      {/* =========================================================
          VERTICAL CONTINUOUS BAMBOO STALK
          Runs all the way down through the right margin
          ========================================================= */}
      <div
        className="bamboo-pole absolute top-0 pointer-events-none"
        style={{
          right: `${backgroundStalkRight}px`,
          width: `${STALK_WIDTH}px`,
          height: `${pageHeight}px`,
          backgroundImage: "url('/assets/bamboo_stalk_tile.png')",
          backgroundRepeat: "repeat-y",
          backgroundSize: "14px auto",
          borderLeft: "1px solid #163608",
          borderRight: "1px solid #163608",
          boxShadow: "2px 0 0 rgba(0,0,0,0.12)",
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
        {/* Vertical Stride Animation Wrapper */}
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
          {/* Friendly Comic Speech Bubble - Positioned safely inside viewport even at top of page */}
          {speechText && (
            <div
              className="absolute top-2 -left-44 w-44 sm:top-3 sm:-left-48 sm:w-48 bg-[#fffdf0] border-2 border-[#2b1802] p-2 shadow-[3px_3px_0px_#2b1802] z-50 pointer-events-auto animate-bubble-pop"
              onClick={handleCloseBubble}
            >
              <p className="font-pixel-body text-[9px] sm:text-[10px] text-[#2b1802] leading-tight mb-1 font-bold">
                {speechText}
              </p>
              <div className="flex justify-between items-center text-[7px] text-[#8c5300] border-t border-[#d8ba82] pt-0.5">
                <span>SHOPKART</span>
                <span className="text-[#e63946] font-bold">✕</span>
              </div>
              {/* Bubble Pointer Arrow pointing to Panda */}
              <div
                className="absolute top-4 -right-2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[7px] border-l-[#2b1802]"
              />
            </div>
          )}

          {/* Uncracked / Cracking Pixel Egg held directly in Panda's hand */}
          {easterEggVisible && eggState !== "cracked" && (
            <div
              className="absolute top-[52%] left-[10px] z-50 pointer-events-auto flex flex-col items-center"
              onClick={handleEggClick}
            >
              <div
                className={`relative cursor-pointer select-none transition-transform ${
                  eggState === "intact"
                    ? "animate-egg-wobble hover:scale-115 active:scale-95"
                    : "animate-egg-crack"
                }`}
                title="Click to crack the egg in panda's hand!"
              >
                <svg
                  width="40"
                  height="49"
                  viewBox="0 0 54 66"
                  className="overflow-visible filter drop-shadow-[2px_3px_0px_rgba(43,24,2,0.6)]"
                  style={{ shapeRendering: "crispEdges" }}
                >
                  {/* Top Half Shell */}
                  <g>
                    {/* Dark Brown Pixel Outline */}
                    <path
                      d="M18 4 h18 v4 h8 v6 h4 v10 h4 v10 h-6 l-6 4 l-6 -4 l-6 4 l-6 -4 l-6 4 l-6 -4 H2 v-10 h4 v-10 h4 v-6 h8 z"
                      fill="#2b1802"
                    />
                    {/* Egg Cream Base */}
                    <path
                      d="M20 7 h14 v4 h8 v6 h4 v10 h-2 l-6 3 l-6 -4 l-6 4 l-6 -4 l-6 4 l-6 -4 l-2 1 v-7 h2 v-6 h4 v-4 h8 z"
                      fill="#ffefc2"
                    />
                    {/* Pixel Highlights & Stripes */}
                    <rect x="22" y="9" width="10" height="3" fill="#ffffff" />
                    <rect x="14" y="15" width="26" height="4" fill="#14b8a6" />
                    <rect x="18" y="16" width="4" height="2" fill="#99f6e4" />
                    <rect x="28" y="16" width="4" height="2" fill="#99f6e4" />
                    <rect x="10" y="22" width="34" height="4" fill="#f59e0b" />
                    <rect x="14" y="23" width="3" height="2" fill="#fef08a" />
                    <rect x="24" y="23" width="3" height="2" fill="#fef08a" />
                    <rect x="34" y="23" width="3" height="2" fill="#fef08a" />
                  </g>

                  {/* Bottom Half Shell */}
                  <g>
                    {/* Dark Brown Pixel Outline */}
                    <path
                      d="M2 34 l6 -4 l6 4 l6 -4 l6 4 l6 -4 l6 4 l6 -4 h6 v12 h-4 v8 h-6 v6 h-8 v4 h-14 v-4 h-8 v-6 h-6 v-8 H2 z"
                      fill="#2b1802"
                    />
                    {/* Egg Cream Base */}
                    <path
                      d="M5 36 l5 -3 l6 4 l6 -4 l6 4 l6 -4 l6 4 l5 -3 v8 h-4 v8 h-6 v6 h-8 v3 h-10 v-3 h-8 v-6 h-4 v-8 z"
                      fill="#ffefc2"
                    />
                    {/* Coral & Mint Pattern */}
                    <rect x="6" y="38" width="42" height="4" fill="#e76f51" />
                    <rect x="10" y="39" width="4" height="2" fill="#fca5a5" />
                    <rect x="24" y="39" width="4" height="2" fill="#fca5a5" />
                    <rect x="36" y="39" width="4" height="2" fill="#fca5a5" />
                    <rect x="10" y="44" width="34" height="4" fill="#14b8a6" />
                    <rect x="14" y="50" width="26" height="4" fill="#f59e0b" />
                  </g>

                  {/* Flashing golden crack line when cracking */}
                  {eggState === "cracking" && (
                    <path
                      d="M2 34 l6 -4 l6 4 l6 -4 l6 4 l6 -4 l6 4 l6 -4 l6 4"
                      stroke="#ffeb3b"
                      strokeWidth="3"
                      fill="none"
                      className="animate-pulse"
                    />
                  )}
                </svg>

                {/* Retro Floating Click Badge */}
                {eggState === "intact" && (
                  <div className="mt-1 bg-[#2b1802] text-[#ffe6a7] border border-[#ffe6a7] px-1.5 py-0.5 text-[6.5px] font-pixel-body shadow-[1px_1px_0px_#000] text-center tracking-wider whitespace-nowrap">
                    👆 CLICK ME
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cracked Shell lingering in panda's hand */}
          {easterEggVisible && eggState === "cracked" && (
            <div className="absolute top-[54%] left-[12px] z-40 pointer-events-none w-8 h-4 -rotate-6">
              <svg viewBox="0 0 54 32" className="w-full h-full filter drop-shadow-[1px_2px_0px_rgba(0,0,0,0.4)]">
                <path
                  d="M2 2 l6 -2 l6 4 l6 -4 l6 4 l6 -4 l6 4 l6 -4 h6 v10 h-4 v8 h-6 v6 h-8 v4 h-14 v-4 h-8 v-6 h-6 v-8 H2 z"
                  fill="#2b1802"
                />
                <path
                  d="M5 4 l5 -2 l6 4 l6 -4 l6 4 l6 -4 l6 4 l5 -2 v6 h-4 v8 h-6 v6 h-8 v3 h-10 v-3 h-8 v-6 h-4 v-8 z"
                  fill="#ffefc2"
                />
                <rect x="6" y="8" width="42" height="4" fill="#e76f51" />
                <rect x="10" y="14" width="34" height="4" fill="#14b8a6" />
              </svg>
            </div>
          )}

          {/* Cracked State: Clean First-Time User Coupon Card (NO 🥚 emoji) */}
          {easterEggVisible && eggState === "cracked" && (
            <div
              className="absolute top-4 -left-52 sm:-left-56 z-50 pointer-events-auto flex flex-col items-center animate-bubble-pop"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Split Top Shell */}
              <div className="w-10 h-5 mb-1 -translate-y-1 -rotate-6">
                <svg viewBox="0 0 54 34" className="w-full h-full filter drop-shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
                  <path
                    d="M18 4 h18 v4 h8 v6 h4 v10 h4 v10 h-6 l-6 4 l-6 -4 l-6 4 l-6 -4 l-6 4 l-6 -4 H2 v-10 h4 v-10 h4 v-6 h8 z"
                    fill="#2b1802"
                  />
                  <path
                    d="M20 7 h14 v4 h8 v6 h4 v10 h-2 l-6 3 l-6 -4 l-6 4 l-6 -4 l-6 4 l-6 -4 l-2 1 v-7 h2 v-6 h4 v-4 h8 z"
                    fill="#ffefc2"
                  />
                  <rect x="14" y="15" width="26" height="4" fill="#14b8a6" />
                  <rect x="10" y="22" width="34" height="4" fill="#f59e0b" />
                </svg>
              </div>

              {/* Clean Retro First-Time User Coupon Token - NO 🥚 emoji */}
              <div className="bg-[#fffdf5] border-2 border-[#2b1802] p-2.5 shadow-[4px_4px_0px_#2b1802] w-48 text-center select-none">
                <div className="flex items-center justify-between border-b border-[#e2c18d] pb-1 mb-2 text-[8px] font-pixel-title text-[#2b1802]">
                  <span className="font-bold tracking-wider">
                    EASTER EGG UNLOCKED
                  </span>
                  <button
                    type="button"
                    onClick={() => setEasterEggVisible(false)}
                    className="text-[#e63946] hover:text-black font-bold text-[9px] cursor-pointer px-1"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-white border-2 border-dashed border-[#2b1802] py-1.5 px-2 mb-2">
                  <span className="font-pixel-title text-[12px] tracking-widest text-[#d32f2f] font-black select-all">
                    PANDA5
                  </span>
                </div>

                <div className="font-pixel-body text-[8.5px] text-[#2b1802] font-bold leading-tight mb-0.5">
                  5% OFF (UPTO ₹500)
                </div>
                <div className="text-[7.5px] text-[#7d4800] font-pixel-body mb-2.5">
                  FIRST-TIME USERS ONLY
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText("PANDA5");
                    }
                    localStorage.setItem(
                      "shopkart_coupon",
                      JSON.stringify({ code: "PANDA5", discountPercent: 5, maxDiscount: 500, firstTimeOnly: true })
                    );
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2500);
                  }}
                  className="pixel-btn pixel-btn-primary w-full py-1 text-[8px] flex items-center justify-center gap-1 cursor-pointer"
                >
                  {copiedCode ? "COPIED! ✅" : "📋 COPY CODE"}
                </button>
              </div>

              {/* Split Bottom Shell */}
              <div className="w-10 h-5 mt-1 translate-y-1 rotate-3">
                <svg viewBox="0 0 54 32" className="w-full h-full filter drop-shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
                  <path
                    d="M2 2 l6 -2 l6 4 l6 -4 l6 4 l6 -4 l6 4 l6 -4 h6 v10 h-4 v8 h-6 v6 h-8 v4 h-14 v-4 h-8 v-6 h-6 v-8 H2 z"
                    fill="#2b1802"
                  />
                  <path
                    d="M5 4 l5 -2 l6 4 l6 -4 l6 4 l6 -4 l6 4 l5 -2 v6 h-4 v8 h-6 v6 h-8 v3 h-10 v-3 h-8 v-6 h-4 v-8 z"
                    fill="#ffefc2"
                  />
                  <rect x="6" y="8" width="42" height="4" fill="#e76f51" />
                  <rect x="10" y="14" width="34" height="4" fill="#14b8a6" />
                </svg>
              </div>
            </div>
          )}

          {/* Mascot Panda Climbing Sprite with top rotated slightly right to line up perfectly with background stalk */}
          <div
            className="w-full h-auto overflow-hidden"
            style={{
              clipPath: "inset(2.2% 0 2.2% 0)",
              transform: "rotate(0.48deg)",
              transformOrigin: "64.2% 97.8%",
            }}
          >
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
    </div>
  );
}
