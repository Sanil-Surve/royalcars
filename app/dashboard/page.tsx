"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/lib/api";
import { Booking } from "@/src/types";
import { formatINR, formatApiError } from "@/src/lib/utils";
import { processRazorpayPayment } from "@/src/lib/razorpay";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import DigitalKeyModal from "@/src/components/DigitalKeyModal";
import { toast } from "sonner";
import {
  Car,
  Key,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Receipt,
  Sparkles,
  Download,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/src/lib/utils";

export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForKey, setSelectedBookingForKey] = useState<Booking | null>(null);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all");

  const loadBookings = () => {
    api
      .get<Booking[]>("/bookings/my")
      .then((res) => {
        setBookings(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(formatApiError(err));
        setLoading(false);
      });
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handlePayBalance = async (booking: Booking) => {
    const updated = await processRazorpayPayment(booking, "balance", () => {
      loadBookings();
    });
    if (updated) {
      loadBookings();
    }
  };

  const activeBooking = bookings.find((b) => b.status === "active" || b.status === "confirmed");

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "active") return b.status === "active" || b.status === "confirmed" || b.status === "verified";
    if (activeTab === "completed") return b.status === "completed" || b.status === "cancelled";
    return true;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "confirmed":
        return "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "verified":
        return "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800";
      case "completed":
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      case "cancelled":
        return "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800";
      default:
        return "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ═══════════════ User Greeting & KYC Header Banner ═══════════════ */}
        <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Customer Portal
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              My Bookings &amp; Trips
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Welcome back, <span className="font-bold text-slate-900 dark:text-white">{user?.name || "Driver"}</span>. Manage your rental reservations, digital keyless passes, and GST invoices.
            </p>
          </div>

          {/* KYC Status Card */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shrink-0 relative z-10">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0",
                user?.kyc_status === "approved"
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                  : user?.kyc_status === "pending"
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                  : "bg-blue-100 dark:bg-blue-950/60 text-primary"
              )}
            >
              <FileCheck className="w-5 h-5" />
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Driver Verification
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white capitalize flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider",
                    user?.kyc_status === "approved"
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                      : user?.kyc_status === "pending"
                      ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                      : "bg-blue-50 dark:bg-blue-950/50 text-primary border-blue-200 dark:border-blue-800"
                  )}
                >
                  {user?.kyc_status === "approved"
                    ? "DL Verified"
                    : user?.kyc_status === "pending"
                    ? "Under Review"
                    : "KYC Pending"}
                </Badge>
              </div>
            </div>

            {user?.kyc_status !== "approved" && (
              <Link href="/kyc">
                <Button
                  size="sm"
                  className="ml-2 bg-primary hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Upload DL
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* ═══════════════ Active Ride Highlight Card ═══════════════ */}
        {activeBooking && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-gradient-to-br from-primary/5 via-blue-50/40 to-white dark:from-primary/10 dark:via-slate-900 dark:to-slate-900 border-2 border-primary/30 p-6 sm:p-8 shadow-md"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold shadow-md shadow-primary/25">
                  <Key className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      Active Digital Key Pass
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px] font-bold uppercase tracking-wider"
                    >
                      {activeBooking.status === "active" ? "Ride In Progress" : "Ready For Pickup"}
                    </Badge>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {activeBooking.vehicle_name}
                  </h2>
                </div>
              </div>

              {/* One-tap Keyless Unlock Button */}
              <Button
                onClick={() => setSelectedBookingForKey(activeBooking)}
                className="px-6 py-3 h-11 rounded-2xl bg-primary hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-primary/25 transition-all"
              >
                <Key className="w-4 h-4" /> Open Keyless Pass &amp; Fob
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-xs text-slate-600 dark:text-slate-300">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider">
                  Pickup Schedule
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {activeBooking.pickup_date} ({activeBooking.pickup_time})
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider">
                  Scheduled Return
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {activeBooking.dropoff_date} ({activeBooking.dropoff_time})
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider">
                  Paid Amount
                </span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatINR(activeBooking.paid_amount)}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider">
                  Remaining Balance
                </span>
                <span
                  className={cn(
                    "font-extrabold",
                    activeBooking.balance_amount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-400"
                  )}
                >
                  {formatINR(activeBooking.balance_amount)}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════ Bookings History Section ═══════════════ */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as "all" | "active" | "completed")}
            >
              <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl h-11 shadow-xs">
                <TabsTrigger
                  value="all"
                  className="text-xs font-bold rounded-xl px-4 data-active:bg-primary data-active:text-white"
                >
                  All ({bookings.length})
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="text-xs font-bold rounded-xl px-4 data-active:bg-primary data-active:text-white"
                >
                  Active / Upcoming
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="text-xs font-bold rounded-xl px-4 data-active:bg-primary data-active:text-white"
                >
                  Completed
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Link
              href="/vehicles"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline self-end sm:self-auto"
            >
              Book Another Car <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Car className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No Bookings Found in this Category
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Ready to explore? Reserve your car in Kharghar or Panvel with doorstep handover.
              </p>
              <Link
                href="/vehicles"
                className="inline-flex items-center gap-1.5 mt-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-primary/20 transition-all"
              >
                Explore Fleet <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={b.vehicle_image || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2"}
                        alt={b.vehicle_name}
                        className="w-16 h-12 rounded-xl object-contain bg-slate-50 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {b.vehicle_name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Booking #{b.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider",
                          getStatusBadgeVariant(b.status)
                        )}
                      >
                        {b.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600 dark:text-slate-300">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider">
                        Pickup
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {b.pickup_date} at {b.pickup_time}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider">
                        Return
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {b.dropoff_date} at {b.dropoff_time}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider">
                        Total Amount
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {formatINR(b.total_amount)}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider">
                        Balance Due
                      </span>
                      <span
                        className={cn(
                          "font-extrabold",
                          b.balance_amount > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                        )}
                      >
                        {formatINR(b.balance_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {(b.status === "active" || b.status === "confirmed") && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedBookingForKey(b)}
                          className="rounded-xl bg-primary hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                        >
                          <Key className="w-3.5 h-3.5" /> Keyless Pass
                        </Button>
                      )}

                      {b.balance_amount > 0 && b.status !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePayBalance(b)}
                          className="rounded-xl border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 font-bold text-xs flex items-center gap-1.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Pay Remaining {formatINR(b.balance_amount)}
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedInvoiceBooking(b)}
                        className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5 text-primary" /> Tax Invoice
                      </Button>
                    </div>

                    {b.km_driven != null && (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Odometer Log: <span className="font-bold text-slate-900 dark:text-white font-mono">{b.km_driven} km</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══════════════ Digital Key Modal ═══════════════ */}
        {selectedBookingForKey && (
          <DigitalKeyModal
            booking={selectedBookingForKey}
            isOpen={Boolean(selectedBookingForKey)}
            onClose={() => setSelectedBookingForKey(null)}
          />
        )}

        {/* ═══════════════ GST Tax Invoice Modal ═══════════════ */}
        <Dialog
          open={Boolean(selectedInvoiceBooking)}
          onOpenChange={(open) => {
            if (!open) setSelectedInvoiceBooking(null);
          }}
        >
          {selectedInvoiceBooking && (
            <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-slate-900 dark:text-slate-100 shadow-2xl rounded-3xl">
              <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 text-left">
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  Official GST Tax Invoice
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 font-mono">
                  Invoice #{selectedInvoiceBooking.id.slice(0, 8).toUpperCase()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 mt-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <p className="text-xs font-bold text-primary">Royal Cars Private Limited</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    GSTIN: 27AABCR9821Q1Z4 · Kharghar, Navi Mumbai
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Customer: {user?.name} ({user?.email})
                  </p>
                </div>

                <div className="space-y-2 py-2">
                  <div className="flex justify-between">
                    <span>Vehicle: {selectedInvoiceBooking.vehicle_name}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatINR(selectedInvoiceBooking.rent_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refundable Security Deposit:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatINR(selectedInvoiceBooking.deposit_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-blue-600 dark:text-blue-400">
                    <span>SGST (9%) + CGST (9%):</span>
                    <span className="font-medium">
                      {formatINR(Math.round(selectedInvoiceBooking.rent_amount * 0.18))} (ITC Claimable)
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between font-extrabold text-sm text-slate-900 dark:text-white">
                    <span>Total Amount Paid:</span>
                    <span className="text-primary text-base">
                      {formatINR(selectedInvoiceBooking.paid_amount || selectedInvoiceBooking.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button
                  onClick={() => window.print()}
                  className="rounded-xl bg-primary hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Print / Save PDF
                </Button>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </div>
  );
}
