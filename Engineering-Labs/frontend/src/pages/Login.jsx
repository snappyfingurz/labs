import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/customers/login", formData);
      console.log(response);
      navigate("/home");
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Invalid credentials entered.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md pixel-box">
        {/* Retro Window Header */}
        <div className="pixel-header-bar">
          <div className="flex items-center gap-2">
            <span>⛩</span>
            <span>SHOPKART LOGIN</span>
          </div>
          <div className="pixel-header-buttons">
            <span className="pixel-mini-btn">_</span>
            <span className="pixel-mini-btn">□</span>
            <span className="pixel-mini-btn">✕</span>
          </div>
        </div>

        {/* Login Form Container */}
        <div className="p-6 bg-[#fffdf5]">
          <div className="text-center mb-6">
            <div className="inline-block border-2 border-[#2b1802] bg-[#ffd571] px-3 py-1 mb-2 shadow-[2px_2px_0px_#2b1802]">
              <span className="font-pixel-title text-xs text-[#522500]">
                ★ ACCOUNT LOGIN ★
              </span>
            </div>
            <p className="font-pixel-body text-xs text-gray-600 mt-1">
              Enter your email and password to sign in.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-red-600 text-red-800 font-pixel-body text-xs shadow-[2px_2px_0px_#800000]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block mb-1 font-pixel-body text-xs text-[#2b1802]">
                EMAIL:
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="pixel-input"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1 font-pixel-body text-xs text-[#2b1802]">
                PASSWORD:
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
                className="pixel-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pixel-btn pixel-btn-primary w-full mt-2 py-3 text-[10px]"
            >
              {loading ? "LOADING..." : "SIGN IN ▶"}
            </button>

            <div className="text-center mt-3 pt-3 border-t border-[#e0c085] font-pixel-body text-xs text-gray-700">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#8c3d00] font-bold hover:underline"
              >
                CREATE ACCOUNT
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;