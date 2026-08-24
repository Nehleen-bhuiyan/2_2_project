import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { user, logout } = useAuth();

    const navigate = useNavigate();

    const [showDropdown, setShowDropdown] = useState(false);

    const dropdownRef = useRef(null);

    const links = [
        {
            name: "Home",
            to: "/",
        },
        {
            name: "Editing Studio",
            to: "/studio",
        },
        {
            name: "Signal Lab",
            to: "/signal-lab",
        },
    ];

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const handleLogout = () => {
        logout();

        setShowDropdown(false);

        navigate("/");
    };

    return (
        <nav
            className="
        fixed
        top-0
        left-0
        z-50
        w-full
        px-6
        py-5
      "
        >
            <div
                className="
          mx-auto
          flex
          max-w-7xl
          items-center
          justify-between
          gap-6
        "
            >
                {/* =========================
            LOGO
        ========================== */}

                <Link
                    to="/"
                    className="
            shrink-0
            text-2xl
            font-bold
            tracking-wide
            text-[var(--accent)]
            transition
            hover:text-[var(--accent-hover)]
          "
                >
                    AudiVerse
                </Link>

                {/* =========================
            GLASS NAVIGATION PANEL
        ========================== */}

                <div
                    className="
    hidden md:flex
    items-center
    gap-8
    rounded-full
    border border-white/10
    bg-white/10
    px-8 py-3
    backdrop-blur-xl
    shadow-[0_8px_30px_rgba(0,0,0,0.25)]
  "
                >
                    {links.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.to}
                            className="relative inline-block"
                        >
                            {({ isActive }) => (
                                <>
                                    <span
                                        className={`
          text-sm
          font-medium
          transition-colors
          duration-200
          ${isActive
                                                ? "text-white"
                                                : "text-gray-300 hover:text-white"
                                            }
        `}
                                    >
                                        {link.name}
                                    </span>

                                    <span
                                        className={`
          absolute
          left-0
          -bottom-[3px]
          h-[2px]
          rounded-full
          bg-[var(--accent)]
          transition-all
          duration-300
          ${isActive
                                                ? "w-full opacity-100"
                                                : "w-0 opacity-0"
                                            }
        `}
                                    />
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* =========================
            LOGIN / PROFILE
        ========================== */}

                <div className="flex shrink-0 items-center">
                    {user ? (
                        <div
                            ref={dropdownRef}
                            className="relative"
                        >
                            {/* Profile Button */}

                            <button
                                onClick={() =>
                                    setShowDropdown(
                                        (previous) => !previous
                                    )
                                }
                                className="
                  flex
                  h-11
                  w-11
                  cursor-pointer
                  items-center
                  justify-center
                  rounded-full
                  border-2
                  border-[var(--accent)]
                  bg-[var(--accent-soft)]
                  transition-all
                  duration-200
                  hover:scale-105
                  hover:shadow-[0_0_20px_rgba(25,211,197,0.35)]
                "
                            >
                                <User
                                    size={21}
                                    className="text-[var(--accent)]"
                                />
                            </button>

                            {/* Dropdown */}

                            {showDropdown && (
                                <div
                                    className="
                    absolute
                    right-0
                    mt-3
                    w-56
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-black/80
                    backdrop-blur-2xl
                    shadow-[0_15px_40px_rgba(0,0,0,0.45)]
                  "
                                >
                                    {/* User info */}

                                    <div
                                        className="
                      border-b
                      border-white/10
                      px-4
                      py-4
                    "
                                    >
                                        <p
                                            className="
                        font-semibold
                        text-white
                      "
                                        >
                                            {user.name}
                                        </p>

                                        <p
                                            className="
                        mt-1
                        truncate
                        text-sm
                        text-gray-400
                      "
                                        >
                                            {user.email}
                                        </p>
                                    </div>

                                    {/* Profile */}

                                    <Link
                                        to="/profile"
                                        onClick={() =>
                                            setShowDropdown(false)
                                        }
                                        className="
                      block
                      px-4
                      py-3
                      text-gray-200
                      transition
                      hover:bg-[var(--accent-soft)]
                      hover:text-[var(--accent)]
                    "
                                    >
                                        Profile
                                    </Link>

                                    {/* Logout */}

                                    <button
                                        onClick={handleLogout}
                                        className="
                      flex
                      w-full
                      cursor-pointer
                      items-center
                      gap-2
                      px-4
                      py-3
                      text-left
                      text-gray-200
                      transition
                      hover:bg-[var(--accent-soft)]
                      hover:text-[var(--accent)]
                    "
                                    >
                                        <LogOut size={17} />

                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Login Button */

                        <Link
                            to="/auth"
                            className="
                rounded-full
                bg-[var(--accent)]
                px-8
                py-3
                font-bold
                text-black
                transition-all
                duration-200
                hover:scale-105
                hover:bg-[var(--accent-hover)]
                hover:shadow-[0_0_25px_rgba(25,211,197,0.40)]
              "
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;