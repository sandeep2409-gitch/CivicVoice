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
} from "lucide-react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

function FeedPageContent() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

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
    <div className="w-full max-w-[470px] mx-auto pt-6 pb-20">
      {/* Feed Header (Mobile only) */}
      <div className="md:hidden flex justify-between items-center px-4 mb-4">
        <img src="/logo.png" alt="Citizen Voice Logo" className="h-10 w-auto" />
        <div className="flex gap-4">
          <Heart size={24} />
          <MessageCircle size={24} />
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-gray-400 py-12 justify-center">
          <Loader2 size={24} className="animate-spin text-gray-300" />
        </div>
      )}

      <div className="flex flex-col gap-6 md:gap-8">
        {reports.map((report) => {
          const reporter = report.reporterName || "anonymous";
          const initial = reporter.charAt(0).toUpperCase();

          return (
            <article key={report.id} className="bg-white md:border md:border-card-border md:rounded-sm">
              {/* Post Header */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-2 border-white">
                      <span className="text-[10px] font-bold text-gray-800">{initial}</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-semibold text-gray-900 leading-none">{reporter}</span>
                      <span className="text-[14px] text-gray-500 leading-none">• {getTimeAgo(report.createdAt)}</span>
                    </div>
                    {report.location && (
                      <span className="text-[12px] text-gray-500 leading-none mt-1">Location shared</span>
                    )}
                  </div>
                </div>
                <button className="p-2 -mr-2">
                  <MoreHorizontal size={20} className="text-gray-900" />
                </button>
              </div>

              {/* Post Media (Placeholder block for category since no images) */}
              <div className={`w-full aspect-square ${getCategoryColor(report.category)} flex flex-col items-center justify-center p-8 text-center border-y border-gray-100`}>
                 <h2 className="text-4xl font-bold mb-4 opacity-90">{report.category}</h2>
                 <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full font-semibold">
                   <AlertCircle size={18} />
                   {report.severity} Priority
                 </div>
              </div>

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
          <div className="text-center py-20 text-gray-500">
            <div className="w-16 h-16 border-2 border-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Reports Yet</h2>
            <p className="text-sm">When community members report issues, they&apos;ll appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <FeedPageContent />
    </ProtectedRoute>
  );
}