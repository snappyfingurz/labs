import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useEffect, useState, useContext } from "react";
import CartContext from "../context/CartContext";

function Navbar() {
  const nav = useNavigate();
  const location = useLocation();
  const { cartItems, getCart } = useContext(CartContext);
  const [count, setCount] = useState(0);

  const [isBannerCollapsed, setIsBannerCollapsed] = useState(false);
  const [isBannerMaximized, setIsBannerMaximized] = useState(false);

  const cartCount = (cartItems || []).reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
      nav('/login');
    } catch {
      console.log("Logout failed or session already expired");
      nav('/login');
    }
  };

  useEffect(() => {
    const loadWishlistCount = async () => {
      try {
        const res = await api.get('/wishlist/count');
        setCount(res.data.count || 0);
      } catch (err) {
        console.log("Could not load wishlist count", err);
      }
    };

    loadWishlistCount();
  }, []);

  useEffect(() => {
    if (location.pathname !== "/cart" && getCart) {
      getCart();
    }
  }, [getCart, location.pathname]);

  const navLinks = [
    { to: "/", label: "HOME" },
    { to: "/products", label: "PRODUCTS" },
    { to: "/wishlist", label: `WISHLIST (${count})` },
    { to: "/cart", label: `CART (${cartCount})` },
    { to: "/orders", label: "ORDERS" },
  ];

  return (
    <header className="w-full max-w-6xl mx-auto pt-4 px-3">
      {/* Top Retro Pixel Header Banner */}
      <div className="pixel-box mb-3 overflow-hidden">
        <div className="pixel-header-bar">
          <div className="flex items-center gap-2">
            <span>⛩</span>
            <span>SHOPKART</span>
          </div>
          <div className="pixel-header-buttons">
            <button
              type="button"
              onClick={() => setIsBannerCollapsed(!isBannerCollapsed)}
              className="pixel-mini-btn btn-min"
              title="Minimize banner"
            >
              _
            </button>
            <button
              type="button"
              onClick={() => {
                setIsBannerCollapsed(false);
                setIsBannerMaximized(!isBannerMaximized);
              }}
              className="pixel-mini-btn btn-max"
              title="Maximize banner"
            >
              {isBannerMaximized ? "❐" : "□"}
            </button>
            <button
              type="button"
              onClick={() => setIsBannerCollapsed(true)}
              className="pixel-mini-btn btn-close"
              title="Close banner"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Isometric Pixel Banner */}
        {!isBannerCollapsed && (
          <div className={`relative ${isBannerMaximized ? "h-72 sm:h-80 md:h-96" : "h-44 sm:h-56 md:h-64"} w-full overflow-hidden bg-sky-300 transition-all duration-200`}>
            <img
              src="/assets/pixel_banner.jpg"
              alt="Pixel Art Banner"
              className="w-full h-full object-cover pixel-banner-img"
            />
            
            {/* Centered Pixel Art Title */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
              <div className="bg-[#fff9e6]/90 border-2 border-[#5c2e00] px-6 py-3 shadow-[4px_4px_0px_#2d1800] text-center">
                <h1 className="font-pixel-title text-base sm:text-xl md:text-2xl text-[#8b3a00] drop-shadow-[2px_2px_0px_#ffd56b] tracking-wider mb-1">
                  WELCOME TO SHOPKART
                </h1>
                <p className="font-pixel-body text-xs sm:text-sm text-[#4d2600] font-bold">
                  ★ Retro Gaming &amp; Goods Store ★
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pixel Tab Navigation Bar */}
        <div className="bg-[#ffaa00] p-2 border-t-2 border-[#2d1800] flex flex-wrap items-center justify-center gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`pixel-tab ${isActive ? "active" : ""}`}
              >
                {link.label} ▶
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="pixel-tab bg-[#ff4d4d] text-white hover:bg-[#ff1a1a]"
          >
            LOGOUT ✕
          </button>
        </div>
      </div>

      {/* Retro Marquee News Ticker */}
      <div className="pixel-marquee shadow-[2px_2px_0px_#000] mb-4">
        <marquee scrollamount="5" className="font-pixel-body text-xs text-[#2a1300]">
          ★★★ FREE SHIPPING ON ALL ORDERS ★ FAST DELIVERY ★ ALL ITEMS IN STOCK ★★★
        </marquee>
      </div>
    </header>
  );
}

export default Navbar;