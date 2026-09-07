"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import ConciergeModal from "@/src/components/ConciergeModal";

interface AppChromeProps {
  children: React.ReactNode;
}

export default function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main className={`flex-1 flex flex-col ${isAdminRoute ? "dark bg-[#050C1A] text-slate-100" : ""}`}>
        {children}
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <ConciergeModal />}
    </>
  );
}
