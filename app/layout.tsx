import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/src/context/AuthContext";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import ConciergeModal from "@/src/components/ConciergeModal";
import { Toaster } from "sonner";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#060E1A] text-slate-100">
        <AuthProvider>
          <Toaster richColors position="top-right" theme="dark" closeButton />
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <ConciergeModal />
        </AuthProvider>
      </body>
    </html>
  );
}

