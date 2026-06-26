"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/app/context/AuthContext";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { AlertTriangle, MapPin, Loader2 } from "lucide-react";

function ProfilePageContent() {
  const { user, logout } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadMyReports();
  }, [user]);

  const loadMyReports = async () => {
    try {
      const q = query(
        collection(db, "reports"),
        where("reporterUid", "==", user?.uid)
      );
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Sort by createdAt descending
      data.sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "badge badge-high";
      case "medium":
        return "badge badge-medium";
      case "low":
        return "badge badge-low";
      default:
        return "badge bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "badge badge-resolved";
      case "pending":
        return "badge badge-pending";
      default:
        return "badge bg-gray-100 text-gray-800";
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-20 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-10 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-accent-blue text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-md">
            {(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.displayName || "Citizen"}
          </h1>
          <p className="text-gray-500">{user?.email}</p>
          
          <div className="flex gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Reports</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter((r) => r.status === "Resolved").length}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Resolved</p>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="mt-6 md:hidden px-6 py-2 rounded-lg border border-gray-200 text-gray-600 font-medium text-sm"
          >
            Log Out
          </button>
        </div>

        <div className="border-t border-gray-200 pt-8 animate-slide-up">
          <h2 className="text-lg font-bold mb-6 text-gray-900">My Reports</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 size={24} className="animate-spin mr-2" />
              <span>Loading reports...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
              <p>You haven't submitted any reports yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reports.map((report) => (
                <div key={report.id} className="insta-card overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-semibold text-gray-900">{report.category}</span>
                      <span>•</span>
                      <span>
                        {report.createdAt?.toDate
                          ? report.createdAt.toDate().toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })
                          : "Recently"}
                      </span>
                    </div>
                    <span className={getStatusBadge(report.status)}>
                      {report.status}
                    </span>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-sm text-gray-800 mb-4">{report.description || report.summary}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={getSeverityBadge(report.severity)}>
                        <AlertTriangle size={12} className="mr-1" />
                        {report.severity}
                      </span>
                      {report.latitude && report.longitude && (
                        <a
                          href={`https://maps.google.com/?q=${report.latitude},${report.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="badge bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          <MapPin size={12} className="mr-1" />
                          Location
                        </a>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 flex items-center">
                      <span className="font-medium">{report.confirmations || 0}</span>
                      <span className="ml-1">community confirmations</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
