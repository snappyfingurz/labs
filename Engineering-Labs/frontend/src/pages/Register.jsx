import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
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

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/customers/register", formData);
      console.log(response.data);
      navigate('/login');
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to register. Please check your connection and try again.";
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
            <span>CREATE ACCOUNT</span>
          </div>
          <div className="pixel-header-buttons">
            <span className="pixel-mini-btn">_</span>
            <span className="pixel-mini-btn">□</span>
            <span className="pixel-mini-btn">✕</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6 bg-[#fffdf5]">
          <div className="text-center mb-6">
            <div className="inline-block border-2 border-[#2b1802] bg-[#ffd571] px-3 py-1 mb-2 shadow-[2px_2px_0px_#2b1802]">
              <span className="font-pixel-title text-xs text-[#522500]">
                ★ CREATE AN ACCOUNT ★
              </span>
            </div>
            <p className="font-pixel-body text-xs text-gray-600 mt-1">
              Sign up to start shopping on ShopKart.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-red-600 text-red-800 font-pixel-body text-xs shadow-[2px_2px_0px_#800000]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div>
              <label className="block mb-1 font-pixel-body text-xs text-[#2b1802]">
                FULL NAME:
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Ayush Sharma"
                className="pixel-input"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 font-pixel-body text-xs text-[#2b1802]">
                EMAIL ADDRESS:
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="ayush@example.com"
                className="pixel-input"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1 font-pixel-body text-xs text-[#2b1802]">
                PASSWORD (MIN 6 CHARACTERS):
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
                className="pixel-input"
              />
              <span className="text-[10px] font-pixel-body text-gray-500 mt-1 block">
                Must be at least 6 characters
              </span>
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-1 font-pixel-body text-xs text-[#2b1802]">
                PHONE NUMBER:
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="1234567890"
                className="pixel-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pixel-btn pixel-btn-primary w-full mt-2 py-3 text-[10px]"
            >
              {loading ? "LOADING..." : "CREATE ACCOUNT ▶"}
            </button>

            <div className="text-center mt-3 pt-3 border-t border-[#e0c085] font-pixel-body text-xs text-gray-700">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#8c3d00] font-bold hover:underline"
              >
                LOGIN HERE
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;