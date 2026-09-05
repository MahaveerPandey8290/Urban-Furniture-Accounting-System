import loginFurniture from "../../assets/login-furniture.png";

function Feature({ icon, title, description }) {
  return (
    <div className="flex items-center gap-5">
      <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-2xl">
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

function AuthHero({
  subtitle = "Manage invoices, payments, vendors, customers and more — all in one place.",
}) {
  return (
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
            <div className="text-5xl font-light">♧</div>

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
            {subtitle}
          </p>

          {/* Features */}
          <div className="mt-10 space-y-5">
            <Feature icon="▣" title="Track" description="Invoices & Bills" />
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


          <p className="hidden xl:block">
            Design&nbsp; | &nbsp;People&nbsp; | &nbsp;Spaces&nbsp; | &nbsp;Sustainability
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthHero;
