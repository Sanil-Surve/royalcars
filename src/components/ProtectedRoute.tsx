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
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (adminOnly && user.role !== "admin") {
        router.replace("/");
      }
    }
  }, [user, loading, adminOnly, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {adminOnly ? "Verifying Fleet Administrator session..." : "Checking user session..."}
        </p>
      </div>
    );
  }

  if (!user || (adminOnly && user.role !== "admin")) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Access Restricted
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {adminOnly
              ? "This control console is strictly reserved for Royal Cars fleet management administrators."
              : "Please sign in to view your bookings and personal vehicle digital keys."}
          </p>
        </div>
        <button
          onClick={() => router.replace(user ? "/" : `/login?redirect=${encodeURIComponent(pathname)}`)}
          className="mt-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-primary/20 cursor-pointer"
        >
          {user ? "Return to Public App" : "Sign in to Continue"}
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
