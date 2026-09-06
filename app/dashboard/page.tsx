"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
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
  FileText,
  ShieldCheck,
  Receipt,
  FileCheck,
  ExternalLink,
  Sparkles,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

  return (
    <div className="w-full min-h-screen bg-[#060E1A] py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Greeting & KYC Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0A192F] via-[#0d213a] to-[#0A192F] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-1 block">
              Customer Portal
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              Welcome back, {user?.name || "Driver"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage your bookings, digital keyless passes, and trip receipts.
            </p>
          </div>

          {/* KYC Status Badge */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-700">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                user?.kyc_status === "approved"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/20 text-amber-400"
              }`}
            >
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Verification Status</div>
              <div className="text-xs font-bold text-white capitalize flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant={user?.kyc_status === "approved" ? "secondary" : "outline"}
                  className={`text-[10px] font-bold ${
                    user?.kyc_status === "approved"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {user?.kyc_status === "approved"
                    ? "DL Approved"
                    : user?.kyc_status === "pending"
                    ? "In Review"
                    : "KYC Pending"}
                </Badge>
              </div>
            </div>
            {user?.kyc_status !== "approved" && (
              <Link href="/kyc">
                <Button size="xs" className="ml-2 bg-[#D4AF37] text-[#0A192F] text-[10px] font-bold uppercase tracking-wider hover:bg-amber-400 rounded-lg">
                  Upload DL
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Active Ride Highlight Card (Keyless Unlock Feature) */}
        {activeBooking && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0B1E38] via-[#08172c] to-[#0A192F] border-2 border-[#D4AF37] shadow-2xl shadow-[#D4AF37]/10"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37] text-[#0A192F] flex items-center justify-center font-bold shadow-lg">
                  <Key className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Active Digital Pass</span>
                    <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                      {activeBooking.status === "active" ? "Ride In Progress" : "Ready For Pickup"}
                    </Badge>
                  </div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-white mt-0.5">
                    {activeBooking.vehicle_name}
                  </h2>
                </div>
              </div>

              {/* One-tap Keyless Unlock Button */}
              <Button
                onClick={() => setSelectedBookingForKey(activeBooking)}
                className="px-6 py-3 h-11 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all scale-100 hover:scale-105"
              >
                <Key className="w-4 h-4" /> Open Keyless Pass & Fob
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-xs text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Pickup Time</span>
                <span className="font-semibold text-white">
                  {activeBooking.pickup_date} ({activeBooking.pickup_time})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Scheduled Return</span>
                <span className="font-semibold text-white">
                  {activeBooking.dropoff_date} ({activeBooking.dropoff_time})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Paid So Far</span>
                <span className="font-semibold text-emerald-400">{formatINR(activeBooking.paid_amount)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Remaining Balance</span>
                <span className={`font-semibold ${activeBooking.balance_amount > 0 ? "text-amber-400" : "text-slate-400"}`}>
                  {formatINR(activeBooking.balance_amount)}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bookings History Tabs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "all" | "active" | "completed")}>
              <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-2xl h-10">
                <TabsTrigger value="all" className="text-xs font-bold rounded-xl data-active:bg-[#D4AF37] data-active:text-[#0A192F]">
                  All ({bookings.length})
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs font-bold rounded-xl data-active:bg-[#D4AF37] data-active:text-[#0A192F]">
                  Active / Upcoming
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-xs font-bold rounded-xl data-active:bg-[#D4AF37] data-active:text-[#0A192F]">
                  Completed
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Link
              href="/vehicles"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] hover:underline"
            >
              Book Another Car &rarr;
            </Link>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0A192F] border border-slate-800 space-y-3">
              <Car className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="font-heading text-lg font-bold text-white">No Bookings Found in this Category</h3>
              <p className="text-xs text-slate-400">Ready to explore? Reserve your premium car in Kharghar or Panvel now.</p>
              <Link
                href="/vehicles"
                className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#0A192F] text-xs font-bold uppercase tracking-wider"
              >
                Explore Fleet
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-6 rounded-3xl bg-[#0A192F] border border-slate-800 hover:border-slate-700 transition-colors space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={b.vehicle_image || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2"}
                        alt={b.vehicle_name}
                        className="w-16 h-12 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <h3 className="text-base font-bold text-white">{b.vehicle_name}</h3>
                        <p className="text-[11px] text-slate-400 font-mono">ID: #{b.id.slice(0, 8)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={b.status === "active" ? "secondary" : "outline"}
                        className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                          b.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : b.status === "confirmed"
                            ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30"
                            : b.status === "completed"
                            ? "bg-slate-800 text-slate-300"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {b.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Pickup</span>
                      <span>{b.pickup_date} at {b.pickup_time}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Return</span>
                      <span>{b.dropoff_date} at {b.dropoff_time}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Total Amount</span>
                      <span className="font-bold text-white">{formatINR(b.total_amount)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Balance Due</span>
                      <span className={b.balance_amount > 0 ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                        {formatINR(b.balance_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {(b.status === "active" || b.status === "confirmed") && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedBookingForKey(b)}
                          className="rounded-xl bg-[#D4AF37] text-[#0A192F] font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400"
                        >
                          <Key className="w-3.5 h-3.5" /> Keyless Pass
                        </Button>
                      )}

                      {b.balance_amount > 0 && b.status !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePayBalance(b)}
                          className="rounded-xl bg-slate-900 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 font-bold text-xs flex items-center gap-1.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Pay Remaining {formatINR(b.balance_amount)}
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedInvoiceBooking(b)}
                        className="rounded-xl bg-slate-900 border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5 text-[#D4AF37]" /> GST Tax Invoice
                      </Button>
                    </div>

                    {b.km_driven != null && (
                      <span className="text-[11px] text-slate-400">
                        Distance Driven: <span className="font-bold text-white font-mono">{b.km_driven} km</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Digital Key Modal */}
        {selectedBookingForKey && (
          <DigitalKeyModal
            booking={selectedBookingForKey}
            isOpen={Boolean(selectedBookingForKey)}
            onClose={() => setSelectedBookingForKey(null)}
          />
        )}

        {/* GST Tax Invoice Modal with shadcn Dialog */}
        <Dialog open={Boolean(selectedInvoiceBooking)} onOpenChange={(open) => { if (!open) setSelectedInvoiceBooking(null); }}>
          {selectedInvoiceBooking && (
            <DialogContent className="max-w-lg bg-slate-950 border border-slate-700 p-6 sm:p-8 text-slate-100 shadow-2xl rounded-3xl">
              <DialogHeader className="pb-3 border-b border-slate-800 text-left">
                <DialogTitle className="font-heading text-lg font-bold text-white">Official Tax Invoice</DialogTitle>
                <DialogDescription className="text-[11px] text-slate-400 font-mono">
                  Invoice #{selectedInvoiceBooking.id.slice(0, 8).toUpperCase()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-xs text-slate-300 mt-2">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <p className="text-[11px] font-bold text-[#D4AF37]">Royal Cars Private Limited</p>
                  <p className="text-[10px] text-slate-400">GSTIN: 27AABCR9821Q1Z4 · Kharghar, Navi Mumbai</p>
                  <p className="text-[10px] text-slate-400">Customer: {user?.name} ({user?.email})</p>
                </div>

                <div className="space-y-1.5 py-2">
                  <div className="flex justify-between">
                    <span>Vehicle: {selectedInvoiceBooking.vehicle_name}</span>
                    <span>{formatINR(selectedInvoiceBooking.rent_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refundable Security Deposit:</span>
                    <span>{formatINR(selectedInvoiceBooking.deposit_amount)}</span>
                  </div>
                  <div className="flex justify-between text-amber-300">
                    <span>SGST (9%) + CGST (9%):</span>
                    <span>{formatINR(Math.round(selectedInvoiceBooking.rent_amount * 0.18))} (ITC Claimable)</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                    <span>Total Amount Paid:</span>
                    <span className="text-[#D4AF37]">{formatINR(selectedInvoiceBooking.paid_amount || selectedInvoiceBooking.total_amount)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <Button
                  onClick={() => window.print()}
                  className="rounded-xl bg-[#D4AF37] text-[#0A192F] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-amber-400"
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
