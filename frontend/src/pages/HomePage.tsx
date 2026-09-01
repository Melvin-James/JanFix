import { Link } from "react-router-dom";

import {
  AlertCircle,
  Users,
  LifeBuoy,
  CheckCircle2,
  MapPin,
  Calendar,
  ThumbsUp,
  MessageSquare,
  Wrench,
  ArrowRight,
} from "lucide-react";

import { useProviderOnboardingStore } from "../features/provider/store/providerOnboardingStore";

import MainLayout from "../layouts/MainLayout";

function HomePage() {
  
  const steps = [
    { icon: AlertCircle, title: "Report", desc: "Snap a photo and pin the location of any civic issue in seconds." },
    { icon: Users, title: "Participate", desc: "Join local cleanup drives and community-led events in your neighborhood." },
    { icon: LifeBuoy, title: "Support", desc: "Upvote reports and back initiatives to get the attention of local authorities." },
    { icon: CheckCircle2, title: "Track", desc: "Follow real-time status updates on your reports and see them resolved." },
  ];

  const reports = [
    { title: "Waste Pile near Central Park", place: "Sector 4, MG Road", time: "2 days ago", img: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&h=400&fit=crop" },
    { title: "Water Stagnation on High St.", place: "N. Ward, Junction", time: "5 days ago", img: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&h=400&fit=crop" },
    { title: "Kochi Mural Arts Site", place: "Heritage Zone", time: "1 week ago", img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&h=400&fit=crop" },
  ];

  const stats = [
    { value: "1,240+", label: "Issues Reported", accent: false },
    { value: "45", label: "Active Initiatives", accent: true },
    { value: "5,800", label: "Civic Volunteers", accent: false },
    { value: "88%", label: "Resolution Rate", accent: true },
  ];

  const clearDraft = useProviderOnboardingStore(
    state => state.clearDraft
  );

  return (
    <MainLayout>
      {/* Navbar */}
      

      <main className="mx-auto max-w-7xl px-6 py-10 space-y-16">
        {/* Hero */}
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Together, We Can Improve Our City
            </h1>
            <p className="mt-4 max-w-lg text-slate-600">
              JanFix empowers citizens to report civic issues, join community-driven
              initiatives, and track the real-time progress of urban improvements.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/report" className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                Report an Issue
              </Link>
              <Link to="/feed" className="rounded-md border border-blue-600 px-5 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50">
                Explore Community Feed
              </Link>
            </div>
          </div>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/8f/Kochi_Skyline.jpg?utm_source=en.wikipedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled"
            alt="City skyline at night"
            className="h-72 w-full rounded-xl object-cover shadow-md lg:h-96"
          />
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-center text-2xl font-semibold">How It Works</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <Icon className="h-6 w-6 text-blue-600" />
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Reports */}
        <section className="relative">
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/40 backdrop-blur-[3px]">
            <span className="text-3xl font-bold text-slate-800 drop-shadow-sm">
              Coming Soon...
            </span>
          </div>
          <div className="pointer-events-none select-none">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Recent Reports</h2>
              <Link to="/feed" className="text-sm font-medium text-blue-600 hover:underline">
                See all →
              </Link>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {reports.map((r) => (
                <article key={r.title} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <img src={r.img} alt={r.title} className="h-40 w-full object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold">{r.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5" /> {r.place}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{r.time}</p>
                    <div className="mt-3 flex gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> 124</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> 18</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Explore Neighborhood */}
        <section className="relative overflow-hidden rounded-xl bg-white shadow-sm">
          {/* OVERLAY: Absolute container for the glassy blur */}
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[3px]">
            <span className="text-3xl font-bold text-slate-800 drop-shadow-sm">
              Coming Soon...
            </span>
          </div>

          {/* CONTENT WRAPPER: Grid layout moved here, disabled interactions */}
          <div className="pointer-events-none grid select-none gap-6 p-6 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-2xl font-semibold">Explore Your Neighborhood</h2>
              <p className="mt-2 max-w-md text-sm text-slate-600">
                View a real-time heatmap of reports and community initiatives near you.
                Filter by urgency, status, or category to see how JanFix is making an impact.
              </p>
              <Link to="/map" className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                View Full Map
              </Link>
            </div>

            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=500&fit=crop"
              alt="Neighborhood map"
              className="h-56 w-full rounded-lg object-cover"
            />
          </div>
        </section>
      </main>

      {/* Stats */}
      <section className="bg-slate-900 py-10 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 text-center md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <div className={`text-3xl font-bold ${s.accent ? "text-emerald-400" : ""}`}>
                {s.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-slate-300">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-16 space-y-16">
        {/* Featured Initiative */}
        <section className="relative">
          {/* OVERLAY: Absolute container for the glassy blur */}
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/40 backdrop-blur-[3px]">
            <span className="text-3xl font-bold text-slate-800 drop-shadow-sm">
              Coming Soon...
            </span>
          </div>

          {/* ORIGINAL CONTENT (disabled interactions and blurred by overlay) */}
          <div className="pointer-events-none select-none">
            <h2 className="text-2xl font-semibold">Featured Initiative</h2>
            <div className="mt-6 grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:grid-cols-2">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
                alt="Beach cleanup"
                className="h-full w-full object-cover"
              />
              <div className="p-6">
                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-blue-700">
                  Upcoming Event
                </span>
                <h3 className="mt-3 text-xl font-semibold">Fort Kochi Beach Cleanup Drive</h3>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="h-4 w-4" /> Jan 24, 2026 • 07:00 AM
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="h-4 w-4" /> Vasco da Gama Square, Fort Kochi
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  Join over 200 volunteers to restore the beauty of our heritage beach.
                  Cleanup gear and refreshments will be provided to all participants.
                </p>
                <button className="mt-5 inline-flex items-center gap-2 rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-600">
                  Join Activity <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Become a Service Provider CTA */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-lg md:p-12">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide">
                <Wrench className="h-3.5 w-3.5" /> For Service Providers
              </div>

              <h2 className="mt-4 text-3xl font-bold md:text-4xl">
                Help Build Better Communities
              </h2>

              <p className="mt-3 text-blue-100">
                Join JanFix as a verified service provider and contribute to solving
                real civic issues in your community. Whether you're an individual
                professional, NGO, volunteer group, or organization, your skills can
                help restore public spaces and improve everyday life.
              </p>

              <ul className="mt-4 grid gap-2 text-sm text-blue-50 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  Verified provider profile
                </li>

                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  Receive community work opportunities
                </li>

                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  Build trust through completed projects
                </li>

                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  Create a measurable local impact
                </li>
              </ul>
            </div>

            <Link
              to="/provider/onboarding/step-1" onClick={clearDraft}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-md hover:bg-blue-50"
            >
              Become a Service Provider
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
    </MainLayout>
  );
}

export default HomePage;
