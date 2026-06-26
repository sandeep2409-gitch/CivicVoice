"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getUserEmoji } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

function DashboardPageContent() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "reports"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(data);
      },
    );
    return () => unsubscribe();
  }, []);

  const prioritizedReports = reports
    .map((report: any) => {
      const severityWeight =
        report.severity === "High"
          ? 50
          : report.severity === "Medium"
            ? 30
            : 10;
      const confirmationWeight = (report.confirmations || 0) * 5;
      return {
        ...report,
        priorityScore: severityWeight + confirmationWeight,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const getPriorityLabel = (score: number) => {
    if (score >= 120) return "Critical";
    if (score >= 80) return "Urgent";
    if (score >= 40) return "Moderate";
    return "Low";
  };

  const getPriorityColor = (score: number) => {
    if (score >= 120) return "text-red-600";
    if (score >= 80) return "text-orange-500";
    if (score >= 40) return "text-yellow-600";
    return "text-gray-500";
  };

  const totalReports = reports.length;
  const pendingReports = reports.filter(
    (r) => r.status === "Pending",
  ).length;
  const resolvedReports = reports.filter(
    (r) => r.status === "Resolved",
  ).length;
  const highSeverity = reports.filter(
    (r) => r.severity?.toLowerCase() === "high",
  ).length;

  const chartData = [
    { name: "Pending", value: pendingReports },
    { name: "Resolved", value: resolvedReports },
  ];
  const COLORS = ["#eab308", "#22c55e"];

  const stats = [
    {
      label: "Total Reports",
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
      value: highSeverity,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-100",
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-500">
            Live overview of civic issues across your community.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 stagger">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="insta-card p-6 animate-slide-up"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-full ${stat.bgColor} border ${stat.borderColor} flex items-center justify-center`}
                  >
                    <Icon size={20} className={stat.color} />
                  </div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                </div>
                <p className={`text-4xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="insta-card p-6 animate-slide-up">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900">
              <TrendingUp size={20} className="text-blue-500" />
              Issue Status Overview
            </h2>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    outerRadius={110}
                    innerRadius={60}
                    strokeWidth={0}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {chartData.map((_entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.75rem",
                      color: "#0f172a",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Priority Ranking */}
          <div className="insta-card p-6 animate-slide-up">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900">
              <AlertTriangle size={20} className="text-red-500" />
              AI Priority Ranking
            </h2>

            <div className="space-y-3">
              {prioritizedReports.slice(0, 5).map((report: any, index: number) => (
                <div
                  key={report.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-sm font-bold text-gray-700 flex-shrink-0">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {report.category}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span className="text-sm">{getUserEmoji(report.reporterUid)}</span>
                        {report.reporterName || "Anonymous"}
                      </span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs font-medium text-gray-500">
                        {report.confirmations || 0} confirms
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${getPriorityColor(report.priorityScore)}`}>
                      {report.priorityScore}
                    </p>
                    <p className="text-xs font-medium text-gray-500">
                      {getPriorityLabel(report.priorityScore)}
                    </p>
                  </div>
                </div>
              ))}

              {reports.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  No reports yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardPageContent />
    </ProtectedRoute>
  );
}