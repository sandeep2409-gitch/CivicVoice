"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  MapPin,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { getUserEmoji } from "@/lib/utils";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useAuth } from "@/app/context/AuthContext";

function FeedPageContent() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const q = query(
      collection(db, "reports"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setReports(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const confirmIssue = async (id: string) => {
    setConfirmingId(id);
    try {
      const reportRef = doc(db, "reports", id);
      await updateDoc(reportRef, {
        confirmations: increment(1),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      await deleteDoc(doc(db, "reports", id));
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Failed to delete report.");
    }
  };

  const getTimeAgo = (date: any) => {
    if (!date?.toDate) return "Just now";
    const seconds = Math.floor((new Date().getTime() - date.toDate().getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
  };

  const getCategoryColor = (category: string) => {
    const cats = {
      Infrastructure: "bg-blue-100 text-blue-800",
      Sanitation: "bg-green-100 text-green-800",
      Safety: "bg-red-100 text-red-800",
      Traffic: "bg-orange-100 text-orange-800",
      "Public Transport": "bg-purple-100 text-purple-800",
    };
    return (cats as any)[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 pb-24 px-4 sm:px-6">
      <div className="w-full max-w-xl mx-auto">
        {/* Feed Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-slate-900">Community Feed</h1>
          <div className="flex gap-4 md:hidden">
            <Heart size={24} className="text-slate-700" />
            <MessageCircle size={24} className="text-slate-700" />
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-slate-400 py-12 justify-center">
            <Loader2 size={24} className="animate-spin text-slate-300" />
          </div>
        )}

        <div className="flex flex-col gap-8">
          {reports.map((report) => {
            const reporter = report.reporterName || "anonymous";

            return (
              <article key={report.id} className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-200 overflow-hidden">
                {/* Post Header */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xl bg-blue-50 border border-blue-100 shadow-sm">
                    {getUserEmoji(report.reporterUid)}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-semibold text-slate-900 leading-none">{reporter}</span>
                      <span className="text-[14px] text-slate-500 leading-none">• {getTimeAgo(report.createdAt)}</span>
                    </div>
                    {report.location && (
                      <span className="text-[12px] text-slate-500 leading-none mt-1">Location shared</span>
                    )}
                  </div>
                </div>
                {user?.uid === report.reporterUid ? (
                  <button 
                    onClick={() => handleDelete(report.id)}
                    className="p-2 -mr-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 size={20} />
                  </button>
                ) : (
                  <button className="p-2 -mr-2">
                    <MoreHorizontal size={20} className="text-gray-900" />
                  </button>
                )}
              </div>

              {/* Post Media */}
              {report.imageUrl ? (
                <div className="w-full relative bg-gray-100 border-y border-gray-100 overflow-hidden">
                  <img 
                    src={report.imageUrl} 
                    alt={report.category} 
                    className={`w-full h-auto object-cover max-h-[600px] transition-all ${report.status === "Resolved" ? "grayscale opacity-80" : ""}`}
                  />
                  {report.status === "Resolved" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/20 z-10 pointer-events-none">
                      <div className="transform -rotate-12 border-4 border-emerald-500 text-emerald-500 bg-white/80 font-bold text-4xl sm:text-6xl px-8 py-2 rounded-lg opacity-90 shadow-lg">
                        RESOLVED
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full font-semibold text-sm shadow-sm z-20">
                    <AlertCircle size={14} className={report.severity === "High" ? "text-red-500" : report.severity === "Medium" ? "text-orange-500" : "text-yellow-500"} />
                    {report.severity} Priority
                  </div>
                </div>
              ) : (
                <div className={`w-full aspect-square ${getCategoryColor(report.category)} flex flex-col items-center justify-center p-8 text-center border-y border-gray-100 relative overflow-hidden`}>
                   <h2 className={`text-4xl font-bold mb-4 opacity-90 ${report.status === "Resolved" ? "opacity-50" : ""}`}>{report.category}</h2>
                   {report.status === "Resolved" && (
                     <div className="absolute inset-0 flex items-center justify-center bg-white/20 z-10 pointer-events-none">
                       <div className="transform -rotate-12 border-4 border-emerald-500 text-emerald-500 bg-white/80 font-bold text-4xl sm:text-6xl px-8 py-2 rounded-lg opacity-90 shadow-lg">
                         RESOLVED
                       </div>
                     </div>
                   )}
                   <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full font-semibold text-sm shadow-sm text-gray-900 z-20">
                     <AlertCircle size={14} className={report.severity === "High" ? "text-red-500" : report.severity === "Medium" ? "text-orange-500" : "text-yellow-500"} />
                     {report.severity} Priority
                   </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="p-3 pb-2">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => confirmIssue(report.id)}
                      disabled={confirmingId === report.id}
                      className={`hover:opacity-60 transition-opacity ${confirmingId === report.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Heart 
                        size={26} 
                        className={report.confirmations > 0 ? "fill-red-500 text-red-500" : "text-gray-900"} 
                      />
                    </button>
                    <button className="hover:opacity-60 transition-opacity">
                      <MessageCircle size={26} className="text-gray-900" />
                    </button>
                    <button className="hover:opacity-60 transition-opacity">
                      <Send size={26} className="text-gray-900" />
                    </button>
                  </div>
                  <button className="hover:opacity-60 transition-opacity">
                    <Bookmark size={26} className="text-gray-900" />
                  </button>
                </div>

                {/* Confirmations count */}
                <div className="font-semibold text-[14px] mb-1">
                  {report.confirmations || 0} {report.confirmations === 1 ? 'confirmation' : 'confirmations'}
                </div>

                {/* Caption */}
                <div className="text-[14px] leading-[1.35] mb-1 break-words">
                  <span className="font-semibold mr-1">{reporter}</span>
                  <span>{report.summary}</span>
                </div>

                {/* View map link if coords exist */}
                {report.latitude && report.longitude && (
                  <a
                    href={`https://maps.google.com/?q=${report.latitude},${report.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] text-gray-500 mt-1 inline-flex items-center gap-1 hover:underline"
                  >
                    <MapPin size={12} />
                    View location on map
                  </a>
                )}
              </div>
            </article>
          );
        })}

        {!loading && reports.length === 0 && (
          <div className="text-center py-20 text-slate-500 bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <div className="w-16 h-16 border-2 border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Reports Yet</h2>
            <p className="text-sm">When community members report issues, they&apos;ll appear here.</p>
          </div>
        )}
      </div>
      </div>
    </main>
  );
}

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <FeedPageContent />
    </ProtectedRoute>
  );
}