"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Search,
  Filter,
  CheckCircle2,
  FileText,
  Clock,
  AlertTriangle,
  User,
  MapPin,
  Loader2,
  Shield,
} from "lucide-react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

function AdminPageContent() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const snapshot = await getDocs(collection(db, "reports"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setReports(data);
    setLoading(false);
  };

  const markResolved = async (id: string) => {
    setResolvingId(id);
    await updateDoc(doc(db, "reports", id), {
      status: "Resolved",
      resolvedAt: new Date(),
    });
    await loadReports();
    setResolvingId(null);
  };

  const totalReports = reports.length;
  const pendingReports = reports.filter(
    (r) => r.status === "Pending",
  ).length;
  const resolvedReports = reports.filter(
    (r) => r.status === "Resolved",
  ).length;
  const highSeverityReports = reports.filter(
    (r) => r.severity?.toLowerCase() === "high",
  ).length;

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.category
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      report.summary
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      report.reporterName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesSeverity =
      severityFilter === "All" || report.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (a.status === "Resolved" && b.status !== "Resolved") return 1;
    if (a.status !== "Resolved" && b.status === "Resolved") return -1;
    const scoreA =
      (a.confirmations || 0) + (a.severity === "High" ? 50 : 0);
    const scoreB =
      (b.confirmations || 0) + (b.severity === "High" ? 50 : 0);
    return scoreB - scoreA;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "badge badge-high";
      case "medium":
        return "badge badge-medium";
      case "low":
        return "badge badge-low";
      default:
        return "badge bg-slate-600/20 text-slate-400 border border-slate-600/30";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "badge badge-resolved";
      case "pending":
        return "badge badge-pending";
      default:
        return "badge bg-slate-600/20 text-slate-400 border border-slate-600/30";
    }
  };

  const stats = [
    {
      label: "Total",
      value: totalReports,
      icon: FileText,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: "Pending",
      value: pendingReports,
      icon: Clock,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
    },
    {
      label: "Resolved",
      value: resolvedReports,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      label: "High Severity",
      value: highSeverityReports,
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
    },
  ];

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Shield size={20} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Admin Panel
            </h1>
          </div>
          <p className="text-slate-400">
            Manage, review, and resolve community reports.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="stat-card animate-slide-up">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-9 h-9 rounded-lg ${stat.bgColor} border ${stat.borderColor} flex items-center justify-center`}
                  >
                    <Icon size={16} className={stat.color} />
                  </div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
                <p className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-in">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search reports, names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
          </div>

          <div className="relative">
            <Filter
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="input-field pl-11 pr-8 appearance-none cursor-pointer min-w-[140px]"
            >
              <option>All</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex items-center gap-3 text-slate-400 py-12 justify-center">
            <Loader2 size={20} className="animate-spin" />
            Loading reports...
          </div>
        ) : (
          <div className="space-y-4 stagger">
            {sortedReports.map((report) => (
              <div
                key={report.id}
                className={`glass-card p-6 animate-slide-up ${
                  report.status === "Resolved" ? "opacity-60" : ""
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {(report.reporterName || "A")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold flex items-center gap-1.5">
                          <User size={12} className="text-slate-500" />
                          {report.reporterName || "Anonymous"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {report.createdAt?.toDate
                            ? report.createdAt
                                .toDate()
                                .toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                            : "Recently"}
                        </p>
                      </div>
                    </div>

                    {/* Category & badges */}
                    <h2 className="text-xl font-bold mb-2">
                      {report.category}
                    </h2>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={getSeverityBadge(report.severity)}>
                        <AlertTriangle size={10} />
                        {report.severity}
                      </span>
                      <span className={getStatusBadge(report.status)}>
                        {report.status}
                      </span>
                    </div>

                    {/* Summary */}
                    <p className="text-slate-300 text-sm leading-relaxed mb-3">
                      {report.summary}
                    </p>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        👍 {report.confirmations || 0} confirmations
                      </span>
                      <a
                        href={`https://maps.google.com/?q=${report.latitude},${report.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <MapPin size={12} />
                        View Location
                      </a>
                      {report.resolvedAt && (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 size={12} />
                          Resolved{" "}
                          {new Date(
                            report.resolvedAt.seconds * 1000,
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Resolve button */}
                  {report.status !== "Resolved" && (
                    <button
                      onClick={() => markResolved(report.id)}
                      disabled={resolvingId === report.id}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all flex-shrink-0 disabled:opacity-50"
                    >
                      {resolvingId === report.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}

            {sortedReports.length === 0 && !loading && (
              <div className="text-center py-16 text-slate-500">
                <p className="text-lg">No matching reports found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminPageContent />
    </ProtectedRoute>
  );
}
