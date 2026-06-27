"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  MapPin,
  Upload,
  Send,
  Loader2,
  Camera,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { saveReport } from "@/services/reportService";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useAuth } from "@/app/context/AuthContext";
import { getUserEmoji } from "@/lib/utils";

function ReportPageContent() {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const reporterName = user?.displayName || user?.email || "Anonymous";

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("Location error:", error.message);
      },
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  const analyzeImage = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const submitReport = async () => {
    if (!result) return;
    setSubmitting(true);
    try {
      let finalImageUrl = null;
      
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
        
        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        
        if (!uploadRes.ok) {
          throw new Error("Failed to upload image to Cloudinary");
        }
        
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.secure_url;
      }

      await saveReport({
        ...result,
        imageUrl: finalImageUrl,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        reporterUid: user?.uid ?? null,
        reporterName: reporterName,
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to save report:", error);
      alert("Failed to share report.");
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
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

  if (submitted) {
    return (
      <main className="min-h-screen bg-white text-slate-900 flex items-center justify-center px-6">
        <div className="text-center animate-fade-in max-w-sm w-full bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold font-serif mb-2">Report Submitted</h1>
          <p className="text-gray-500 text-sm mb-8">
            Thank you, <span className="font-semibold text-gray-900">{reporterName}</span>.
            Your report will be reviewed by the community.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/feed" className="w-full bg-blue-600 text-white rounded-md py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              View Feed
            </Link>
            <button
              onClick={() => {
                setResult(null);
                setDescription("");
                setImage(null);
                setSubmitted(false);
              }}
              className="w-full bg-gray-100 text-slate-800 rounded-md py-2.5 text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left side - Form */}
      <div className="w-full md:w-[450px] lg:w-[500px] xl:w-[600px] flex-shrink-0 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-24 md:py-12 bg-white relative z-10 min-h-screen overflow-y-auto">
        <div className="mb-10 mt-6 md:mt-0">
          <h1 className="text-3xl lg:text-4xl font-serif text-slate-800 font-medium tracking-tight mb-2">
            Create an Issue
          </h1>
          <p className="text-slate-500 text-sm">
            Describe the issue or upload a photo for AI analysis.
          </p>
        </div>

        {/* Reporter info */}
        <div className="flex items-center gap-4 mb-8 bg-gray-50 p-4 rounded-md border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shadow-sm">
            {getUserEmoji(user?.uid || user?.email || "")}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{reporterName}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Image upload */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Photo Evidence
            </label>
            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 p-8 rounded-md bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all cursor-pointer group">
              <Upload size={28} className="text-gray-400 mb-3 group-hover:text-blue-500 transition-colors" />
              <span className="text-gray-500 text-sm font-medium">
                {image ? image.name : "Tap to select photo"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) setImage(e.target.files[0]);
                }}
                className="hidden"
              />
            </label>
          </div>

          {image && (
            <div className="rounded-md overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                className="w-full max-h-[300px] object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Caption / Details
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a caption describing the issue..."
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-32 resize-none"
            />
          </div>

          {/* Location */}
          {location && (
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-md border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <MapPin size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Location Added</p>
                  <p className="text-xs text-slate-500">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              onClick={analyzeImage}
              disabled={loading || !image}
              className="w-full bg-blue-600 text-white rounded-md py-3 text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Camera size={16} />
              )}
              Analyze Image
            </button>
          </div>

          {/* AI Result */}
          {result && (
            <div className="animate-slide-up space-y-4 pt-8 border-t border-gray-200 mt-8">
              <h2 className="text-lg font-serif font-bold text-slate-900">
                AI Analysis Complete
              </h2>

              <div className="bg-gray-50 border border-gray-200 rounded-md p-5 space-y-4 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                      Category
                    </p>
                    <p className="font-bold text-gray-900">
                      {result.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                      Severity
                    </p>
                    <span className={getSeverityBadge(result.severity)}>
                      {result.severity}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                    Summary
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {result.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                    Suggested Action
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {result.suggestedAction}
                  </p>
                </div>
              </div>

              <div className="pt-4 pb-12 md:pb-4">
                <button
                  onClick={submitReport}
                  disabled={submitting}
                  className="w-full bg-gray-100 text-slate-800 rounded-md py-3 text-sm font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed border border-gray-200 shadow-sm"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  {submitting ? "Posting..." : "Share to Feed"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Visual/Brand (Hidden on Mobile) */}
      <div className="hidden md:flex flex-1 bg-slate-900 relative items-center justify-center overflow-hidden">
        {/* Blob shapes for the organic background effect */}
        <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-blue-900/40 rounded-bl-[100px] rounded-tl-[30px] z-0 transform translate-x-[20%] -translate-y-[10%]" />
        <div className="absolute bottom-0 left-0 w-[90%] h-[60%] bg-indigo-900/30 rounded-tr-[150px] rounded-tl-[50px] z-0 transform -translate-x-[10%] translate-y-[20%]" />
        
        {/* Curved thin line accent */}
        <svg className="absolute top-[10%] left-0 w-full h-full text-blue-400/20 z-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M-10,30 C30,40 40,60 70,50 C90,40 110,60 110,60" fill="none" stroke="currentColor" strokeWidth="0.2" />
          <path d="M30,-10 C30,30 50,40 40,70 C30,90 50,110 50,110" fill="none" stroke="currentColor" strokeWidth="0.1" />
        </svg>

        <div className="relative z-10 max-w-lg px-12 text-white">
          <h1 className="text-4xl lg:text-5xl font-bold font-serif mb-6 leading-tight tracking-tight">
            See it. Snap it. Fix it.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            Your reports are directly routed to the community feed. Civic Voice AI handles the categorization and prioritization so problems get fixed faster.
          </p>
          <div className="inline-flex items-center gap-2 text-white font-semibold">
            <span className="w-12 h-px bg-white/30" />
            Empowering citizens
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ReportPage() {
  return (
    <ProtectedRoute requiredRole="citizen">
      <ReportPageContent />
    </ProtectedRoute>
  );
}
