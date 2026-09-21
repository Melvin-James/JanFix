import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Construction,
  Eye,
  FileText,
  IndianRupee,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const metrics = [
  { label: "Total Reports", value: "1,248", change: "+12%", icon: FileText, tone: "text-blue-600 bg-blue-50" },
  { label: "Pending Reviews", value: "32", change: "−4%", icon: RefreshCw, tone: "text-amber-600 bg-amber-50" },
  { label: "Ongoing Activities", value: "8", change: "+8%", icon: RefreshCw, tone: "text-emerald-600 bg-emerald-50" },
  { label: "Community Support", value: "₹2.4L", change: "+24%", icon: IndianRupee, tone: "text-blue-600 bg-blue-50" },
];

const proposals = [
  { title: "Broken Water Main", category: "WATER", copy: "Main pipeline burst near Indiranagar Metro station causing significant flooding and water wastage.", count: 4 },
  { title: "Pothole Repair", category: "ROADS", copy: "Multiple deep potholes on Residency Road causing traffic disruptions and safety hazards for two-wheelers.", count: 6 },
  { title: "Public Park Cleanup", category: "SANITATION", copy: "Litter accumulation and unmaintained shrubbery in the local community park area.", count: 3 },
];

const reports = [
  { title: "Broken Water Pipe", address: "4th Block, Koramangala", image: "/images/report-water-pipe.jpg", verified: true, time: "2 mins ago" },
  { title: "Overflowing Dustbin", address: "Central Park Entrance", image: "/images/report-waste-bin.jpg", verified: true, time: "45 mins ago" },
  { title: "Broken Water Pipe", address: "4th Block, Koramangala", image: "/images/report-pothole.jpg", verified: false, time: "2 mins ago" },
  { title: "Overflowing Dustbin", address: "Central Park Entrance", image: "/images/report-waste-bin.jpg", verified: true, time: "45 mins ago" },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Overview</h1>
          <p className="mt-1 text-sm text-slate-500">Real-time monitoring of civic infrastructure and community reports.</p>
        </div>
        <button className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <CalendarDays className="size-4" /> Last 30 Days
        </button>
      </div>

      <ComingSoon label="Metrics">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="System metrics">
          {metrics.map((metric) => (
            <article key={metric.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className={`flex size-9 items-center justify-center rounded-md ${metric.tone}`}>
                  <metric.icon className="size-4" />
                </div>
                <span className={metric.change.startsWith("+") ? "text-xs font-medium text-emerald-600" : "text-xs font-medium text-red-600"}>
                  {metric.change} ↗
                </span>
              </div>
              <p className="mt-4 text-xs text-slate-500">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{metric.value}</p>
            </article>
          ))}
        </section>
      </ComingSoon>

      <ComingSoon label="Pending Proposals">
        <section>
          <SectionHeading icon={<FileText />} title="Pending Proposals" action="View All Proposals" />
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {proposals.map((proposal) => (
              <article key={proposal.title} className="flex min-h-44 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <span className="ml-auto rounded bg-slate-100 px-2 py-1 text-[9px] font-semibold text-blue-600">{proposal.category}</span>
                <h3 className="mt-1 text-sm font-bold text-slate-900">{proposal.title}</h3>
                <p className="mt-1 flex-1 text-xs leading-5 text-slate-500">{proposal.copy}</p>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="flex -space-x-1">
                    <span className="size-5 rounded-full border-2 border-white bg-blue-200" />
                    <span className="size-5 rounded-full border-2 border-white bg-emerald-200" />
                    <span className="size-5 rounded-full border-2 border-white bg-amber-200" />
                  </span>
                  {proposal.count} Proposals
                </div>
                <button className="mt-3 w-full rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                  Review Proposals
                </button>
              </article>
            ))}
          </div>
        </section>
      </ComingSoon>

      <ComingSoon label="Recent Reports">
        <section>
          <SectionHeading icon={<RefreshCw />} title="Recent Reports" action="View All Reports" />
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="hidden grid-cols-[1.8fr_.65fr_.65fr_.35fr] bg-slate-100 px-5 py-3 text-[10px] font-bold text-slate-500 sm:grid">
              <span>REPORT DETAILS</span><span>STATUS</span><span>DATE</span><span className="text-right">ACTIONS</span>
            </div>
            {reports.map((report, index) => (
              <div key={`${report.title}-${index}`} className="grid gap-3 border-t border-slate-200 p-4 first:border-t-0 sm:grid-cols-[1.8fr_.65fr_.65fr_.35fr] sm:items-center sm:px-5 sm:py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <img src={report.image} alt="" loading="lazy" width={512} height={512} className="size-10 shrink-0 rounded object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900">{report.title}</p>
                    <p className="truncate text-[10px] text-slate-500">{report.address}</p>
                  </div>
                  <span className={report.verified ? "hidden shrink-0 items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[8px] font-bold text-emerald-600 md:flex" : "hidden shrink-0 items-center gap-1 rounded bg-red-50 px-2 py-1 text-[8px] font-bold text-red-600 md:flex"}>
                    <ShieldCheck className="size-3" /> {report.verified ? "JANAI: VERIFIED" : "JANAI: FAKE"}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="size-1.5 rounded-full bg-blue-600" /> Reported</span>
                <span className="text-[10px] text-slate-500">{report.time}</span>
                <div className="flex justify-start gap-1 sm:justify-end">
                  <button className="flex size-7 items-center justify-center rounded text-blue-600 hover:bg-slate-100" aria-label={`Review ${report.title}`}><CheckCircle2 className="size-4" /></button>
                  <button className="flex size-7 items-center justify-center rounded text-slate-600 hover:bg-slate-100" aria-label={`View ${report.title}`}><Eye className="size-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </ComingSoon>
    </div>
  );
}

function ComingSoon({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="relative mt-8" aria-label={`${label} — coming soon`}>
      {/* Blurred, non-interactive preview of the section */}
      <div className="pointer-events-none select-none opacity-60 blur-[6px]" aria-hidden="true">
        {children}
      </div>

      {/* Coming Soon overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white/90 px-8 py-6 shadow-lg backdrop-blur-sm">
          <span className="flex size-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Construction className="size-5" />
          </span>
          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-900">Coming Soon</h2>
            <p className="mt-0.5 text-xs text-slate-500">{label} will be available shortly.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ icon, title, action }: { icon: React.ReactNode; title: string; action: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 [&_svg]:size-4 [&_svg]:text-blue-600">{icon}{title}</h2>
      <button className="inline-flex h-auto items-center gap-1 p-0 text-xs font-medium text-blue-600 hover:underline">
        {action}<ArrowUpRight className="size-3" />
      </button>
    </div>
  );
}
