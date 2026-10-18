import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "Guest User",
    email: "guest@example.com",
    phone: "1234567890",
  });

  // Window Manager State for Desktop Windows with movable coordinates and pop-out state
  const [windows, setWindows] = useState({
    account: {
      id: "account",
      title: "Customer Account",
      icon: "👤",
      isOpen: true,
      isMinimized: false,
      isPoppedOut: false,
      position: { x: 30, y: 95 },
      zIndex: 40,
    },
    guarantee: {
      id: "guarantee",
      title: "Store Guarantee",
      icon: "📜",
      isOpen: true,
      isMinimized: false,
      isPoppedOut: false,
      position: { x: 50, y: 340 },
      zIndex: 40,
    },
    categories: {
      id: "categories",
      title: "Product Categories",
      icon: "🛍",
      isOpen: true,
      isMinimized: false,
      isPoppedOut: false,
      position: { x: 380, y: 95 },
      zIndex: 40,
    },
    assistant: {
      id: "assistant",
      title: "Shopping Assistant",
      icon: "🐼",
      isOpen: true,
      isMinimized: false,
      isPoppedOut: false,
      position: { x: 410, y: 350 },
      zIndex: 40,
    },
  });

  const [activeDrag, setActiveDrag] = useState(null); // { id, startX, startY, origX, origY }
  const [highestZ, setHighestZ] = useState(50);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [showComicBubble, setShowComicBubble] = useState(false);
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-dismiss the comic notification bubble after 7 seconds
  useEffect(() => {
    if (showComicBubble) {
      const timer = setTimeout(() => {
        setShowComicBubble(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [showComicBubble]);

  const bringToFront = (id) => {
    setHighestZ((prev) => {
      const nextZ = prev + 1;
      setWindows((wPrev) => ({
        ...wPrev,
        [id]: { ...wPrev[id], zIndex: nextZ },
      }));
      return nextZ;
    });
  };

  const togglePopout = (id) => {
    bringToFront(id);
    setWindows((prev) => {
      const win = prev[id];
      const willBePopped = !win.isPoppedOut;
      return {
        ...prev,
        [id]: {
          ...win,
          isOpen: true,
          isMinimized: false,
          isPoppedOut: willBePopped,
        },
      };
    });
  };

  const minimizeWindow = (id) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true },
    }));
  };

  const closeWindow = (id) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false, isMinimized: false, isPoppedOut: false },
    }));
    setShowComicBubble(true);
  };

  const restoreWindow = (id) => {
    bringToFront(id);
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: true, isMinimized: false },
    }));
  };

  const restoreAll = () => {
    setWindows((prev) => {
      const next = {};
      Object.keys(prev).forEach((key) => {
        next[key] = { ...prev[key], isOpen: true, isMinimized: false };
      });
      return next;
    });
  };

  // Window drag handlers
  const handleDragStart = (id, e) => {
    if (e.target.closest("button") || e.target.closest("a") || e.target.closest("input")) return;
    bringToFront(id);
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX === undefined || clientY === undefined) return;

    const win = windows[id];
    setActiveDrag({
      id,
      startX: clientX,
      startY: clientY,
      origX: win.position?.x ?? 30,
      origY: win.position?.y ?? 100,
    });
  };

  useEffect(() => {
    if (!activeDrag) return;

    const handlePointerMove = (e) => {
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      if (clientX === undefined || clientY === undefined) return;

      const deltaX = clientX - activeDrag.startX;
      const deltaY = clientY - activeDrag.startY;

      const newX = Math.max(8, Math.min(window.innerWidth - 120, activeDrag.origX + deltaX));
      const newY = Math.max(8, Math.min(window.innerHeight - 80, activeDrag.origY + deltaY));

      setWindows((prev) => ({
        ...prev,
        [activeDrag.id]: {
          ...prev[activeDrag.id],
          position: { x: newX, y: newY },
        },
      }));
    };

    const handlePointerUp = () => {
      setActiveDrag(null);
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [activeDrag]);

  useEffect(() => {
    let cancelled = false;

    api.post("/customers/me")
      .then((response) => {
        if (!cancelled && response.data) {
          setData(response.data);
        }
      })
      .catch((err) => {
        console.log("Customer session error", err);
        if (!cancelled) {
          navigate("/login");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const isLeftVisible =
    (windows.account.isOpen && !windows.account.isMinimized) ||
    (windows.guarantee.isOpen && !windows.guarantee.isMinimized);

  const isRightVisible =
    (windows.categories.isOpen && !windows.categories.isMinimized) ||
    (windows.assistant.isOpen && !windows.assistant.isMinimized);

  const hasAnyVisible = isLeftVisible || isRightVisible;

  return (
    <div className="min-h-screen">
      <Navbar showBambooPanda={true} />

      <main className="max-w-6xl mx-auto px-3 pb-24">
        {/* All Windows Closed / Minimized Empty State */}
        {!hasAnyVisible && (
          <div className="pixel-box p-12 text-center my-8 bg-[#fffdf5]">
            <span className="text-4xl block mb-2">🖥</span>
            <h2 className="font-pixel-title text-sm text-[#4d2800] mb-2">
              ALL WINDOWS CLOSED OR MINIMIZED
            </h2>
            <p className="font-pixel-body text-xs text-gray-600 mb-4">
              Access closed windows from the START menu in the bottom-left!
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setStartMenuOpen(true);
                  setShowComicBubble(false);
                }}
                className="pixel-btn pixel-btn-primary"
              >
                OPEN START MENU ⛩
              </button>
              <button
                type="button"
                onClick={restoreAll}
                className="pixel-btn pixel-btn-dark"
              >
                RESTORE ALL ▶
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* ================= LEFT COLUMN ================= */}
          {isLeftVisible && (
            <div
              className={`${
                isRightVisible ? "md:col-span-5" : "md:col-span-12"
              } flex flex-col gap-4`}
            >
              {/* Box 1: Customer Profile */}
              {windows.account.isOpen && !windows.account.isMinimized && (
                <div
                  className={`pixel-box ${
                      windows.account.isPoppedOut
                        ? "shadow-[8px_8px_0px_#000000] border-3 border-[#2a1502]"
                        : ""
                    }`}
                    style={
                      windows.account.isPoppedOut
                        ? {
                            position: "fixed",
                            left: `${windows.account.position.x}px`,
                            top: `${windows.account.position.y}px`,
                            width: "min(calc(100vw - 32px), 480px)",
                            zIndex: windows.account.zIndex || 40,
                          }
                        : {}
                    }
                    onMouseDown={() => {
                      if (windows.account.isPoppedOut) bringToFront("account");
                    }}
                    onTouchStart={() => {
                      if (windows.account.isPoppedOut) bringToFront("account");
                    }}
                  >
                    <div
                      className={`pixel-header-bar ${
                        windows.account.isPoppedOut
                          ? "cursor-grab active:cursor-grabbing bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 select-none"
                          : ""
                      }`}
                      onMouseDown={
                        windows.account.isPoppedOut
                          ? (e) => handleDragStart("account", e)
                          : undefined
                      }
                      onTouchStart={
                        windows.account.isPoppedOut
                          ? (e) => handleDragStart("account", e)
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2 select-none">
                        <span>🪪</span>
                        <span>CUSTOMER ACCOUNT</span>
                        {windows.account.isPoppedOut && (
                          <span className="text-[7px] text-black bg-[#ffeaa7] border border-black px-1 font-pixel-body font-bold">
                            ✥ DRAG
                          </span>
                        )}
                      </div>
                      <div className="pixel-header-buttons">
                        <button
                          type="button"
                          onClick={() => minimizeWindow("account")}
                          className="pixel-mini-btn btn-min"
                          title="Minimize"
                        >
                          _
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePopout("account")}
                          className="pixel-mini-btn btn-max"
                          title={
                            windows.account.isPoppedOut
                              ? "Dock in Grid"
                              : "Pop Out Window (Move Freely)"
                          }
                        >
                          {windows.account.isPoppedOut ? "❐" : "□"}
                        </button>
                        <button
                          type="button"
                          onClick={() => closeWindow("account")}
                          className="pixel-mini-btn btn-close"
                          title="Close"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-[#fffdf5]">
                      <div className="flex items-start gap-4">
                        <div className="pixel-frame w-20 h-20 bg-[#ffd269] flex items-center justify-center shrink-0">
                          <span className="text-3xl">👤</span>
                        </div>
                        <div className="font-pixel-body text-xs leading-relaxed">
                          <div className="mb-2">
                            <span className="text-gray-500 block text-[10px]">NAME:</span>
                            <strong className="text-[#8c3d00] text-sm">{data.name}</strong>
                          </div>
                          <div className="mb-2">
                            <span className="text-gray-500 block text-[10px]">EMAIL:</span>
                            <span className="text-black break-all">{data.email}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px]">PHONE:</span>
                            <span className="text-black">{data.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t-2 border-[#e6b86a] flex justify-end items-center text-[11px] font-pixel-body">
                        <Link to="/products" className="pixel-btn text-[9px] py-1 px-3">
                          SHOP NOW ▶
                        </Link>
                      </div>
                    </div>
                  </div>
              )}

              {/* Box 2: Store Policies & Guarantee */}
              {windows.guarantee.isOpen && !windows.guarantee.isMinimized && (
                <div
                  className={`pixel-box ${
                      windows.guarantee.isPoppedOut
                        ? "shadow-[8px_8px_0px_#000000] border-3 border-[#2a1502]"
                        : ""
                    }`}
                    style={
                      windows.guarantee.isPoppedOut
                        ? {
                            position: "fixed",
                            left: `${windows.guarantee.position.x}px`,
                            top: `${windows.guarantee.position.y}px`,
                            width: "min(calc(100vw - 32px), 480px)",
                            zIndex: windows.guarantee.zIndex || 40,
                          }
                        : {}
                    }
                    onMouseDown={() => {
                      if (windows.guarantee.isPoppedOut) bringToFront("guarantee");
                    }}
                    onTouchStart={() => {
                      if (windows.guarantee.isPoppedOut) bringToFront("guarantee");
                    }}
                  >
                    <div
                      className={`pixel-header-bar bg-gradient-to-r from-amber-400 to-amber-500 ${
                        windows.guarantee.isPoppedOut
                          ? "cursor-grab active:cursor-grabbing select-none"
                          : ""
                      }`}
                      onMouseDown={
                        windows.guarantee.isPoppedOut
                          ? (e) => handleDragStart("guarantee", e)
                          : undefined
                      }
                      onTouchStart={
                        windows.guarantee.isPoppedOut
                          ? (e) => handleDragStart("guarantee", e)
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2 select-none">
                        <span>📜</span>
                        <span>STORE GUARANTEE</span>
                        {windows.guarantee.isPoppedOut && (
                          <span className="text-[7px] text-black bg-[#ffeaa7] border border-black px-1 font-pixel-body font-bold">
                            ✥ DRAG
                          </span>
                        )}
                      </div>
                      <div className="pixel-header-buttons">
                        <button
                          type="button"
                          onClick={() => minimizeWindow("guarantee")}
                          className="pixel-mini-btn btn-min"
                          title="Minimize"
                        >
                          _
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePopout("guarantee")}
                          className="pixel-mini-btn btn-max"
                          title={
                            windows.guarantee.isPoppedOut
                              ? "Dock in Grid"
                              : "Pop Out Window (Move Freely)"
                          }
                        >
                          {windows.guarantee.isPoppedOut ? "❐" : "□"}
                        </button>
                        <button
                          type="button"
                          onClick={() => closeWindow("guarantee")}
                          className="pixel-mini-btn btn-close"
                          title="Close"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="p-3 bg-[#fff8e7] font-pixel-body text-xs text-[#4d2800] leading-normal border-t border-[#d4993a]">
                      <p className="mb-2">
                        ★ Quality guaranteed across all featured products in our store.
                      </p>
                      <p className="mb-2">
                        ★ Fast, secure and encrypted checkout. Instant order fulfillment!
                      </p>
                      <p className="text-[10px] text-gray-500">
                        © SHOPKART. ALL RIGHTS RESERVED.
                      </p>
                    </div>
                  </div>
              )}

            </div>
          )}

          {/* ================= RIGHT COLUMN ================= */}
          {isRightVisible && (
            <div
              className={`${
                isLeftVisible ? "md:col-span-7" : "md:col-span-12"
              } flex flex-col gap-4`}
            >
              
              {/* Box 1: Featured Merch / Quick Portal */}
              {windows.categories.isOpen && !windows.categories.isMinimized && (
                <div
                  className={`pixel-box ${
                      windows.categories.isPoppedOut
                        ? "shadow-[8px_8px_0px_#000000] border-3 border-[#2a1502]"
                        : ""
                    }`}
                    style={
                      windows.categories.isPoppedOut
                        ? {
                            position: "fixed",
                            left: `${windows.categories.position.x}px`,
                            top: `${windows.categories.position.y}px`,
                            width: "min(calc(100vw - 32px), 520px)",
                            zIndex: windows.categories.zIndex || 40,
                          }
                        : {}
                    }
                    onMouseDown={() => {
                      if (windows.categories.isPoppedOut) bringToFront("categories");
                    }}
                    onTouchStart={() => {
                      if (windows.categories.isPoppedOut) bringToFront("categories");
                    }}
                  >
                    <div
                      className={`pixel-header-bar ${
                        windows.categories.isPoppedOut
                          ? "cursor-grab active:cursor-grabbing bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 select-none"
                          : ""
                      }`}
                      onMouseDown={
                        windows.categories.isPoppedOut
                          ? (e) => handleDragStart("categories", e)
                          : undefined
                      }
                      onTouchStart={
                        windows.categories.isPoppedOut
                          ? (e) => handleDragStart("categories", e)
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2 select-none">
                        <span>🛍</span>
                        <span>PRODUCT CATEGORIES</span>
                        {windows.categories.isPoppedOut && (
                          <span className="text-[7px] text-black bg-[#ffeaa7] border border-black px-1 font-pixel-body font-bold">
                            ✥ DRAG
                          </span>
                        )}
                      </div>
                      <div className="pixel-header-buttons">
                        <button
                          type="button"
                          onClick={() => minimizeWindow("categories")}
                          className="pixel-mini-btn btn-min"
                          title="Minimize"
                        >
                          _
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePopout("categories")}
                          className="pixel-mini-btn btn-max"
                          title={
                            windows.categories.isPoppedOut
                              ? "Dock in Grid"
                              : "Pop Out Window (Move Freely)"
                          }
                        >
                          {windows.categories.isPoppedOut ? "❐" : "□"}
                        </button>
                        <button
                          type="button"
                          onClick={() => closeWindow("categories")}
                          className="pixel-mini-btn btn-close"
                          title="Close"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-[#fffdf5]">
                      <p className="font-pixel-body text-xs text-[#522900] mb-4">
                        Welcome to ShopKart! Discover our curated selection of electronics, fashion, books, and home essentials.
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                        {[
                          { label: "ELECTRONICS", category: "Electronics", icon: "🕹" },
                          { label: "FASHION", category: "Fashion", icon: "👘" },
                          { label: "BOOKS", category: "Books", icon: "📜" },
                          { label: "HOME & LIVING", category: "Home", icon: "🏮" },
                        ].map((cat) => (
                          <Link
                            key={cat.label}
                            to={`/products?category=${cat.category}`}
                            className="border-2 border-[#5c2e00] bg-[#fff5db] hover:bg-[#ffe399] p-3 text-center shadow-[2px_2px_0px_#331a00] transition-transform active:translate-x-0.5 active:translate-y-0.5 flex flex-col items-center justify-center gap-1 text-decoration-none"
                          >
                            <span className="text-2xl">{cat.icon}</span>
                            <span className="font-pixel-title text-[8px] text-[#421d00] mt-1 block">
                              {cat.label}
                            </span>
                          </Link>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link
                          to="/products"
                          className="pixel-btn pixel-btn-primary flex-1 text-center"
                        >
                          BROWSE ALL PRODUCTS ▶
                        </Link>
                        <Link
                          to="/orders"
                          className="pixel-btn pixel-btn-dark"
                        >
                          ORDER HISTORY 📦
                        </Link>
                      </div>
                    </div>
                  </div>
              )}

              {/* Box 2: Mascot Companion Box */}
              {windows.assistant.isOpen && !windows.assistant.isMinimized && (
                <div
                  className={`pixel-box ${
                      windows.assistant.isPoppedOut
                        ? "shadow-[8px_8px_0px_#000000] border-3 border-[#2a1502]"
                        : ""
                    }`}
                    style={
                      windows.assistant.isPoppedOut
                        ? {
                            position: "fixed",
                            left: `${windows.assistant.position.x}px`,
                            top: `${windows.assistant.position.y}px`,
                            width: "min(calc(100vw - 32px), 480px)",
                            zIndex: windows.assistant.zIndex || 40,
                          }
                        : {}
                    }
                    onMouseDown={() => {
                      if (windows.assistant.isPoppedOut) bringToFront("assistant");
                    }}
                    onTouchStart={() => {
                      if (windows.assistant.isPoppedOut) bringToFront("assistant");
                    }}
                  >
                    <div
                      className={`pixel-header-bar ${
                        windows.assistant.isPoppedOut
                          ? "cursor-grab active:cursor-grabbing bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 select-none"
                          : ""
                      }`}
                      onMouseDown={
                        windows.assistant.isPoppedOut
                          ? (e) => handleDragStart("assistant", e)
                          : undefined
                      }
                      onTouchStart={
                        windows.assistant.isPoppedOut
                          ? (e) => handleDragStart("assistant", e)
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2 select-none">
                        <span>🐼</span>
                        <span>SHOPPING ASSISTANT</span>
                        {windows.assistant.isPoppedOut && (
                          <span className="text-[7px] text-black bg-[#ffeaa7] border border-black px-1 font-pixel-body font-bold">
                            ✥ DRAG
                          </span>
                        )}
                      </div>
                      <div className="pixel-header-buttons">
                        <button
                          type="button"
                          onClick={() => minimizeWindow("assistant")}
                          className="pixel-mini-btn btn-min"
                          title="Minimize"
                        >
                          _
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePopout("assistant")}
                          className="pixel-mini-btn btn-max"
                          title={
                            windows.assistant.isPoppedOut
                              ? "Dock in Grid"
                              : "Pop Out Window (Move Freely)"
                          }
                        >
                          {windows.assistant.isPoppedOut ? "❐" : "□"}
                        </button>
                        <button
                          type="button"
                          onClick={() => closeWindow("assistant")}
                          className="pixel-mini-btn btn-close"
                          title="Close"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-[#fffbf0] flex flex-col sm:flex-row items-center gap-4">
                      <div className="pixel-frame w-28 h-28 bg-[#f5b025] shrink-0 overflow-hidden">
                        <img
                          src="/assets/pixel_panda.jpg"
                          alt="Pixel Mascot Panda"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="relative bg-white border-2 border-[#2b1802] p-3 shadow-[3px_3px_0px_#2b1802] font-pixel-body text-xs text-[#2b1802]">
                          <p className="mb-2">
                            “ Welcome to ShopKart! Check out our latest arrivals and don't forget to save your favorite items to your wishlist! ”
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Link to="/wishlist" className="pixel-btn text-[8px] py-1 px-2">
                              MY WISHLIST ♥
                            </Link>
                            <Link to="/cart" className="pixel-btn pixel-btn-success text-[8px] py-1 px-2">
                              VIEW CART 🛒
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              )}

            </div>
          )}

        </div>
      </main>

      {/* Comic Action Starburst Alert Notification (Custom SVG, 100% Transparent Background, No Bouncing) */}
      {showComicBubble && (
        <div className="fixed bottom-14 sm:bottom-16 left-2 sm:left-6 z-50 select-none animate-bubble-pop">
          <div
            className="relative cursor-pointer group w-[320px] sm:w-[370px] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => {
              setStartMenuOpen(true);
              setShowComicBubble(false);
            }}
            title="Click to open Start Menu"
          >
            {/* 100% Vector Comic Starburst Rendered in Code (Fully Transparent Outside) */}
            <svg
              viewBox="0 0 410 230"
              className="w-full h-auto overflow-visible filter drop-shadow-[6px_6px_0px_#000000]"
            >
              <defs>
                <pattern
                  id="comicHalftone"
                  x="0"
                  y="0"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="5" cy="5" r="2.4" fill="#e63946" />
                </pattern>
                <mask id="burstMask">
                  <polygon
                    points="356,115 374,131 344,149 355,168 322,169 319,190 290,190 275,208 247,199 215,215 193,195 149,205 139,176 64,163 103,120 50,110 95,80 125,85 145,45 180,80 205,30 235,75 265,40 285,70 315,60 320,85 355,90"
                    fill="#ffffff"
                  />
                </mask>
              </defs>

              {/* Solid Black Offset Shadow */}
              <polygon
                points="360,119 378,135 348,153 359,172 326,173 323,194 294,194 279,212 251,203 219,219 197,199 153,209 143,180 68,167 107,124 54,114 99,84 129,89 149,49 184,84 209,34 239,79 269,44 289,74 319,64 324,89 359,94"
                fill="#000000"
              />

              {/* Main Comic Starburst */}
              <polygon
                points="356,115 374,131 344,149 355,168 322,169 319,190 290,190 275,208 247,199 215,215 193,195 149,205 139,176 64,163 103,120 50,110 95,80 125,85 145,45 180,80 205,30 235,75 265,40 285,70 315,60 320,85 355,90"
                fill="#ffdd00"
                stroke="#000000"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />

              {/* Ben-Day Halftone Dots Around Outer Spikes */}
              <g mask="url(#burstMask)">
                <ellipse cx="85" cy="115" rx="55" ry="60" fill="url(#comicHalftone)" opacity="0.9" />
                <ellipse cx="330" cy="120" rx="50" ry="60" fill="url(#comicHalftone)" opacity="0.9" />
                <ellipse cx="215" cy="188" rx="60" ry="25" fill="url(#comicHalftone)" opacity="0.8" />
                {/* Solid Yellow Core to keep text crisp and clear */}
                <ellipse cx="212" cy="116" rx="90" ry="46" fill="#ffdd00" />
              </g>

              {/* Inner Inking Accent */}
              <polygon
                points="356,115 374,131 344,149 355,168 322,169 319,190 290,190 275,208 247,199 215,215 193,195 149,205 139,176 64,163 103,120 50,110 95,80 125,85 145,45 180,80 205,30 235,75 265,40 285,70 315,60 320,85 355,90"
                fill="none"
                stroke="#000000"
                strokeWidth="1.5"
              />
            </svg>

            {/* Centered Text inside the solid yellow core */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-10 py-5 text-center pointer-events-none">
              <span className="font-pixel-title text-[9px] sm:text-[10px] text-[#2b1802] leading-snug uppercase font-black tracking-tight drop-shadow-[1px_1px_0px_#ffffff] max-w-[200px]">
                CLOSED WINDOWS CAN BE ACCESSED FROM THE START MENU!!
              </span>
              <span className="text-[8px] font-pixel-body text-[#8b0000] font-bold mt-1.5 bg-[#ffffff]/90 px-2 py-0.5 border border-[#000000] shadow-[2px_2px_0px_#000000]">
                OPEN START MENU ⛩
              </span>
            </div>

            {/* Comic Dismiss ✕ Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowComicBubble(false);
              }}
              className="absolute top-1 right-7 bg-[#000000] text-[#ffffff] hover:bg-[#e63946] border border-[#ffffff] w-5 h-5 flex items-center justify-center text-[9px] font-bold z-10 shadow-[2px_2px_0px_rgba(0,0,0,0.6)] cursor-pointer"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Retro OS Taskbar fixed at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#e69d10] border-t-3 border-[#2a1502] px-3 py-1.5 flex items-center justify-between shadow-[0_-3px_0_#2a1502]">
        {/* Left: Start Menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              setStartMenuOpen(!startMenuOpen);
              setShowComicBubble(false);
            }}
            className="pixel-btn text-[9px] py-1 px-3 bg-[#ffd571] text-[#2a1502] flex items-center gap-1.5 shadow-[1px_1px_0px_#000]"
          >
            <span>⛩</span>
            <span>START</span>
            <span className="text-[7px]">{startMenuOpen ? "▼" : "▲"}</span>
          </button>

          {startMenuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-64 pixel-box bg-[#fffdf5] p-2 shadow-[4px_4px_0px_#000] z-50">
              <div className="pixel-header-bar mb-2">
                <span>TASK MANAGER</span>
                <button
                  type="button"
                  onClick={() => setStartMenuOpen(false)}
                  className="pixel-mini-btn btn-close"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-col gap-1 text-[9px] font-pixel-body mb-2">
                {Object.values(windows).map((w) => {
                  const isVisible = w.isOpen && !w.isMinimized;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        if (isVisible) {
                          minimizeWindow(w.id);
                        } else {
                          restoreWindow(w.id);
                        }
                        setStartMenuOpen(false);
                      }}
                      className="flex items-center justify-between p-1.5 hover:bg-[#ffeaa7] border border-transparent hover:border-black text-left"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{w.icon}</span>
                        <span>{w.title}</span>
                      </div>
                      <span className={`text-[7px] font-bold ${isVisible ? "text-green-700" : !w.isOpen ? "text-red-700 font-extrabold" : "text-amber-700"}`}>
                        {isVisible ? (w.isPoppedOut ? "[FLOATING]" : "[OPEN]") : !w.isOpen ? "[CLOSED - OPEN ▶]" : "[MINIMIZED]"}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-[#d8ba82] flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    restoreAll();
                    setStartMenuOpen(false);
                  }}
                  className="pixel-btn pixel-btn-primary flex-1 text-[8px] py-1"
                >
                  RESTORE ALL
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center: Minimized Window buttons in Taskbar (CLOSED WINDOWS DO NOT SHOW HERE) */}
        <div className="flex items-center gap-2 overflow-x-auto mx-2 flex-1 scrollbar-none">
          {Object.values(windows).map((w) => {
            // ONLY show minimized windows. Closed windows DO NOT show up in the bottom taskbar!
            if (!w.isOpen || !w.isMinimized) return null;

            return (
              <button
                key={w.id}
                type="button"
                onClick={() => restoreWindow(w.id)}
                className="pixel-btn text-[8px] py-1 px-2.5 flex items-center gap-1.5 shrink-0 shadow-[1px_1px_0px_#000] cursor-pointer transition-transform hover:scale-105 active:scale-95 bg-[#fff3cc] text-[#8c4b00] border-[#8c4b00] hover:bg-[#ffe399]"
                title={`Restore ${w.title}`}
              >
                <span>{w.icon}</span>
                <span className="font-bold">{w.title}</span>
                <span className="text-[7px] px-1 py-0.5 rounded font-mono bg-[#2a1502] text-yellow-300">
                  _ RESTORE
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Retro Digital Clock */}
        <div className="border-2 border-[#2a1502] bg-[#fffdf5] px-2.5 py-1 text-[9px] font-pixel-body text-[#2a1502] shadow-[inset_1px_1px_0_#996600] shrink-0 font-bold">
          {time}
        </div>
      </div>
    </div>
  );
}

export default Home;