"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import {
  Crown,
  LayoutDashboard,
  Car,
  FileCheck,
  CalendarCheck,
  Users,
  MapPin,
  CreditCard,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ProtectedRoute adminOnly>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: "Operations & Rides", href: "/admin", icon: LayoutDashboard },
    { label: "Fleet Vehicles", href: "/admin/vehicles", icon: Car },
    { label: "KYC Verification", href: "/admin/kyc", icon: FileCheck },
    { label: "Bookings Ledger", href: "/admin/bookings", icon: CalendarCheck },
    { label: "Customers Directory", href: "/admin/customers", icon: Users },
    { label: "Pickup Hubs", href: "/admin/locations", icon: MapPin },
    { label: "Payments Audit", href: "/admin/payments", icon: CreditCard },
  ];

  return (
    <div className="dark min-h-screen w-full bg-[#050C1A] text-slate-100 flex flex-col md:flex-row antialiased">
      {/* Mobile Sticky Top Bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0A192F]/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-amber-500 text-[#0A192F] flex items-center justify-center font-bold shadow-md shadow-[#D4AF37]/20">
            <Crown className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="font-heading font-bold text-white text-sm block leading-tight">Royal Fleet Admin</span>
            <span className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider block">Control Center</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="xs" className="text-[11px] text-slate-300 hover:text-white border border-slate-700/60">
              App
            </Button>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-50 md:z-30 h-screen w-64 bg-[#0A192F] border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-5 flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-amber-500 text-[#0A192F] flex items-center justify-center font-bold shadow-lg shadow-[#D4AF37]/25">
                <Crown className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="font-heading text-sm font-bold text-white tracking-tight">Royal Fleet Admin</h2>
                <span className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider block">Control Center</span>
              </div>
            </div>
            {/* Mobile close button inside drawer */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items (Scrollable) */}
          <nav className="space-y-1.5 py-4 flex-1 overflow-y-auto pr-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1">
              Management Modules
            </div>
            {navItems.map((item) => {
              const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-[#D4AF37] text-[#0A192F] font-bold shadow-md shadow-[#D4AF37]/25"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#0A192F]" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#081426] space-y-3 shrink-0">
          <div className="flex items-center gap-2.5 px-1.5">
            <Avatar className="w-8 h-8 rounded-full border border-amber-500/40">
              <AvatarFallback className="bg-amber-500/20 text-amber-300 text-xs font-bold">
                {user?.name ? user.name.slice(0, 1).toUpperCase() : "A"}
              </AvatarFallback>
            </Avatar>
            <div className="text-xs truncate min-w-0 flex-1">
              <p className="font-semibold text-white truncate">{user?.name || user?.email || "Admin"}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-slate-400 font-medium truncate">Fleet Commander</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link href="/" className="w-full">
              <Button variant="outline" size="sm" className="w-full text-center py-2 h-8 rounded-xl bg-slate-900/80 border-slate-700/80 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800">
                Public App
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => logout()}
              className="w-full text-center py-2 h-8 rounded-xl bg-rose-950/40 border border-rose-900/50 text-[11px] font-semibold text-rose-300 hover:bg-rose-950/70"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
