import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import CartContext from "../context/CartContext";

function ProductCard({ product }) {
  const { addCart } = useContext(CartContext);
  const [saving, setSaving] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [cartError, setCartError] = useState("");
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [wishlistError, setWishlistError] = useState("");

  const handleAddCart = async () => {
    if (product.stock === 0) return;
    try {
      setAddingToCart(true);
      setCartError("");
      const result = await addCart(product._id);
      if (result && result.success === false) {
        if (result.status === 401) {
          setCartError("Please log in first!");
        } else {
          setCartError(result.error || "Failed to add to cart.");
        }
      } else {
        setCartAdded(true);
        setTimeout(() => setCartAdded(false), 2500);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setCartError("Please log in first!");
      } else {
        setCartError(err.response?.data?.error || "Failed to add to cart.");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddWishlist = async () => {
    try {
      setSaving(true);
      setWishlistError("");

      await api.post(`/wishlist/${product._id}`);

      setWishlistAdded(true);
    } catch (err) {
      if (err.response?.status === 409) {
        setWishlistError("Already in wishlist!");
      } else {
        setWishlistError("Failed to save item.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pixel-box flex flex-col justify-between h-full bg-[#fffdf5] transition-transform hover:-translate-y-1">
      {/* Mini Window Header */}
      <div className="pixel-header-bar">
        <span className="truncate max-w-[140px] text-[8px] font-pixel-title">
          ★ {product.category || "ITEM"}
        </span>
        <div className="pixel-header-buttons">
          <span className="pixel-mini-btn">□</span>
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1">
        {/* Pixel Framed Image */}
        <div className="border-2 border-[#2b1802] bg-[#f7e7c4] overflow-hidden mb-3 relative group h-44 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute top-2 left-2 bg-[#ffcc00] border border-black px-1.5 py-0.5 text-[8px] font-pixel-title shadow-[1px_1px_0px_#000]">
            ₹{product.price}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <h2 className="font-pixel-title text-xs text-[#2b1802] mb-1 line-clamp-1">
            {product.name}
          </h2>

          <div className="flex items-center justify-between text-[11px] font-pixel-body mb-3">
            <span className="text-gray-600">
              {product.stock > 0 ? `STOCK: ${product.stock}` : "OUT OF STOCK"}
            </span>
            <span className="text-amber-700 font-bold">{product.category || "AUTHENTIC"}</span>
          </div>
        </div>

        {/* Pixel Buttons */}
        <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-[#e0c085]">
          <Link
            to={`/products/${product._id}`}
            className="pixel-btn pixel-btn-dark text-[8px] py-1.5 text-center"
          >
            VIEW DETAILS 🔍
          </Link>

          <button
            onClick={handleAddCart}
            disabled={addingToCart || product.stock === 0}
            className={`pixel-btn ${cartAdded ? "pixel-btn-pink" : "pixel-btn-success"} text-[8px] py-1.5`}
          >
            {addingToCart
              ? "ADDING TO CART... ⏳"
              : cartAdded
              ? "✓ ADDED TO CART! 🛒"
              : product.stock === 0
              ? "OUT OF STOCK"
              : "ADD TO CART 🛒"}
          </button>

          {cartError && (
            <p className="font-pixel-body text-[10px] text-red-600 text-center mt-0.5">
              {cartError}
            </p>
          )}

          <button
            onClick={handleAddWishlist}
            disabled={saving || wishlistAdded}
            className="pixel-btn pixel-btn-pink text-[8px] py-1.5"
          >
            {saving
              ? "SAVING..."
              : wishlistAdded
              ? "♥ SAVED"
              : "♡ WISHLIST"}
          </button>

          {wishlistError && (
            <p className="font-pixel-body text-[10px] text-red-600 text-center mt-1">
              {wishlistError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;