import { Link, useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";

import { logoutUser } from "../../features/auth/services/authService";

function MainNavbar() {

    const navigate = useNavigate();

    const clearAuth = useAuthStore(
        state => state.clearAuth
    );

    const user = useAuthStore(
        state => state.user
    );

    const handleLogout = async () => {

        try {

            await logoutUser();

            clearAuth();

            navigate("/login");

        } catch (error) {

            console.error(error);

        }
    };

    return (

        <header className="
            sticky
            top-0
            z-40
            border-b
            border-slate-200
            bg-white/80
            backdrop-blur
        ">

            <nav className="
                mx-auto
                flex
                max-w-7xl
                items-center
                justify-between
                px-6
                py-4
            ">

                {/* Logo */}

                <Link
                    to="/home"
                    className="
                        flex
                        items-center
                        gap-2
                        text-lg
                        font-bold
                        text-blue-700
                    "
                >
                    JanFix
                </Link>


                {/* Navigation */}

                <ul className="
                    hidden
                    gap-8
                    text-sm
                    font-medium
                    text-slate-600
                    md:flex
                ">

                    <li>
                        <Link
                            to="/"
                            className="text-blue-600"
                        >
                            Home
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/feed"
                            className="hover:text-slate-900"
                        >
                            Feed
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/map"
                            className="hover:text-slate-900"
                        >
                            Map
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/community"
                            className="hover:text-slate-900"
                        >
                            Community Activities
                        </Link>
                    </li>

                </ul>


                {/* Account */}

                <div className="flex items-center gap-3">

                    <span className="
                        hidden
                        text-sm
                        text-slate-600
                        sm:inline
                    ">
                        Hi, {user?.fullName ?? "Citizen"}
                    </span>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="
                            rounded-md
                            border
                            border-slate-300
                            px-3
                            py-1.5
                            text-sm
                            font-medium
                            text-slate-700
                            hover:bg-slate-100
                        "
                    >
                        Logout
                    </button>

                </div>

            </nav>

        </header>
    );
}

export default MainNavbar;