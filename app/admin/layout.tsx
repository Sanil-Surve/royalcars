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
    <div className="min-h-screen w-full bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased">
      {/* Mobile Sticky Top Bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-md shadow-primary/25">
            <Crown className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="font-heading font-bold text-slate-900 dark:text-white text-sm block leading-tight">Royal Fleet Admin</span>
            <span className="text-[10px] text-primary font-semibold uppercase tracking-wider block">Control Center</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="outline" size="xs" className="text-[11px] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
              App
            </Button>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-50 md:z-30 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-xl md:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-5 flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-md shadow-primary/25">
                <Crown className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="font-heading text-sm font-bold text-slate-900 dark:text-white tracking-tight">Royal Fleet Admin</h2>
                <span className="text-[10px] text-primary font-semibold uppercase tracking-wider block">Control Center</span>
              </div>
            </div>
            {/* Mobile close button inside drawer */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items (Scrollable) */}
          <nav className="space-y-1.5 py-4 flex-1 overflow-y-auto pr-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1">
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
                      ? "bg-primary text-white font-bold shadow-sm shadow-primary/25"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 text-white" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 space-y-3 shrink-0">
          <div className="flex items-center gap-2.5 px-1.5">
            <Avatar className="w-8 h-8 rounded-full border border-primary/25">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {user?.name ? user.name.slice(0, 1).toUpperCase() : "A"}
              </AvatarFallback>
            </Avatar>
            <div className="text-xs truncate min-w-0 flex-1">
              <p className="font-semibold text-slate-900 dark:text-white truncate">{user?.name || user?.email || "Admin"}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Fleet Administrator</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link href="/" className="w-full">
              <Button variant="outline" size="sm" className="w-full text-center py-2 h-8 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                Public App
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              className="w-full text-center py-2 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50"
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
