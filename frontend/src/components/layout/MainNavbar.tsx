import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { logoutUser } from "../../features/auth/services/authService";

function MainNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/" || location.pathname === "/home";
  const isFeed = location.pathname.startsWith("/feed") || location.pathname.startsWith("/issues");

  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    try {
      setDropdownOpen(false);
      await logoutUser();
      clearAuth();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    navigate("/profile");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          to="/home"
          className="flex items-center gap-2 text-lg font-bold text-blue-700 hover:text-blue-800 transition-colors"
        >
          JanFix
        </Link>

        {/* Navigation */}
        <ul className="hidden gap-8 text-sm font-medium text-slate-600 md:flex">
          <li>
            <Link
              to="/"
              className={isHome ? "text-blue-600 font-semibold" : "hover:text-slate-900 transition-colors"}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/feed"
              className={isFeed ? "text-blue-600 font-semibold" : "hover:text-slate-900 transition-colors"}
            >
              Feed
            </Link>
          </li>
          <li>
            <Link to="/map" className="hover:text-slate-900 transition-colors">
              Map
            </Link>
          </li>
          <li>
            <Link to="/community" className="hover:text-slate-900 transition-colors">
              Community Activities
            </Link>
          </li>
        </ul>

        {/* Account Profile Icon & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            id="user-profile-menu-button"
            aria-label="User account menu"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-2 text-slate-700 hover:bg-slate-100 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline text-xs font-medium text-slate-700 max-w-[120px] truncate">
              {user?.fullName ?? "Profile"}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-profile-menu-button"
              className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg ring-1 ring-black/5 z-50 focus:outline-none"
            >
              {/* Header Info */}
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.fullName ?? "Citizen"}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {user?.email ?? ""}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleProfileClick}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left cursor-pointer"
                >
                  <User className="h-4 w-4 text-slate-500 group-hover:text-blue-700" />
                  <span>Profile</span>
                </button>
              </div>

              <div className="border-t border-slate-100 py-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-red-500" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default MainNavbar;