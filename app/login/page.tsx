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
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="w-full max-w-md relative animate-fade-in insta-card p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <img src="/logo.png" alt="Citizen Voice Logo" className="h-16 w-auto mx-auto" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            {isSignUp
              ? "Join your community and start reporting civic issues."
              : "Sign in to continue to Citizen Voice."}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm mb-6 animate-fade-in">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700 mb-2 font-medium">
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
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-2 font-medium">
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
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-2 font-medium">
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
            className="btn-primary w-full justify-center text-base mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="mt-6 text-center text-sm text-gray-500">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="text-accent-blue hover:text-blue-700 font-semibold transition-colors"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>

        {/* Admin link */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
          >
            <Shield size={14} />
            Admin Login
          </Link>
        </div>
      </div>
    </main>
  );
}
