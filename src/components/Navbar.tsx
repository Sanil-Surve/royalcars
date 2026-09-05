"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/src/context/AuthContext";
import {
  Car,
  ShieldCheck,
  Building2,
  MapPin,
  User,
  LogOut,
  LayoutDashboard,
  FileCheck,
  Menu,
  X,
  Sparkles,
  PhoneCall,
  Crown,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: "Fleet", href: "/vehicles", icon: Car },
    { label: "Flexible Pricing", href: "/#pricing", icon: Sparkles },
    { label: "Business Fleet", href: "/business", icon: Building2 },
    { label: "Hubs & Locations", href: "/#hubs", icon: MapPin },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0A192F]/90 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-amber-500 flex items-center justify-center text-[#0A192F] shadow-lg shadow-[#D4AF37]/20 group-hover:scale-105 transition-transform">
            <Crown className="w-6 h-6 fill-current" />
          </div>
          <div>
            <span className="font-heading text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Royal Cars <span className="text-[#D4AF37] text-xs uppercase tracking-widest font-sans font-bold">Fleet</span>
            </span>
            <span className="text-[10px] text-slate-400 block tracking-widest uppercase font-mono">
              Navi Mumbai · Kharghar & Panvel
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <link.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Cluster */}
        <div className="hidden md:flex items-center gap-3">
          {/* Quick Hub Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Kharghar & Panvel Hubs Live</span>
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-900/90 border border-slate-700/80 hover:border-[#D4AF37] text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-amber-400 text-[#0A192F] font-bold text-xs flex items-center justify-center">
                  {user.name ? user.name.slice(0, 1).toUpperCase() : "U"}
                </div>
                <div className="text-left text-xs">
                  <p className="font-semibold text-slate-200 line-clamp-1 max-w-[100px]">{user.name || "Customer"}</p>
                  <p className="text-[10px] text-slate-400 capitalize">
                    {user.role === "admin" ? "Fleet Admin" : user.kyc_status === "approved" ? "KYC Verified" : "KYC Pending"}
                  </p>
                </div>
              </button>

              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0A192F] border border-slate-700/90 p-2 shadow-2xl text-slate-100 z-50"
                  >
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            user.kyc_status === "approved"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          KYC: {user.kyc_status}
                        </span>
                      </div>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#D4AF37]" /> My Bookings & Key
                      </Link>

                      <Link
                        href="/kyc"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                      >
                        <FileCheck className="w-4 h-4 text-emerald-400" /> KYC Verification Center
                      </Link>

                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                        >
                          <Crown className="w-4 h-4 text-amber-400" /> Fleet Admin Console
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-300 hover:bg-rose-950/40 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-400 text-[#0A192F] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md shadow-[#D4AF37]/20 transition-all"
              >
                Join / Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-[#D4AF37]"
            >
              <User className="w-4 h-4" />
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-800 bg-[#0A192F] px-4 pt-3 pb-6 space-y-3"
          >
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60"
                >
                  <link.icon className="w-4 h-4 text-[#D4AF37]" />
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              {user ? (
                <>
                  <div className="px-3 py-1 text-xs text-slate-400">
                    Signed in as <span className="font-bold text-white">{user.name}</span>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 bg-slate-900 border border-slate-800"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#D4AF37]" /> My Bookings & Key
                  </Link>
                  <Link
                    href="/kyc"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 bg-slate-900 border border-slate-800"
                  >
                    <FileCheck className="w-4 h-4 text-emerald-400" /> KYC Verification Center
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30"
                    >
                      <Crown className="w-4 h-4 text-amber-400" /> Fleet Admin Console
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-300 bg-rose-950/30 border border-rose-900/40"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-[#0A192F] bg-[#D4AF37]"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
