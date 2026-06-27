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
    color: "bg-indigo-100 text-indigo-600",
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
    color: "bg-slate-100 text-slate-600",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Dark Hero Section matching MongoDB-style branding */}
      <section className="relative w-full bg-slate-900 overflow-hidden pt-32 pb-24 lg:pt-40 lg:pb-32 text-center flex flex-col items-center">
        {/* Organic Blobs */}
        <div className="absolute top-0 right-0 w-[80%] md:w-[60%] h-[100%] bg-blue-900/40 rounded-bl-[150px] z-0 transform translate-x-[20%] -translate-y-[10%]" />
        <div className="absolute bottom-0 left-0 w-[90%] md:w-[50%] h-[80%] bg-indigo-900/30 rounded-tr-[200px] z-0 transform -translate-x-[10%] translate-y-[20%]" />
        
        {/* Curved thin line accent */}
        <svg className="absolute top-0 left-0 w-full h-full text-blue-400/10 z-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M-10,30 C30,40 40,60 70,50 C90,40 110,60 110,60" fill="none" stroke="currentColor" strokeWidth="0.2" />
        </svg>

        <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm text-blue-100 mb-8 font-medium shadow-sm">
            <Sparkles size={16} className="text-blue-400" />
            AI-powered civic issue platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-serif leading-[1.1] tracking-tight text-white mb-6">
            Make your city <br />
            <span className="text-blue-400 italic">better, together.</span>
          </h1>

          <p className="text-slate-300 text-xl leading-relaxed max-w-2xl">
            Report potholes, broken streetlights, garbage dumps — anything civic.
            Our AI analyzes, categorizes, and prioritizes issues so your
            community can act fast.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mt-10 w-full sm:w-auto">
            <Link href="/report" className="bg-white hover:bg-gray-100 text-slate-900 font-semibold px-8 py-3.5 rounded-md shadow-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
              Report an Issue
              <ArrowRight size={18} />
            </Link>

            <Link href="/feed" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold border border-white/20 px-8 py-3.5 rounded-md transition-colors flex items-center justify-center w-full sm:w-auto">
              View Community Feed
            </Link>
          </div>
        </div>
      </section>

      {/* Features - stark white background */}
      <section className="w-full bg-[#FAFAFA] py-24 relative z-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-900 mb-4">
              Everything you need to improve your neighborhood
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              Civic Voice combines modern tools with community action.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="p-8 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                  <div
                    className={`w-12 h-12 rounded-lg ${f.color} flex items-center justify-center mb-6`}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-slate-900">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}