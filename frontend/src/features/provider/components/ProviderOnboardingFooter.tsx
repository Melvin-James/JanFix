import { Link } from "react-router-dom";

function ProviderOnboardingFooter() {
  return (
    <footer className="bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div>
          <Link
            to="/"
            className="text-lg font-bold text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            JanFix
          </Link>
          <p className="mt-1 text-xs text-slate-500">
            © 2024 JanFix Civic Solutions. All rights reserved.
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600"
        >
          <Link className="hover:text-blue-600" to="/privacy">
            Privacy Policy
          </Link>
          <Link className="hover:text-blue-600" to="/terms">
            Terms of Service
          </Link>
          <Link className="hover:text-blue-600" to="/guidelines">
            Community Guidelines
          </Link>
          <Link className="hover:text-blue-600" to="/support">
            Contact Support
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export default ProviderOnboardingFooter;
