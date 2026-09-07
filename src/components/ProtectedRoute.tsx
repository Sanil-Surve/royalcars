"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { ShieldAlert, Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (adminOnly && user.role !== "admin") {
        router.push("/");
      }
    }
  }, [user, loading, adminOnly, router, pathname]);

  if (loading) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center gap-3 ${adminOnly ? "min-h-screen bg-[#050C1A] text-slate-100 dark" : ""}`}>
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
        <p className="text-sm font-medium text-slate-400">Verifying Fleet Administrator session...</p>
      </div>
    );
  }

  if (!user || (adminOnly && user.role !== "admin")) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4 ${adminOnly ? "min-h-screen bg-[#050C1A] text-slate-100 dark" : ""}`}>
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-white tracking-tight">Access Restricted</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {adminOnly
              ? "This control console is strictly reserved for Royal Cars fleet management administrators."
              : "Please sign in to view your bookings and personal vehicle digital keys."}
          </p>
        </div>
        <button
          onClick={() => router.push(user ? "/" : `/login?redirect=${encodeURIComponent(pathname)}`)}
          className="mt-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0A192F] font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-[#D4AF37]/20 cursor-pointer"
        >
          {user ? "Return to Public App" : "Sign in to Continue"}
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
