"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import {
  Crown,
  LayoutDashboard,
  FileCheck,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Fleet", href: "/vehicles" },
    { label: "Flexible Pricing", href: "/#pricing" },
    { label: "Location", href: "/#location" },
    { label: "FAQ", href: "/#faq" },
  ];

  return (
    <>
      <nav className="sticky top-0 left-0 right-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all duration-300">
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-12 py-3.5 w-full mx-auto relative">
          {/* Brand Logo */}
          <Link className="flex items-center gap-2.5 group" href="/">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
              <Crown className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                Royal<span className="text-primary"> Cars</span>
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                Kharghar & Panvel
              </span>
            </div>
          </Link>

          {/* Desktop Center Links */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative py-1 text-sm font-medium transition-all group ${
                    isActive
                      ? "text-primary font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/vehicles"
              className="hidden md:inline-flex items-center justify-center bg-primary hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200 shadow-sm shadow-primary/20 hover:shadow"
            >
              Book Now
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2.5 p-1 rounded-full border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors cursor-pointer outline-none">
                  <Avatar className="w-8 h-8 rounded-full border border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {user.name ? user.name.slice(0, 1).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden lg:inline max-w-[100px] truncate pr-2">
                    {user.name}
                  </span>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2 shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <DropdownMenuLabel className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </DropdownMenuLabel>

                  <div className="py-1 space-y-0.5">
                    <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-medium cursor-pointer">
                      <Link href="/dashboard" className="flex items-center gap-2 w-full">
                        <LayoutDashboard className="w-4 h-4 text-primary" /> My Bookings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-medium cursor-pointer">
                      <Link href="/kyc" className="flex items-center gap-2 w-full">
                        <FileCheck className="w-4 h-4 text-emerald-500" /> KYC Verification
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/30 cursor-pointer">
                        <Link href="/admin" className="flex items-center gap-2 w-full">
                          <Crown className="w-4 h-4" /> Admin Console
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="hidden md:block bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-Out Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 w-72 bg-white dark:bg-slate-900 shadow-2xl p-6 flex flex-col z-50 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                Royal<span className="text-primary"> Cars</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1 py-6 flex-1 overflow-y-auto">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-primary bg-primary/10 font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <Link
                href="/vehicles"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full bg-primary hover:bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm text-center shadow-md shadow-primary/20"
              >
                Book Now
              </Link>
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full border border-slate-200 dark:border-slate-700 text-red-600 py-2.5 rounded-xl font-medium text-sm text-center hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 rounded-xl font-medium text-sm text-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
