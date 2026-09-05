"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { useAuth } from "@/src/context/AuthContext";
import { Crown, Lock, Mail, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-[#060E1A]">
          <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading sign in...</p>
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

  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.ok) {
      toast.success("Welcome back to Royal Cars!");
      if (res.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push(redirect);
      }
    } else {
      toast.error(res.error || "Invalid email or password.");
    }
  };

  const fillAdmin = () => {
    setEmail("admin@royalcars.in");
    setPassword("Admin@12345");
    toast.info("Admin credentials populated.");
  };

  const fillCustomer = () => {
    setEmail("customer@royalcars.in");
    setPassword("Customer@123");
    toast.info("Demo customer credentials populated.");
  };

  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#060E1A]">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md rounded-3xl bg-[#0A192F] border border-slate-800 p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-amber-500 text-[#0A192F] flex items-center justify-center mx-auto shadow-lg shadow-[#D4AF37]/20">
            <Crown className="w-6 h-6 fill-current" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">Sign In to Royal Cars</h1>
          <p className="text-xs text-slate-400">Access your self-drive passes and bookings</p>
        </div>

        {/* Quick Demo Switcher Buttons */}
        <div className="mb-6 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex justify-center">
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-slate-700 bg-slate-950/60">
              One-Click Quick Login
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillAdmin}
              className="bg-amber-500/15 border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/25"
            >
              Fleet Admin
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillCustomer}
              className="bg-slate-800 border-slate-700 text-slate-200 text-xs font-bold hover:bg-slate-700"
            >
              Customer Demo
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="pl-9 bg-slate-900/90 border-slate-700 text-xs text-white placeholder:text-slate-500 focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold uppercase tracking-wider text-slate-400">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 bg-slate-900/90 border-slate-700 text-xs text-white placeholder:text-slate-500 focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-11 bg-gradient-to-r from-[#D4AF37] to-amber-400 text-[#0A192F] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {submitting ? "Signing In..." : "Sign In & Continue"} <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          New to Royal Cars?{" "}
          <Link href="/register" className="font-bold text-[#D4AF37] hover:underline">
            Create an Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
