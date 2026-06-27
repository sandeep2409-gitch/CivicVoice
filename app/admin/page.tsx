"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getUserEmoji } from "@/lib/utils";
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
        return "px-2 py-1 text-xs font-semibold rounded-md bg-red-50 text-red-700 border border-red-200 flex items-center gap-1";
      case "medium":
        return "px-2 py-1 text-xs font-semibold rounded-md bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1";
      case "low":
        return "px-2 py-1 text-xs font-semibold rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200 flex items-center gap-1";
      default:
        return "px-2 py-1 text-xs font-semibold rounded-md bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "px-2 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "pending":
        return "px-2 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200";
      default:
        return "px-2 py-1 text-xs font-semibold rounded-md bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const stats = [
    {
      label: "Total",
      value: totalReports,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      label: "Pending",
      value: pendingReports,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-100",
    },
    {
      label: "Resolved",
      value: resolvedReports,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
    },
    {
      label: "High Severity",
      value: highSeverityReports,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-100",
    },
  ];

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 pb-20 md:pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Shield size={20} />
            </div>
            <h1 className="text-4xl font-bold font-serif tracking-tight text-slate-900">
              Admin Panel
            </h1>
          </div>
          <p className="text-slate-500 text-lg">
            Manage, review, and resolve community reports.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 stagger">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-200 p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-md ${stat.bgColor} border ${stat.borderColor} flex items-center justify-center`}
                  >
                    <Icon size={20} className={stat.color} />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">{stat.label}</p>
                </div>
                <p className={`text-4xl font-bold font-serif ${stat.color}`}>
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
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
          <div className="flex items-center gap-3 text-slate-500 py-12 justify-center">
            <Loader2 size={24} className="animate-spin text-slate-400" />
            Loading reports...
          </div>
        ) : (
          <div className="space-y-4 stagger">
            {sortedReports.map((report) => (
              <div
                key={report.id}
                className={`bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-200 p-6 animate-slide-up ${
                  report.status === "Resolved" ? "opacity-70 bg-gray-50" : ""
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl shadow-sm border border-blue-100 flex-shrink-0">
                        {getUserEmoji(report.reporterUid)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold flex items-center gap-1.5 text-gray-900">
                          {report.reporterName || "Anonymous"}
                        </p>
                        <p className="text-xs font-medium text-gray-500">
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
                    <h2 className="text-xl font-bold mb-2 text-gray-900">
                      {report.category}
                    </h2>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={getSeverityBadge(report.severity)}>
                        <AlertTriangle size={12} />
                        {report.severity}
                      </span>
                      <span className={getStatusBadge(report.status)}>
                        {report.status}
                      </span>
                    </div>

                    {/* Summary */}
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      {report.summary}
                    </p>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
                      <span className="flex items-center gap-1">
                        👍 {report.confirmations || 0} confirmations
                      </span>
                      <a
                        href={`https://maps.google.com/?q=${report.latitude},${report.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-accent-blue hover:text-blue-700 transition-colors"
                      >
                        <MapPin size={14} />
                        View Location
                      </a>
                      {report.resolvedAt && (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 size={14} />
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
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 hover:border-emerald-300 transition-all flex-shrink-0 disabled:opacity-50"
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
              <div className="text-center py-16 text-gray-500">
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
