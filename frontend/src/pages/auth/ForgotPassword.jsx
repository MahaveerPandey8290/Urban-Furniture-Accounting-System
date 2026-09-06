import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthHero from "../../components/auth/AuthHero";
import AuthCard from "../../components/auth/AuthCard";
import api from "../../services/api";

function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  // Step 1: Request Reset (Email)
  // Step 2: Set New Password (Token)
  const isResetMode = Boolean(tokenFromUrl);

  const [email, setEmail] = useState("");
  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setSubmittedEmail(email.trim());
      setSuccessMessage(
        res.data?.message ||
          "If an account with that email exists, a password reset link has been dispatched."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to process request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!token.trim()) {
      setError("Reset token is required.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[^a-zA-Z0-9]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one special character.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/reset-password", {
        token: token.trim(),
        newPassword,
        confirmPassword,
      });

      setSuccessMessage(
        res.data?.message || "Password has been reset successfully! Please sign in with your new password."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to reset password. The link may be invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  // Render Success Screen for Reset
  if (successMessage && isResetMode) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] flex">
        <AuthHero />
        <AuthCard title="Password Reset" subtitle="Success">
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle2 size={48} className="text-[#3e5335]" />
            <div className="text-center">
              <p className="text-sm font-medium text-[#242830]">
                {successMessage}
              </p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="mt-2 w-full h-10 rounded-lg bg-[#3e5335] text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#33462c] transition cursor-pointer"
            >
              Sign In Now
              <ArrowRight size={16} />
            </button>
          </div>
        </AuthCard>
      </div>
    );
  }

  // Render Success Screen for Request
  if (successMessage && !isResetMode) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] flex">
        <AuthHero />
        <AuthCard title="Check Your Email" subtitle="Password reset requested">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-12 h-12 rounded-full bg-[#e8ede5] text-[#3e5335] flex items-center justify-center">
              <Mail size={24} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[#242830]">
                Password Reset Instructions Sent
              </p>
              <p className="mt-2 text-xs text-[#5c6169] leading-relaxed">
                If <strong className="text-[#242830]">{submittedEmail}</strong> is registered in our database, you will receive instructions and a link to reset your password.
              </p>
            </div>

            <div className="w-full pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full h-10 rounded-lg bg-[#3e5335] text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#33462c] transition cursor-pointer"
              >
                Back to Sign In
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSuccessMessage("");
                  setEmail("");
                }}
                className="w-full py-2 text-xs text-[#5c6169] hover:text-[#242830] transition cursor-pointer text-center"
              >
                Try a different email address
              </button>
            </div>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex">
      <AuthHero />
      <AuthCard
        title={isResetMode ? "Set New Password" : "Forgot Password"}
        subtitle={
          isResetMode
            ? "Enter your new credentials below"
            : "Enter your registered email to receive a reset link"
        }
      >
        <form
          onSubmit={isResetMode ? handleResetPassword : handleRequestReset}
          className="space-y-3"
        >
          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-700">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isResetMode ? (
            /* Mode 1: Enter Registered Email */
            <div>
              <label className="block text-xs font-medium text-[#242830] mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6169]"
                />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm rounded-lg border border-[#cfd1d4] bg-white text-[#242830] placeholder:text-[#91959d] outline-none focus:border-[#3e5335] focus:ring-2 focus:ring-[#3e5335]/15 transition"
                  required
                />
              </div>
              <p className="mt-1.5 text-[11px] text-[#716B63]">
                Enter the email address tied to your Urban Furniture account.
              </p>
            </div>
          ) : (
            /* Mode 2: Reset with Token from link */
            <>
              {!tokenFromUrl && (
                <div>
                  <label className="block text-xs font-medium text-[#242830] mb-1">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    placeholder="Enter the reset token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-[#cfd1d4] bg-white text-[#242830] outline-none focus:border-[#3e5335] focus:ring-2 focus:ring-[#3e5335]/15 transition"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#242830] mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6169]"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 chars (upper, lower, special)"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError("");
                    }}
                    className="w-full h-10 pl-9 pr-9 text-xs sm:text-sm rounded-lg border border-[#cfd1d4] bg-white text-[#242830] placeholder:text-[#91959d] outline-none focus:border-[#3e5335] focus:ring-2 focus:ring-[#3e5335]/15 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7079] hover:text-[#283322]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#242830] mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6169]"
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError("");
                    }}
                    className="w-full h-10 pl-9 pr-9 text-xs sm:text-sm rounded-lg border border-[#cfd1d4] bg-white text-[#242830] placeholder:text-[#91959d] outline-none focus:border-[#3e5335] focus:ring-2 focus:ring-[#3e5335]/15 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7079] hover:text-[#283322]"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-lg bg-[#3e5335] text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#33462c] disabled:opacity-60 transition cursor-pointer mt-4"
          >
            {loading ? (
              <span>Processing...</span>
            ) : isResetMode ? (
              <>
                <span>Update Password</span>
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Back to Login */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-1.5 text-xs text-[#5c6169] hover:text-[#242830] transition cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </button>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}

export default ForgotPassword;
