"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  AlertCircle,
  Shield,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, role, login } = useAuth();
  const router = useRouter();

  // If already logged in as admin, redirect
  useEffect(() => {
    if (user && role === "admin") {
      router.replace("/admin");
    }
  }, [user, role, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);

      // After login, check role from Firestore
      const { getAuth } = await import("firebase/auth");
      const currentUser = getAuth().currentUser;

      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));

        if (userDoc.exists() && userDoc.data().role === "admin") {
          router.push("/admin");
        } else {
          // Not an admin — sign them out and show error
          const { signOut } = await import("firebase/auth");
          await signOut(getAuth());
          setError(
            "This account does not have admin privileges. Please contact your administrator.",
          );
        }
      }
    } catch (err: any) {
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Invalid email or password.");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later.");
          break;
        default:
          setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] text-white flex items-center justify-center px-6">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-amber-600/8 via-orange-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to citizen login
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <Shield size={24} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Admin Login
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Sign in with your administrator credentials.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 animate-fade-in">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2 font-medium">
              <Mail size={14} />
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@citizen-voice.com"
              className="input-field"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2 font-medium">
              <Lock size={14} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="input-field"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full justify-center text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ArrowRight size={18} />
            )}
            {loading ? "Verifying..." : "Sign In as Admin"}
          </button>
        </form>

        <p className="text-xs text-slate-600 text-center mt-6">
          Only authorized administrators can access this portal.
        </p>
      </div>
    </main>
  );
}
