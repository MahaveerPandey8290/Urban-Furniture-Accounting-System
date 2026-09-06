import { Eye, EyeOff, Mail, Lock, User, UserPlus, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthHero from "../../components/auth/AuthHero";
import AuthCard from "../../components/auth/AuthCard";
import api from "../../services/api";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    loginId: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!formData.loginId.trim()) {
      setError("Please enter a Login ID.");
      return;
    }
    const loginIdRegex = /^[a-zA-Z0-9_]+$/;
    if (formData.loginId.trim().length < 6 || formData.loginId.trim().length > 12 || !loginIdRegex.test(formData.loginId.trim())) {
      setError("Login ID must be 6-12 characters and contain only letters, numbers, or underscores.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[a-z]/.test(formData.password) || !/[A-Z]/.test(formData.password) || !/[^a-zA-Z0-9]/.test(formData.password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one special character.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/signup", {
        name: formData.name.trim(),
        loginId: formData.loginId.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setSuccess(true);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] flex">
        <AuthHero />
        <AuthCard title="Account Created" subtitle="Your request has been submitted">
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle2 size={48} className="text-[#3e5335]" />
            <div className="text-center">
              <p className="text-sm font-medium text-[#242830]">
                Account created successfully!
              </p>
              <p className="mt-2 text-xs text-[#5c6169]">
                Your account is pending approval by the administrator. You will be able to log in once approved.
              </p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="mt-2 w-full h-10 rounded-lg bg-[#3e5335] text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#33462c] transition"
            >
              Back to Login
              <ArrowRight size={16} />
            </button>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex">
      <AuthHero />
      <AuthCard title="Create Account" subtitle="Register as an invoicing user">
        <form onSubmit={handleSignup} className="space-y-3">

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-700">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-[#242830] mb-1">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6169]" />
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm rounded-lg border border-[#cfd1d4] bg-white text-[#242830] placeholder:text-[#91959d] outline-none focus:border-[#3e5335] focus:ring-2 focus:ring-[#3e5335]/15 transition"
                required
              />
            </div>
          </div>

          {/* Login ID */}
          <div>
            <label className="block text-xs font-medium text-[#242830] mb-1">Login ID</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6169]" />
              <input
                type="text"
                name="loginId"
                placeholder="Choose a unique login ID (6-12 chars)"
                value={formData.loginId}
                onChange={handleChange}
                className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm rounded-lg border border-[#cfd1d4] bg-white text-[#242830] placeholder:text-[#91959d] outline-none focus:border-[#3e5335] focus:ring-2 focus:ring-[#3e5335]/15 transition"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-[#242830] mb-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6169]" />
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm rounded-lg border border-[#cfd1d4] bg-white text-[#242830] placeholder:text-[#91959d] outline-none focus:border-[#3e5335] focus:ring-2 focus:ring-[#3e5335]/15 transition"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-[#242830] mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6169]" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleChange}
                className="w-full h-10 pl-9 pr-9 text-xs sm:text-sm rounded-lg border border-[#cfd1d4] bg-white text-[#242830] placeholder:text-[#91959d] outline-none focus:border-[#3e5335] focus:ring-2 focus:ring-[#3e5335]/15 transition"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7079] hover:text-[#283322]">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-[#242830] mb-1">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6169]" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full h-10 pl-9 pr-9 text-xs sm:text-sm rounded-lg border border-[#cfd1d4] bg-white text-[#242830] placeholder:text-[#91959d] outline-none focus:border-[#3e5335] focus:ring-2 focus:ring-[#3e5335]/15 transition"
                required
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7079] hover:text-[#283322]">
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="!mt-4 w-full h-10 rounded-lg bg-[#3e5335] text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#33462c] transition cursor-pointer shadow-sm disabled:opacity-60"
          >
            <UserPlus size={15} />
            <span>{loading ? "Creating account..." : "Create Account"}</span>
          </button>

          {/* Back to login */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full h-10 rounded-lg border border-[#67725e] bg-transparent text-[#374331] flex items-center justify-center gap-2 hover:bg-[#edece4] transition text-xs font-medium"
          >
            Already have an account? Sign In
          </button>

        </form>
      </AuthCard>
    </div>
  );
}

export default Signup;
