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
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="w-full max-w-md relative animate-fade-in insta-card p-8">
        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to citizen login
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <img src="/logo.png" alt="Citizen Voice Logo" className="h-16 w-auto mx-auto" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Admin Login
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Sign in with your administrator credentials.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm mb-6 animate-fade-in">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-2 font-medium">
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
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-2 font-medium">
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
            className="w-full justify-center text-base mt-4 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-all"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ArrowRight size={18} />
            )}
            {loading ? "Verifying..." : "Sign In as Admin"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          Only authorized administrators can access this portal.
        </p>
      </div>
    </main>
  );
}
