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

  // Window Manager State for Desktop Windows
  const [windows, setWindows] = useState({
    account: { id: "account", title: "Customer Account", icon: "👤", isOpen: true, isMinimized: false, isMaximized: false },
    guarantee: { id: "guarantee", title: "Store Guarantee", icon: "📜", isOpen: true, isMinimized: false, isMaximized: false },
    categories: { id: "categories", title: "Product Categories", icon: "🛍", isOpen: true, isMinimized: false, isMaximized: false },
    assistant: { id: "assistant", title: "Shopping Assistant", icon: "🐼", isOpen: true, isMinimized: false, isMaximized: false },
  });

  const [startMenuOpen, setStartMenuOpen] = useState(false);
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

  const minimizeWindow = (id) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true, isMaximized: false },
    }));
  };

  const closeWindow = (id) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false, isMinimized: false, isMaximized: false },
    }));
  };

  const toggleMaximize = (id) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: true,
        isMinimized: false,
        isMaximized: !prev[id].isMaximized,
      },
    }));
  };

  const restoreWindow = (id) => {
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
      <Navbar />

      <main className="max-w-6xl mx-auto px-3 pb-20">
        {/* Backdrop for Maximized Windows */}
        {Object.values(windows).some((w) => w.isMaximized) && (
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => {
              setWindows((prev) => {
                const next = {};
                Object.keys(prev).forEach((k) => {
                  next[k] = { ...prev[k], isMaximized: false };
                });
                return next;
              });
            }}
          />
        )}

        {/* All Windows Closed / Minimized Empty State */}
        {!hasAnyVisible && (
          <div className="pixel-box p-12 text-center my-8 bg-[#fffdf5]">
            <span className="text-4xl block mb-2">🖥</span>
            <h2 className="font-pixel-title text-sm text-[#4d2800] mb-2">
              ALL WINDOWS MINIMIZED
            </h2>
            <p className="font-pixel-body text-xs text-gray-600 mb-4">
              Click any window in the taskbar below to restore it.
            </p>
            <button
              type="button"
              onClick={restoreAll}
              className="pixel-btn pixel-btn-primary"
            >
              RESTORE ALL WINDOWS ▶
            </button>
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
                    windows.account.isMaximized
                      ? "fixed inset-4 sm:inset-10 z-40 m-auto max-w-4xl max-h-[85vh] overflow-y-auto shadow-[8px_8px_0px_#000]"
                      : ""
                  }`}
                >
                  <div className="pixel-header-bar">
                    <div className="flex items-center gap-2">
                      <span>🪪</span>
                      <span>CUSTOMER ACCOUNT</span>
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
                        onClick={() => toggleMaximize("account")}
                        className="pixel-mini-btn btn-max"
                        title="Maximize"
                      >
                        {windows.account.isMaximized ? "❐" : "□"}
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
                    windows.guarantee.isMaximized
                      ? "fixed inset-4 sm:inset-10 z-40 m-auto max-w-4xl max-h-[85vh] overflow-y-auto shadow-[8px_8px_0px_#000]"
                      : ""
                  }`}
                >
                  <div className="pixel-header-bar bg-gradient-to-r from-amber-400 to-amber-500">
                    <div className="flex items-center gap-2">
                      <span>📜</span>
                      <span>STORE GUARANTEE</span>
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
                        onClick={() => toggleMaximize("guarantee")}
                        className="pixel-mini-btn btn-max"
                        title="Maximize"
                      >
                        {windows.guarantee.isMaximized ? "❐" : "□"}
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
                    windows.categories.isMaximized
                      ? "fixed inset-4 sm:inset-10 z-40 m-auto max-w-4xl max-h-[85vh] overflow-y-auto shadow-[8px_8px_0px_#000]"
                      : ""
                  }`}
                >
                  <div className="pixel-header-bar">
                    <div className="flex items-center gap-2">
                      <span>🛍</span>
                      <span>PRODUCT CATEGORIES</span>
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
                        onClick={() => toggleMaximize("categories")}
                        className="pixel-mini-btn btn-max"
                        title="Maximize"
                      >
                        {windows.categories.isMaximized ? "❐" : "□"}
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
                    windows.assistant.isMaximized
                      ? "fixed inset-4 sm:inset-10 z-40 m-auto max-w-4xl max-h-[85vh] overflow-y-auto shadow-[8px_8px_0px_#000]"
                      : ""
                  }`}
                >
                  <div className="pixel-header-bar">
                    <div className="flex items-center gap-2">
                      <span>🐼</span>
                      <span>SHOPPING ASSISTANT</span>
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
                        onClick={() => toggleMaximize("assistant")}
                        className="pixel-mini-btn btn-max"
                        title="Maximize"
                      >
                        {windows.assistant.isMaximized ? "❐" : "□"}
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

      {/* Retro OS Taskbar fixed at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#e69d10] border-t-3 border-[#2a1502] px-3 py-1.5 flex items-center justify-between shadow-[0_-3px_0_#2a1502]">
        {/* Left: Start Menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setStartMenuOpen(!startMenuOpen)}
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
                      <span className={`text-[7px] font-bold ${isVisible ? "text-green-700" : "text-gray-500"}`}>
                        {isVisible ? "[OPEN]" : !w.isOpen ? "[CLOSED]" : "[MIN]"}
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

        {/* Center: Minimized / Closed Window buttons in Taskbar */}
        <div className="flex items-center gap-2 overflow-x-auto mx-2 flex-1 scrollbar-none">
          {Object.values(windows).map((w) => {
            const isInactive = !w.isOpen || w.isMinimized;
            if (!isInactive) return null;

            return (
              <button
                key={w.id}
                type="button"
                onClick={() => restoreWindow(w.id)}
                className={`pixel-btn text-[8px] py-1 px-2.5 flex items-center gap-1.5 shrink-0 shadow-[1px_1px_0px_#000] cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                  !w.isOpen
                    ? "bg-[#ffdede] text-[#800000] border-red-700 hover:bg-[#ffc5c5]"
                    : "bg-[#fff3cc] text-[#8c4b00] border-[#8c4b00] hover:bg-[#ffe399]"
                }`}
                title={!w.isOpen ? `Reopen ${w.title}` : `Restore ${w.title}`}
              >
                <span>{w.icon}</span>
                <span className="font-bold">{w.title}</span>
                <span className="text-[7px] px-1 py-0.5 rounded font-mono bg-[#2a1502] text-yellow-300">
                  {!w.isOpen ? "✕ REOPEN" : "_ RESTORE"}
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