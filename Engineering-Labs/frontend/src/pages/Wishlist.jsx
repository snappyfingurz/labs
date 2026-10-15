import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import WishlistCard from "../components/WishlistCard";
import Navbar from "../components/Navbar";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/wishlist");
      setWishlist(response.data.wishlist || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId);
      await api.delete(`/wishlist/${productId}`);
      setWishlist((currentWishlist) =>
        currentWishlist.filter((product) => product._id !== productId)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-3 pb-12">
        <div className="pixel-box mb-6">
          <div className="pixel-header-bar">
            <div className="flex items-center gap-2">
              <span>♥</span>
              <span>MY WISHLIST ({wishlist.length} ITEMS)</span>
            </div>
            <div className="pixel-header-buttons">
              <span className="pixel-mini-btn">_</span>
              <span className="pixel-mini-btn">□</span>
              <span className="pixel-mini-btn">✕</span>
            </div>
          </div>

          <div className="p-4 bg-[#fffdf5]">
            {loading && (
              <div className="text-center py-12">
                <p className="font-pixel-title text-xs text-[#8c3d00] animate-pulse">
                  Loading...
                </p>
              </div>
            )}

            {error && !loading && (
              <div className="p-4 bg-red-100 border border-red-600 text-red-700 font-pixel-body text-xs text-center">
                {error}
              </div>
            )}

            {!loading && !error && wishlist.length === 0 && (
              <div className="text-center py-12">
                <span className="text-4xl block mb-2">💔</span>
                <h2 className="font-pixel-title text-sm text-[#4d2800] mb-2">
                  YOUR WISHLIST IS EMPTY
                </h2>
                <p className="font-pixel-body text-xs text-gray-600 mb-4">
                  Browse our products and click "♡ Wishlist" to save items here.
                </p>
                <Link to="/products" className="pixel-btn pixel-btn-primary">
                  BROWSE PRODUCTS ▶
                </Link>
              </div>
            )}

            {!loading && !error && wishlist.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {wishlist.map((product) => (
                  <WishlistCard
                    key={product._id}
                    product={product}
                    onRemove={handleRemove}
                    removing={removingId === product._id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Wishlist;