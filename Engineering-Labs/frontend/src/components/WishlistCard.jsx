import { Link } from "react-router-dom";

function WishlistCard({ product, onRemove, removing }) {
  return (
    <div className="pixel-box flex flex-col justify-between h-full bg-[#fffdf5]">
      {/* Mini Window Header */}
      <div className="pixel-header-bar">
        <span className="truncate max-w-[140px] text-[8px] font-pixel-title">
          ♥ {product.category || "SAVED"}
        </span>
        <div className="pixel-header-buttons">
          <span className="pixel-mini-btn">□</span>
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1">
        {/* Pixel Framed Image */}
        <div className="border-2 border-[#2b1802] bg-[#f7e7c4] overflow-hidden mb-3 relative h-44 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-[#ffcc00] border border-black px-1.5 py-0.5 text-[8px] font-pixel-title shadow-[1px_1px_0px_#000]">
            ₹{product.price}
          </div>
        </div>

        <div className="flex-1">
          <h2 className="font-pixel-title text-xs text-[#2b1802] mb-1 line-clamp-1">
            {product.name}
          </h2>

          <p className="text-[11px] font-pixel-body text-gray-600 mb-3">
            {product.stock > 0 ? `STOCK: ${product.stock}` : "OUT OF STOCK"}
          </p>
        </div>

        <div className="flex gap-2 mt-auto pt-2 border-t border-[#e0c085]">
          <Link
            to={`/products/${product._id}`}
            className="pixel-btn pixel-btn-dark flex-1 text-[8px] py-1.5 text-center"
          >
            VIEW 🔍
          </Link>

          <button
            onClick={() => onRemove(product._id)}
            disabled={removing}
            className="pixel-btn pixel-btn-danger flex-1 text-[8px] py-1.5"
          >
            {removing ? "REMOVING..." : "REMOVE ✕"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WishlistCard;