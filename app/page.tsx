import Link from "next/link";
import {
  FileWarning,
  LayoutDashboard,
  Rss,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: FileWarning,
    title: "AI-Powered Reporting",
    description:
      "Describe or photograph an issue — our AI classifies, prioritizes, and suggests actions instantly.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Rss,
    title: "Community Feed",
    description:
      "See what others report in real time. Confirm issues to boost their priority automatically.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: LayoutDashboard,
    title: "Live Dashboard",
    description:
      "Track stats, resolution rates, and AI-ranked priorities across your community.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Shield,
    title: "Admin Controls",
    description:
      "Filter, search, and resolve issues. Full visibility into every report and its reporter.",
    color: "bg-amber-100 text-amber-600",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center flex flex-col items-center">
        <div className="relative max-w-3xl animate-fade-in flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-white text-sm text-gray-600 mb-8 font-medium shadow-sm">
            <Sparkles size={16} className="text-accent-blue" />
            AI-powered civic issue platform
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.1] tracking-tight text-gray-900">
            Make your city <br />
            <span className="text-accent-blue font-serif italic">better, together.</span>
          </h1>

          <p className="text-gray-500 text-xl mt-6 leading-relaxed max-w-2xl">
            Report potholes, broken streetlights, garbage dumps — anything civic.
            Our AI analyzes, categorizes, and prioritizes issues so your
            community can act fast.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mt-10 w-full sm:w-auto">
            <Link href="/report" className="btn-primary text-base justify-center w-full sm:w-auto px-8 py-3 rounded-full shadow-md shadow-blue-500/20">
              Report an Issue
              <ArrowRight size={18} />
            </Link>

            <Link href="/feed" className="btn-secondary text-base justify-center w-full sm:w-auto px-8 py-3 rounded-full bg-white border border-gray-200 text-gray-900 shadow-sm hover:bg-gray-50">
              View Community Feed
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="insta-card p-6 animate-slide-up shadow-sm">
                <div
                  className={`w-12 h-12 rounded-full ${f.color} flex items-center justify-center mb-5`}
                >
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}