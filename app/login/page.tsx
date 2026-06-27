"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  Loader2,
  AlertCircle,
  Shield,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

function LoginContent() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

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
    <main className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left side - Form */}
      <div className="w-full md:w-[450px] lg:w-[500px] xl:w-[600px] flex-shrink-0 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 bg-white relative z-10 min-h-screen overflow-y-auto">
        
        {/* Logo */}
        <div className="mb-12">
          <Link href="/">
            <img src="/logo.png" alt="Civic Voice Logo" className="h-8 w-auto" />
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-serif text-slate-800 font-medium tracking-tight mb-2">
            {isSignUp ? "Create your account" : "Log in to your account"}
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-3 rounded-md bg-red-50 border border-red-100 text-red-600 text-sm mb-6 animate-fade-in">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              minLength={6}
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 text-slate-800 px-8 py-3 rounded-md font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {isSignUp ? "Sign Up" : "Next"}
            </button>

            <div className="text-sm text-slate-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="text-blue-600 hover:underline font-semibold ml-1"
              >
                {isSignUp ? "Log In" : "Sign Up"}
              </button>
            </div>
          </div>
        </form>

        {/* Admin link */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            <Shield size={16} />
            Admin Portal
          </Link>
        </div>
      </div>

      {/* Right side - Visual/Brand (Hidden on Mobile) */}
      <div className="hidden md:flex flex-1 bg-slate-900 relative items-center justify-center overflow-hidden">
        {/* Blob shapes for the organic background effect */}
        <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-blue-900/40 rounded-bl-[100px] rounded-tl-[30px] z-0 transform translate-x-[20%] -translate-y-[10%]" />
        <div className="absolute bottom-0 left-0 w-[90%] h-[60%] bg-indigo-900/30 rounded-tr-[150px] rounded-tl-[50px] z-0 transform -translate-x-[10%] translate-y-[20%]" />
        
        {/* Curved thin line accent */}
        <svg className="absolute top-[10%] left-0 w-full h-full text-green-400/20 z-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M-10,30 C30,40 40,60 70,50 C90,40 110,60 110,60" fill="none" stroke="currentColor" strokeWidth="0.2" />
          <path d="M30,-10 C30,30 50,40 40,70 C30,90 50,110 50,110" fill="none" stroke="currentColor" strokeWidth="0.1" />
        </svg>

        <div className="relative z-10 max-w-lg px-12 text-white">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-tight">
            Empower Your Community with Civic Voice
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            Build richer connections and resolve local issues faster by seamlessly reporting and verifying problems together.
          </p>
          <button 
            type="button" 
            onClick={() => setShowTutorial(true)} 
            className="inline-flex items-center gap-2 text-white font-semibold hover:underline"
          >
            Explore tutorial <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden relative">
            <button 
              onClick={() => setShowTutorial(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 p-2"
              aria-label="Close tutorial"
            >
              ✕
            </button>
            <div className="p-8">
              <h2 className="text-2xl font-bold font-serif text-slate-900 mb-4">Welcome to Civic Voice</h2>
              <div className="space-y-4 text-slate-600 text-base leading-relaxed">
                <p><strong>Civic Voice</strong> is an AI-powered platform for reporting and resolving community issues.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Report Issues:</strong> Snap a photo and write a quick caption. Our AI will automatically categorize it (e.g., Infrastructure, Sanitation) and assign a severity level.</li>
                  <li><strong>Community Feed:</strong> See what others are reporting in your area. You can "confirm" issues to boost their priority and visibility.</li>
                  <li><strong>Admin Resolution:</strong> Local authorities and admins use a specialized dashboard to track, manage, and resolve the most pressing issues based on community feedback.</li>
                </ul>
                <p className="pt-4">Sign up today to start making your neighborhood a better place!</p>
              </div>
              <div className="mt-8">
                <button 
                  onClick={() => setShowTutorial(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors"
                >
                  Got it, let's go!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
