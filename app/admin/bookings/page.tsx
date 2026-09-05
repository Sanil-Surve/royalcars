"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/src/lib/api";
import { Booking, BookingStatus } from "@/src/types";
import { formatINR, formatApiError } from "@/src/lib/utils";
import { toast } from "sonner";
import {
  Calendar,
  Search,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Banknote,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadBookings = () => {
    setLoading(true);
    const url = statusFilter === "all" ? "/admin/bookings" : `/admin/bookings?status=${statusFilter}`;
    api
      .get<Booking[]>(url)
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
  }, [statusFilter]);

  const handleMarkCashPaid = async (bookingId: string) => {
    if (!confirm("Confirm cash/UPI payment collected directly from customer at hub?")) return;
    try {
      await api.post(`/admin/bookings/${bookingId}/mark-balance-paid`);
      toast.success("Remaining balance marked as paid in full!");
      loadBookings();
    } catch (err: any) {
      toast.error(formatApiError(err));
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      await api.patch(`/admin/bookings/${bookingId}/status`, { status });
      toast.success(`Booking status changed to ${status}`);
      loadBookings();
    } catch (err: any) {
      toast.error(formatApiError(err));
    }
  };

  const filtered = bookings.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.vehicle_name?.toLowerCase().includes(q) ||
      b.customer_name?.toLowerCase().includes(q) ||
      b.customer_email?.toLowerCase().includes(q) ||
      b.customer_phone?.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">All Bookings Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete reservations history, customer contact logs, and manual cash settlement actions.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadBookings}
          className="border-slate-700 bg-slate-900 text-xs font-semibold text-slate-200 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh Bookings
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          {["all", "confirmed", "active", "verified", "pending_kyc", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors text-xs ${
                statusFilter === s ? "bg-[#D4AF37] text-[#0A192F]" : "text-slate-400 hover:text-white"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-900/90 border-slate-700 text-xs text-white"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-3xl bg-[#0A192F] border border-slate-800 overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-slate-950/80 border-b border-slate-800">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-3.5">Reservation ID & Car</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-3.5">Customer Details</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-3.5">Schedule</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-3.5">Financials</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-3.5">Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-3.5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-800/60">
            {filtered.map((b) => (
              <TableRow key={b.id} className="border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                <TableCell className="p-4 font-medium">
                  <p className="font-bold text-white text-sm">{b.vehicle_name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">#{b.id.slice(0, 8)}</p>
                </TableCell>

                <TableCell className="p-4">
                  <p className="font-semibold text-white">{b.customer_name || "—"}</p>
                  <p className="text-[11px] text-slate-400">{b.customer_phone || b.customer_email || "—"}</p>
                </TableCell>

                <TableCell className="p-4 text-[11px]">
                  <p>{b.pickup_date} ({b.pickup_time})</p>
                  <p className="text-slate-500">&darr; {b.dropoff_date} ({b.dropoff_time})</p>
                </TableCell>

                <TableCell className="p-4">
                  <p className="font-bold text-white">{formatINR(b.total_amount)}</p>
                  <p className="text-[10px] text-emerald-400">Paid: {formatINR(b.paid_amount)}</p>
                  {b.balance_amount > 0 && (
                    <p className="text-[10px] text-amber-400 font-bold">Due: {formatINR(b.balance_amount)}</p>
                  )}
                </TableCell>

                <TableCell className="p-4">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold px-2.5 py-0.5 uppercase ${
                      b.status === "active"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : b.status === "confirmed"
                        ? "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30"
                        : b.status === "completed"
                        ? "bg-slate-800 text-slate-400 border-slate-700"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {b.status.replace("_", " ")}
                  </Badge>
                </TableCell>

                <TableCell className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {b.balance_amount > 0 && (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleMarkCashPaid(b.id)}
                        className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 font-bold uppercase tracking-wider flex items-center gap-1"
                      >
                        <Banknote className="w-3 h-3" /> Mark Cash Paid
                      </Button>
                    )}

                    <select
                      value={b.status}
                      onChange={(e) => handleUpdateStatus(b.id, e.target.value as BookingStatus)}
                      className="h-8 rounded-lg bg-slate-900 border border-slate-700 px-2 text-[11px] text-slate-300 font-semibold focus:outline-none"
                    >
                      <option value="pending_kyc">Pending KYC</option>
                      <option value="verified">Verified</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
