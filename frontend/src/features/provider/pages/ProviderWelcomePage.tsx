import { Link } from "react-router-dom";
import { Bell, Clock } from "lucide-react";
import MainLayout from "../../../layouts/MainLayout";

function ProviderWelcomePage() {
  return (
    <MainLayout>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        
        <div className="w-full max-w-2xl">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Musical-walkway.jpg/1280px-Musical-walkway.jpg?utm_source=en.wikipedia.org&utm_campaign=imageinfo&utm_content=thumbnail"
            alt="Community members improving public spaces together"
            className="mx-auto mb-8 h-auto w-full max-w-md rounded-2xl"
          />

          <h1 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Welcome to the JanFix Community
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-center text-base leading-relaxed text-slate-600">
            Your profile has been submitted successfully. Our team will review it
            shortly, and you&apos;ll be notified once your account is ready to
            participate in community initiatives.
          </p>

          <p className="mt-4 text-center text-sm font-medium text-emerald-600">
            Thank you for helping improve public spaces through community action.
          </p>

          {/* Info cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Review in Progress</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Our team is reviewing your submission to help maintain a safe
                    and trusted community platform.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Stay Updated</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    You&apos;ll receive updates through email and your dashboard
                    notifications.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/provider/submission"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto"
            >
              View Submission
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
    </MainLayout>
  );
}

export default ProviderWelcomePage;
