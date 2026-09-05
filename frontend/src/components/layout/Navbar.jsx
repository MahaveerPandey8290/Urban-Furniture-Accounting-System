import {
  Menu,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";

function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#DDD7CE] bg-[#FBFAF7] px-8">

      {/* Left Side */}
      <div className="flex items-center gap-7">

        {/* Menu Button */}
        <button
          className="text-[#403329] transition hover:text-[#30261F]"
          title="Menu"
        >
          <Menu size={23} strokeWidth={1.8} />
        </button>


        {/* Search */}
        <div className="flex h-[42px] w-[390px] items-center gap-3 rounded-xl bg-[#E9E5DE] px-4">

          <Search
            size={19}
            strokeWidth={1.8}
            className="text-[#716B63]"
          />

          <input
            type="text"
            placeholder="Search anything..."
            className="w-full bg-transparent text-sm text-[#211D19] outline-none placeholder:text-[#716B63]"
          />

        </div>

      </div>


      {/* Right Side */}
      <div className="flex items-center gap-6">

        {/* Notification */}
        <button
          className="relative text-[#403329] transition hover:text-[#30261F]"
          title="Notifications"
        >
          <Bell size={22} strokeWidth={1.8} />

          {/* Notification dot */}
          <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-[#9A665A]" />
        </button>


        {/* Admin Profile */}
        <button className="flex items-center gap-3">

          {/* Avatar */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#403329] text-sm font-medium text-white">
            A
          </div>


          {/* Name */}
          <div className="hidden text-left sm:block">

            <p className="text-sm font-medium text-[#211D19]">
              Admin
            </p>

            <p className="text-xs text-[#716B63]">
              Administrator
            </p>

          </div>


          {/* Dropdown */}
          <ChevronDown
            size={17}
            strokeWidth={1.8}
            className="ml-2 text-[#403329]"
          />

        </button>

      </div>

    </header>
  );
}

export default Navbar;