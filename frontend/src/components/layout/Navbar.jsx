import { useState, useRef, useEffect } from "react";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.name || user?.loginId || "Admin";
  const displayRole = user?.role || "Administrator";
  const initial = displayName.charAt(0).toUpperCase();

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
          <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-[#9A665A]" />
        </button>

        {/* User Profile & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 cursor-pointer rounded-lg p-1.5 hover:bg-[#E9E5DE] transition"
          >
            {/* Avatar */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#403329] text-sm font-medium text-white">
              {initial}
            </div>

            {/* Name */}
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-[#211D19]">
                {displayName}
              </p>
              <p className="text-xs text-[#716B63]">
                {displayRole}
              </p>
            </div>

            {/* Dropdown */}
            <ChevronDown
              size={17}
              strokeWidth={1.8}
              className={`ml-2 text-[#403329] transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#DDD7CE] bg-white py-2 shadow-lg z-50">
              <div className="px-4 py-2 border-b border-[#DDD7CE]">
                <p className="text-xs font-semibold text-[#211D19]">{displayName}</p>
                <p className="text-[11px] text-[#716B63]">{user?.email || displayRole}</p>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition cursor-pointer"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}

export default Navbar;