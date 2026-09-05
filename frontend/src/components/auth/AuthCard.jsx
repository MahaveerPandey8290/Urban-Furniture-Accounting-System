/**
 * Reusable AuthCard wrapper for Login and Signup pages.
 * Enforces unified brand header, decorative background shapes, and container layout.
 */
function AuthCard({ title, subtitle, children }) {
  return (
    <div className="w-full lg:w-[48%] flex items-center justify-center relative overflow-hidden py-8 px-4">
      {/* Decorative Background Shapes */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#e9e7db]/70" />
      <div className="absolute -bottom-48 -left-32 w-[450px] h-[450px] rounded-full bg-[#eeede5]/70" />

      {/* Container */}
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
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-xs text-[#6c7078]">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Content */}
          {children}
        </div>

        {/* Bottom Branding */}
        <div className="mt-3.5 text-center">
          <p className="text-[9px] tracking-[0.35em] text-[#9a9b95]">
            BUILDING SPACES &bull; BUILDING TRUST
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthCard;
