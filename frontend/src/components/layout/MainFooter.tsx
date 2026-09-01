import { Link } from "react-router-dom";

function MainFooter() {

    return (

        <footer className="
            border-t
            border-slate-200
            bg-white
        ">

            <div className="
                mx-auto
                flex
                max-w-7xl
                flex-col
                justify-between
                gap-3
                px-6
                py-6
                text-sm
                text-slate-500
                md:flex-row
            ">

                <div>
                    <span className="
                        font-semibold
                        text-blue-700
                    ">
                        JanFix
                    </span>

                    {" "}© 2026 · Built for civic impact.
                </div>


                <div className="flex gap-5">

                    <Link
                        to="/privacy"
                        className="hover:text-slate-900"
                    >
                        Privacy
                    </Link>

                    <Link
                        to="/terms"
                        className="hover:text-slate-900"
                    >
                        Terms
                    </Link>

                    <Link
                        to="/contact"
                        className="hover:text-slate-900"
                    >
                        Contact
                    </Link>

                    <Link
                        to="/community"
                        className="hover:text-slate-900"
                    >
                        Community
                    </Link>

                </div>

            </div>

        </footer>
    );
}

export default MainFooter;