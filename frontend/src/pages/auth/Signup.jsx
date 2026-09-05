import { Eye, EyeOff, Mail, Lock, User, UserPlus, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthHero from "../../components/auth/AuthHero";
import AuthCard from "../../components/auth/AuthCard";

function Signup() {
  const [formData, setFormData] = useState({
    loginId: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSignup = (e) => {
    e.preventDefault();

    if (!formData.loginId.trim()) {
      setError("Please enter a Login ID.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setError("");
    setSuccess(true);

    // Navigate directly to invoicing_user dashboard
    setTimeout(() => {
      navigate("/invoicing_user");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex">

      {/* ================= LEFT HERO BANNER ================= */}
      <AuthHero subtitle="Create your account to manage invoices, payments, vendors, and customers effortlessly." />

      {/* ================= RIGHT SIDE AUTH CARD ================= */}
      <AuthCard
        title="Create Account"
        subtitle="Register as an invoicing user / accountant"
      >
        {/* Error Message */}
        {error && (
          <div className="mb-3.5 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-3.5 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
            <span>Account created successfully! Redirecting...</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-3">

              {/* Login ID */}
              <div>
                <label className="block text-xs font-medium text-[#242830] mb-1">
                  Login ID
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6169]"
                  />
                  <input
                    type="text"
                    name="loginId"
                    value={formData.loginId}
                    onChange={handleChange}
                    placeholder="Enter your login ID"
                    className="
                      w-full
                      h-10
                      pl-9
                      pr-3
                      text-xs
                      sm:text-sm
                      rounded-lg
                      border
                      border-[#cfd1d4]
                      bg-white
                      text-[#242830]
                      placeholder:text-[#91959d]
                      placeholder:text-xs
                      outline-none
                      focus:border-[#3e5335]
                      focus:ring-2
                      focus:ring-[#3e5335]/15
                      transition
                    "
                    required
                  />
                </div>
              </div>

              {/* Email ID */}
              <div>
                <label className="block text-xs font-medium text-[#242830] mb-1">
                  Email ID
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6169]"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className="
                      w-full
                      h-10
                      pl-9
                      pr-3
                      text-xs
                      sm:text-sm
                      rounded-lg
                      border
                      border-[#cfd1d4]
                      bg-white
                      text-[#242830]
                      placeholder:text-[#91959d]
                      placeholder:text-xs
                      outline-none
                      focus:border-[#3e5335]
                      focus:ring-2
                      focus:ring-[#3e5335]/15
                      transition
                    "
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-[#242830] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6169]"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create your password"
                    className="
                      w-full
                      h-10
                      pl-9
                      pr-9
                      text-xs
                      sm:text-sm
                      rounded-lg
                      border
                      border-[#cfd1d4]
                      bg-white
                      text-[#242830]
                      placeholder:text-[#91959d]
                      placeholder:text-xs
                      outline-none
                      focus:border-[#3e5335]
                      focus:ring-2
                      focus:ring-[#3e5335]/15
                      transition
                    "
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-[#6b7079]
                      hover:text-[#283322]
                      cursor-pointer
                    "
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-[#242830] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6169]"
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className="
                      w-full
                      h-10
                      pl-9
                      pr-9
                      text-xs
                      sm:text-sm
                      rounded-lg
                      border
                      border-[#cfd1d4]
                      bg-white
                      text-[#242830]
                      placeholder:text-[#91959d]
                      placeholder:text-xs
                      outline-none
                      focus:border-[#3e5335]
                      focus:ring-2
                      focus:ring-[#3e5335]/15
                      transition
                    "
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-[#6b7079]
                      hover:text-[#283322]
                      cursor-pointer
                    "
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={success}
                className="
                  !mt-4
                  w-full
                  h-10
                  rounded-lg
                  bg-[#3e5335]
                  text-white
                  text-xs
                  sm:text-sm
                  font-medium
                  flex
                  items-center
                  justify-center
                  gap-2
                  hover:bg-[#33462c]
                  transition
                  cursor-pointer
                  disabled:opacity-75
                  shadow-sm
                "
              >
                <span>Sign Up</span>
                <ArrowRight size={16} />
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 !my-3">
                <div className="h-px flex-1 bg-[#dcd9d0]" />
                <span className="text-[11px] text-[#8e9095]">or</span>
                <div className="h-px flex-1 bg-[#dcd9d0]" />
              </div>

              {/* Back to Sign In */}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="
                  w-full
                  h-9.5
                  rounded-lg
                  border
                  border-[#67725e]
                  bg-transparent
                  text-[#374331]
                  flex
                  items-center
                  justify-center
                  gap-2
                  hover:bg-[#edece4]
                  transition
                  cursor-pointer
                  text-xs
                  font-medium
                "
              >
                <UserPlus size={15} />
                <span>Already have an account? Sign In</span>
              </button>

            </form>
      </AuthCard>

    </div>
  );
}

export default Signup;
