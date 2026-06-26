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
} from "lucide-react";
import Link from "next/link";
import { saveReport } from "@/services/reportService";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useAuth } from "@/app/context/AuthContext";

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
        console.error(error);
      },
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result?.toString().split(",")[1];
        resolve(base64 || "");
      };
      reader.onerror = reject;
    });
  };

  const submitReport = async () => {
    if (!result) return;

    setSubmitting(true);
    try {
      await saveReport({
        reporterName,
        reporterUid: user?.uid || null,
        description,
        latitude: location?.latitude,
        longitude: location?.longitude,
        category: result.category,
        severity: result.severity,
        summary: result.summary,
        suggestedAction: result.suggestedAction,
        status: "Pending",
        confirmations: 0,
      });

      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("Failed to save report");
    } finally {
      setSubmitting(false);
    }
  };

  const analyzeIssue = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, location }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      alert("Please select an image first.");
      return;
    }
    setLoading(true);
    try {
      const imageBase64 = await fileToBase64(image);
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, location }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
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

  if (submitted) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="text-center animate-fade-in max-w-sm w-full bg-white p-8 rounded-lg border border-card-border shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Report Submitted</h1>
          <p className="text-gray-500 text-sm mb-8">
            Thank you, <span className="font-semibold text-gray-900">{reporterName}</span>.
            Your report will be reviewed by the community.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/feed" className="btn-primary w-full">
              View Feed
            </Link>
            <button
              onClick={() => {
                setResult(null);
                setDescription("");
                setImage(null);
                setSubmitted(false);
              }}
              className="btn-secondary w-full"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex justify-center px-4 py-8">
      <div className="w-full max-w-lg animate-fade-in">
        <h1 className="text-2xl font-bold mb-2 text-center md:text-left">
          New Post
        </h1>
        <p className="text-gray-500 mb-8 text-sm text-center md:text-left">
          Describe an issue or upload a photo for AI analysis.
        </p>

        {/* Reporter info from auth */}
        <div className="bg-white border border-card-border rounded-lg p-3 flex items-center gap-3 mb-6 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-accent-blue flex items-center justify-center text-sm font-bold text-white shadow-sm">
            {reporterName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{reporterName}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Image upload */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-2 font-semibold">
              <Camera size={16} />
              Photo
            </label>
            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 p-8 rounded-lg bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all cursor-pointer">
              <Upload size={24} className="text-gray-400 mb-2" />
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
            <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                className="w-full max-h-[300px] object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-2 font-semibold">
              <FileText size={16} />
              Caption / Details
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a caption describing the issue..."
              className="input-field h-32 resize-none"
            />
          </div>

          {/* Location */}
          {location && (
            <div className="bg-white border border-card-border p-3 rounded-lg flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-accent-blue" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Location Added</p>
                  <p className="text-xs text-gray-500">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={analyzeIssue}
              disabled={loading || !description.trim()}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileText size={16} />
              )}
              {loading ? "Analyzing..." : "Analyze Text"}
            </button>

            <button
              onClick={analyzeImage}
              disabled={loading || !image}
              className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="animate-slide-up space-y-4 pt-6 border-t border-gray-200 mt-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                AI Analysis Complete
              </h2>

              <div className="bg-white border border-card-border rounded-lg p-5 space-y-4 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                      Category
                    </p>
                    <p className="font-bold text-gray-900">
                      {result.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                      Severity
                    </p>
                    <span className={getSeverityBadge(result.severity)}>
                      {result.severity}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                    Summary
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {result.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                    Suggested Action
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {result.suggestedAction}
                  </p>
                </div>
              </div>

              <button
                onClick={submitReport}
                disabled={submitting}
                className="btn-primary w-full py-3 mt-4"
              >
                {submitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                {submitting ? "Posting..." : "Share to Feed"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ReportPage() {
  return (
    <ProtectedRoute>
      <ReportPageContent />
    </ProtectedRoute>
  );
}
