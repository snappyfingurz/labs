import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import CartContext from "../context/CartContext";
import Navbar from "../components/Navbar";

const formatPrice = (value) =>
  `₹${Number(value).toLocaleString("en-IN")}`;

function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    updateCart,
    deleteCart,
    getCart,
  } = useContext(CartContext);

  useEffect(() => {
    getCart();
  }, [getCart]);

  const itemCount = (cartItems || []).reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );
  const subtotal = (cartItems || []).reduce(
    (total, item) => total + (item.product?.price || 0) * (item.quantity || 1),
    0
  );

  const handleDecrease = (item) => {
    if (item.quantity === 1) {
      deleteCart(item.product._id);
      return;
    }

    updateCart(item.product._id, item.quantity - 1);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-3 pb-12">
        {/* Cart Window */}
        <div className="pixel-box mb-6">
          <div className="pixel-header-bar">
            <div className="flex items-center gap-2">
              <span>🛒</span>
              <span>SHOPPING CART ({itemCount} ITEMS)</span>
            </div>
            <div className="pixel-header-buttons">
              <span className="pixel-mini-btn">_</span>
              <span className="pixel-mini-btn">□</span>
              <span className="pixel-mini-btn">✕</span>
            </div>
          </div>

          <div className="p-4 bg-[#fffdf5]">
            {error && (
              <div className="p-3 bg-red-100 border border-red-600 text-red-700 font-pixel-body text-xs mb-4">
                {error}
              </div>
            )}

            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl block mb-2">🧺</span>
                <h2 className="font-pixel-title text-sm text-[#4d2800] mb-2">
                  YOUR CART IS EMPTY
                </h2>
                <p className="font-pixel-body text-xs text-gray-600 mb-4">
                  Your shopping cart is currently empty. Explore our products to add items.
                </p>
                <Link to="/products" className="pixel-btn pixel-btn-primary">
                  BROWSE PRODUCTS ▶
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Items List */}
                <div className="lg:col-span-8 flex flex-col gap-3">
                  {cartItems.map((item) => {
                    const product = item.product;
                    if (!product) return null;

                    return (
                      <div
                        key={product._id}
                        className="border-2 border-[#2b1802] bg-white p-3 shadow-[2px_2px_0px_#2b1802] flex flex-col sm:flex-row items-center gap-4"
                      >
                        <div className="w-24 h-24 border border-black bg-yellow-100 shrink-0 overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 w-full">
                          <Link
                            to={`/products/${product._id}`}
                            className="font-pixel-title text-xs text-[#2b1802] hover:text-[#e09815] block mb-1"
                          >
                            {product.name}
                          </Link>
                          <p className="font-pixel-body text-xs text-gray-600 mb-2">
                            {formatPrice(product.price)} each
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#e0c085]">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDecrease(item)}
                                disabled={loading}
                                className="pixel-btn text-[9px] py-1 px-2.5"
                              >
                                -
                              </button>
                              <span className="font-pixel-title text-xs px-2 text-[#2b1802]">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateCart(product._id, item.quantity + 1)
                                }
                                disabled={loading || item.quantity >= product.stock}
                                className="pixel-btn text-[9px] py-1 px-2.5"
                              >
                                +
                              </button>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="font-pixel-title text-xs text-[#8c3d00]">
                                {formatPrice(product.price * item.quantity)}
                              </span>
                              <button
                                type="button"
                                onClick={() => deleteCart(product._id)}
                                disabled={loading}
                                className="pixel-btn pixel-btn-danger text-[8px] py-1 px-2"
                              >
                                REMOVE ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary Box */}
                <div className="lg:col-span-4 pixel-box bg-[#fffbf0]">
                  <div className="pixel-header-bar bg-gradient-to-r from-amber-400 to-amber-500">
                    <span>🧾 ORDER SUMMARY</span>
                    <span className="pixel-mini-btn">□</span>
                  </div>
                  <div className="p-4 font-pixel-body text-xs">
                    <div className="flex justify-between py-2 border-b border-[#e0c085]">
                      <span>TOTAL ITEMS:</span>
                      <strong className="text-black">{itemCount}</strong>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#e0c085]">
                      <span>SHIPPING:</span>
                      <span className="text-green-700">FREE</span>
                    </div>
                    <div className="flex justify-between py-3 font-pixel-title text-xs text-[#8c3d00]">
                      <span>SUBTOTAL:</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/checkout")}
                      disabled={loading}
                      className="pixel-btn pixel-btn-success w-full mt-4 py-3 text-[10px]"
                    >
                      PROCEED TO CHECKOUT ▶
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Cart;
