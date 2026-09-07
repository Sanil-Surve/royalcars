"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { useAuth } from "@/src/context/AuthContext";
import { Crown, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading sign in...</p>
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (user) {
      const target = user.role === "admin" ? "/admin" : redirect;
      router.replace(target);
    }
  }, [user, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || redirecting) return;

    setSubmitting(true);
    try {
      const res = await login(email.trim(), password);

      if (res.ok) {
        setRedirecting(true);
        toast.success("Welcome back to Royal Cars!");
        const target = res.user?.role === "admin" ? "/admin" : redirect;
        // Client transition + hard navigation fallback to guarantee single-click navigation
        router.replace(target);
        setTimeout(() => {
          if (typeof window !== "undefined" && window.location.pathname.startsWith("/login")) {
            window.location.assign(target);
          }
        }, 150);
      } else {
        setSubmitting(false);
        toast.error(res.error || "Invalid email or password.");
      }
    } catch {
      setSubmitting(false);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const isLoading = submitting || redirecting;

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors relative overflow-hidden">
      {/* Ambient Blue Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none relative z-10"
      >
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
            <Crown className="w-6 h-6 fill-current" />
          </div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign In to Royal<span className="text-primary"> Cars</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your reservations, bookings, and digital car keys
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="pl-9 h-11 rounded-xl bg-slate-50/80 dark:bg-slate-950/50 border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:border-primary focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 h-11 rounded-xl bg-slate-50/80 dark:bg-slate-950/50 border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:border-primary focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-primary hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer rounded-xl"
          >
            {redirecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Redirecting...
              </>
            ) : submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
              </>
            ) : (
              <>
                Sign In &amp; Continue <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          New to Royal Cars?{" "}
          <Link href="/register" className="font-bold text-primary hover:underline">
            Create an Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
