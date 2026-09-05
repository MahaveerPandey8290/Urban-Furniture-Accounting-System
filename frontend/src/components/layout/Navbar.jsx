function Navbar() {
  return (
    <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b border-border bg-card px-[35px]">

      {/* Left */}
      <div className="flex items-center gap-6">

        <button className="text-xl text-brown">
          ☰
        </button>

        <div className="flex h-[42px] w-[360px] items-center gap-2 rounded-lg bg-beige px-4">

          <span className="text-xl text-text-light">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search anything..."
            className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-light"
          />

        </div>

      </div>


      {/* Right */}
      <div className="flex items-center gap-6">

        <button className="text-xl text-brown">
          ♡
        </button>


        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brown text-white">
            A
          </div>

          <div className="flex flex-col gap-0.5">

            <strong className="text-sm font-semibold text-text">
              Admin
            </strong>

            <span className="text-xs text-text-light">
              Administrator
            </span>

          </div>

          <span className="ml-2 text-lg text-text-light">
            ⌄
          </span>

        </div>

      </div>

    </header>
  );
}

export default Navbar;