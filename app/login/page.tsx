"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  Mail,
  Lock,
  User,
  Loader2,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Shield,
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, login, signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (user) {
      router.replace("/feed");
    }
  }, [user, router]);

  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      setError("You don't have permission to access that page.");
    }
  }, [searchParams]);

  const getErrorMessage = (code: string) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Invalid email or password.";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          setError("Please enter your name.");
          setLoading(false);
          return;
        }
        await signup(email, password, displayName.trim());
      } else {
        await login(email, password);
      }
      router.push("/feed");
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] text-white flex items-center justify-center px-6">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-blue-600/8 via-purple-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <Sparkles size={24} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {isSignUp
              ? "Join your community and start reporting civic issues."
              : "Sign in to continue to Citizen Voice."}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 animate-fade-in">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="flex items-center gap-2 text-sm text-slate-400 mb-2 font-medium">
                <User size={14} />
                Full Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="input-field"
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2 font-medium">
              <Mail size={14} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
              placeholder="At least 6 characters"
              className="input-field"
              required
              minLength={6}
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ArrowRight size={18} />
            )}
            {loading
              ? "Please wait..."
              : isSignUp
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center text-sm text-slate-400">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>

        {/* Admin link */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Shield size={14} />
            Admin Login
          </Link>
        </div>
      </div>
    </main>
  );
}
