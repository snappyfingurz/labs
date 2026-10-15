import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/api";
import Navbar from "../components/Navbar";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlCategory = searchParams.get("category") || "";
  const urlSearch = searchParams.get("search") || "";
  const urlSort = searchParams.get("sort") || "";

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState(urlSearch);
  const [category, setCategory] = useState(urlCategory);
  const [sort, setSort] = useState(urlSort);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sync state if URL changes (e.g., user clicked category from Grand Bazaar)
  useEffect(() => {
    const cat = searchParams.get("category") || "";
    const q = searchParams.get("search") || "";
    const s = searchParams.get("sort") || "";

    setCategory(cat);
    setSearch(q);
    setSort(s);
  }, [searchParams]);

  // Fetch products based on active filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts(search, category, sort);
        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          setError("Please sign in to view products.");
        } else {
          setError("Failed to load products. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, sort]);

  const updateParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const handleCategorySelect = (val) => {
    setCategory(val);
    updateParam("category", val);
  };

  const handleSearchInput = (val) => {
    setSearch(val);
    updateParam("search", val);
  };

  const handleSortSelect = (val) => {
    setSort(val);
    updateParam("sort", val);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-3 pb-12">
        {/* Search & Filter Window */}
        <div className="pixel-box mb-6">
          <div className="pixel-header-bar">
            <div className="flex items-center gap-2">
              <span>🔍</span>
              <span>PRODUCT SEARCH &amp; FILTERS</span>
              {category && (
                <span className="bg-[#fffdf5] border border-black px-1 text-[8px] text-[#8c3d00]">
                  CATEGORY: {category.toUpperCase()}
                </span>
              )}
            </div>
            <div className="pixel-header-buttons">
              <span className="pixel-mini-btn">_</span>
              <span className="pixel-mini-btn">□</span>
            </div>
          </div>

          <div className="p-4 bg-[#fffdf5]">
            {/* Quick Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-[#e0c085]">
              <span className="font-pixel-title text-[8px] text-[#4d2800] mr-1">
                CATEGORIES:
              </span>
              {[
                { label: "ALL PRODUCTS", value: "" },
                { label: "ELECTRONICS", value: "Electronics" },
                { label: "FASHION", value: "Fashion" },
                { label: "BOOKS", value: "Books" },
                { label: "HOME", value: "Home" },
              ].map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => handleCategorySelect(cat.value)}
                  className={`pixel-tab text-[8px] py-1 px-2 ${
                    category.toLowerCase() === cat.value.toLowerCase()
                      ? "active"
                      : ""
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Inputs & Dropdowns */}
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Search products by name..."
                value={search}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="pixel-input flex-1"
              />

              <select
                value={category}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="pixel-input md:w-56"
              >
                <option value="">ALL CATEGORIES</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Books">Books</option>
                <option value="Home">Home</option>
              </select>

              <select
                value={sort}
                onChange={(e) => handleSortSelect(e.target.value)}
                className="pixel-input md:w-48"
              >
                <option value="">SORT: DEFAULT</option>
                <option value="price_asc">PRICE: LOW ▶ HIGH</option>
                <option value="price_desc">PRICE: HIGH ▶ LOW</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="pixel-box p-12 text-center my-8 bg-[#fffdf5]">
            <p className="font-pixel-title text-xs text-[#8c3d00] animate-pulse">
              Loading...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="pixel-box p-8 text-center my-6 bg-red-50 border-red-700">
            <p className="font-pixel-body text-xs text-red-700 mb-4">
              {error}
            </p>
            {error.includes("sign in") && (
              <a href="/login" className="pixel-btn pixel-btn-primary">
                SIGN IN ▶
              </a>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="pixel-box p-12 text-center bg-[#fffdf5]">
            <h2 className="font-pixel-title text-sm text-[#4d2800] mb-2">
              NO PRODUCTS FOUND
            </h2>
            <p className="font-pixel-body text-xs text-gray-600 mb-4">
              {category
                ? `No items found matching category: "${category}".`
                : "Try adjusting your category filter or search query."}
            </p>
            {category && (
              <button
                type="button"
                onClick={() => handleCategorySelect("")}
                className="pixel-btn pixel-btn-primary"
              >
                CLEAR FILTERS ▶
              </button>
            )}
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;