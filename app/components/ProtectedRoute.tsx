"use client";

import { useAuth, UserRole } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (requiredRole === "admin" && role !== "admin") {
      router.replace("/login?error=unauthorized");
      return;
    }
  }, [user, role, loading, requiredRole, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-lg">Loading...</span>
        </div>
      </main>
    );
  }

  if (!user) return null;
  if (requiredRole === "admin" && role !== "admin") return null;

  return <>{children}</>;
}
