import { Eye, EyeOff, Mail, Lock, UserPlus, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthHero from "../../components/auth/AuthHero";
import AuthCard from "../../components/auth/AuthCard";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!loginId.trim() || !password.trim()) {
      setError("Please enter both Login ID and Password.");
      return;
    }

    setLoading(true);
    try {
      const user = await login(loginId.trim(), password);

      // Route based on user role returned from backend
      if (user?.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/invoicing_user");
      }
    } catch (err) {
      console.error("Login failed:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Invalid login ID or password. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex">

      {/* Left hero banner */}
      <AuthHero />

      {/* Right auth card */}
      <AuthCard
        title="Welcome Back"
        subtitle="Sign in to your accounting system"
      >
        <form onSubmit={handleLogin} className="space-y-3">

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Login ID */}
          <div>
            <label className="block text-xs font-medium text-[#242830] mb-1">
              Login ID
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6169]"
              />
              <input
                type="text"
                placeholder="Enter your login ID"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm rounded-lg border border-[#cfd1d4] bg-white text-[#242830] placeholder:text-[#91959d] placeholder:text-xs outline-none focus:border-[#3e5335] focus:ring-2 focus:ring-[#3e5335]/15 transition"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#242830]">
                Password
              </label>
              <button
                type="button"
                className="text-[11px] text-[#405338] hover:text-[#283322] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6169]"
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 pl-9 pr-9 text-xs sm:text-sm rounded-lg border border-[#cfd1d4] bg-white text-[#242830] placeholder:text-[#91959d] placeholder:text-xs outline-none focus:border-[#3e5335] focus:ring-2 focus:ring-[#3e5335]/15 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7079] hover:text-[#283322] cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Sign In button */}
          <button
            type="submit"
            disabled={loading}
            className="!mt-4 w-full h-10 rounded-lg bg-[#3e5335] text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#33462c] transition cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>{loading ? "Signing in..." : "Sign In"}</span>
            {!loading && <ArrowRight size={16} />}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 !my-3">
            <div className="h-px flex-1 bg-[#dcd9d0]" />
            <span className="text-[11px] text-[#8e9095]">or</span>
            <div className="h-px flex-1 bg-[#dcd9d0]" />
          </div>

          {/* Sign Up */}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="w-full h-10 rounded-lg border border-[#67725e] bg-transparent text-[#374331] flex items-center justify-center gap-2 hover:bg-[#edece4] transition cursor-pointer text-xs font-medium"
          >
            <UserPlus size={15} className="text-[#3e5335]" />
            <span className="font-semibold text-[#21271e]">Sign Up</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#fef08a] text-[#78350f] border border-[#facc15] shadow-xs">
              Only for Invoicing Users
            </span>
          </button>

        </form>
      </AuthCard>

    </div>
  );
}

export default Login;
