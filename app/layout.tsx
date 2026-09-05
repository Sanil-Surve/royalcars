import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Noto_Serif } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/src/context/AuthContext";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import ConciergeModal from "@/src/components/ConciergeModal";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const notoSerifHeading = Noto_Serif({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Royal Cars | Luxury Self-Drive Car Rentals Navi Mumbai",
  description:
    "Premium self-drive car rentals across Kharghar, Panvel & Navi Mumbai. Instant booking, keyless unlock, doorstep delivery, hourly/daily/monthly flexible pricing, and SME business fleet accounts.",
  icons: {
    icon: "/favicon.ico",
  },
};

import { TooltipProvider } from "@/components/ui/tooltip";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("h-full dark", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable, notoSerifHeading.variable)}
    >
      <body className="min-h-full flex flex-col bg-[#060E1A] text-slate-100">
        <AuthProvider>
          <TooltipProvider>
            <Toaster richColors position="top-right" theme="dark" closeButton />
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
            <ConciergeModal />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

