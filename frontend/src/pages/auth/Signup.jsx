import { Eye, EyeOff, Mail, Lock, User, UserPlus, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginFurniture from "../../assets/login-furniture.png";

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

    // Temporary frontend mock signup
    // Backend registration will be connected later
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex">

      {/* ================= LEFT SIDE ================= */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-[#211f17]">

        {/* Background Image */}
        <img
          src={loginFurniture}
          alt="Urban Furniture"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16 text-white">

          {/* Logo */}
          <div>
            <div className="flex items-center gap-4">

              {/* Chair Icon */}
              <div className="text-5xl font-light">
                ♧
              </div>

              <div>
                <h1 className="text-3xl xl:text-4xl tracking-[0.12em] font-medium">
                  URBAN
                </h1>

                <h1 className="text-3xl xl:text-4xl tracking-[0.12em] font-medium">
                  FURNITURE
                </h1>
              </div>

            </div>

            <p className="mt-2 text-sm tracking-[0.25em] text-white/80">
              SPACES FOR A BETTER TOMORROW
            </p>
          </div>

          {/* Main Text */}
          <div className="max-w-xl">

            <div className="w-10 h-[2px] bg-white mb-8" />

            <h2 className="text-4xl xl:text-5xl font-medium leading-tight">
              Accounting
              <br />
              Made Simple
              <br />
              for a Creative World
            </h2>

            <p className="mt-6 text-lg xl:text-xl text-white/85 leading-relaxed max-w-lg">
              Create your account to manage invoices, payments, vendors,
              and customers effortlessly.
            </p>

            {/* Features */}
            <div className="mt-10 space-y-5">

              <Feature
                icon="▣"
                title="Track"
                description="Invoices & Bills"
              />

              <Feature
                icon="▥"
                title="Manage"
                description="Customers & Vendors"
              />

              <Feature
                icon="◔"
                title="Get Insights"
                description="with Real-time Reports"
              />

            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-white/70">
            <p>
              © 2025 Urban Furniture. All rights reserved.
            </p>

            <p className="hidden xl:block">
              Design&nbsp; | &nbsp;People&nbsp; | &nbsp;Spaces&nbsp; | &nbsp;Sustainability
            </p>
          </div>

        </div>
      </div>


      {/* ================= RIGHT SIDE ================= */}
      <div className="w-full lg:w-[48%] flex items-center justify-center relative overflow-hidden py-8 px-4">

        {/* Decorative Background Shapes */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#e9e7db]/70" />
        <div className="absolute -bottom-48 -left-32 w-[450px] h-[450px] rounded-full bg-[#eeede5]/70" />

        {/* Signup Container */}
        <div className="relative z-10 w-full max-w-[430px]">

          {/* Logo Header */}
          <div className="flex justify-center mb-3">
            <div className="flex items-center justify-center gap-2.5">
              <div className="text-3xl font-light text-[#1f241d]">
                ♧
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold tracking-[0.25em] text-[#16191f] leading-tight">
                  URBAN
                </p>
                <p className="text-xs font-semibold tracking-[0.25em] text-[#16191f] leading-tight">
                  FURNITURE
                </p>
              </div>
            </div>
          </div>

          {/* Off-White Card */}
          <div className="bg-[#faf8f4] border border-[#e5e1d7] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-5 sm:p-6 backdrop-blur-sm">

            {/* Heading */}
            <div className="text-center mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#171a20]">
                Create Account
              </h2>
              <p className="mt-1 text-xs text-[#6c7078]">
                Register as an invoicing user / accountant
              </p>
            </div>

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

          </div>

          {/* Bottom Branding */}
          <div className="mt-3.5 text-center">
            <p className="text-[9px] tracking-[0.35em] text-[#9a9b95]">
              BUILDING SPACES &bull; BUILDING TRUST
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}


/* Feature Component */

function Feature({ icon, title, description }) {
  return (
    <div className="flex items-center gap-5">

      <div
        className="
          w-14
          h-14
          rounded-xl
          bg-white/15
          backdrop-blur-sm
          flex
          items-center
          justify-center
          text-2xl
        "
      >
        {icon}
      </div>

      <div>

        <p className="text-lg font-medium">
          {title}
        </p>

        <p className="text-white/80">
          {description}
        </p>

      </div>

    </div>
  );
}

export default Signup;
