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
    <div className="w-full min-h-screen bg-[#050C1A] text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0A192F] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-[#0A192F] flex items-center justify-center font-bold">
            <Crown className="w-4 h-4 fill-current" />
          </div>
          <span className="font-heading font-bold text-white text-sm">Fleet Admin Console</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-30 h-screen w-64 bg-[#0A192F] border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-amber-500 text-[#0A192F] flex items-center justify-center font-bold shadow-lg shadow-[#D4AF37]/20">
              <Crown className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="font-heading text-sm font-bold text-white">Royal Fleet Admin</h2>
              <span className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider">Control Center</span>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-[#D4AF37] text-[#0A192F] font-bold shadow-md shadow-[#D4AF37]/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center">
              A
            </div>
            <div className="text-xs truncate">
              <p className="font-semibold text-white truncate">{user?.email}</p>
              <p className="text-[10px] text-emerald-400">Master Administrator</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/"
              className="text-center py-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white"
            >
              Public App
            </Link>
            <button
              onClick={() => logout()}
              className="text-center py-2 rounded-lg bg-rose-950/30 border border-rose-900/40 text-[11px] font-semibold text-rose-300 hover:bg-rose-950/50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
