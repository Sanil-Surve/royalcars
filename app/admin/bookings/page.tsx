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

        <button
          onClick={loadBookings}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Bookings
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          {["all", "confirmed", "active", "verified", "pending_kyc", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors ${
                statusFilter === s ? "bg-[#D4AF37] text-[#0A192F]" : "text-slate-400 hover:text-white"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-3xl bg-[#0A192F] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Reservation ID & Car</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Schedule</th>
                <th className="p-4">Financials</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-medium">
                    <p className="font-bold text-white text-sm">{b.vehicle_name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">#{b.id.slice(0, 8)}</p>
                  </td>

                  <td className="p-4">
                    <p className="font-semibold text-white">{b.customer_name || "—"}</p>
                    <p className="text-[11px] text-slate-400">{b.customer_phone || b.customer_email || "—"}</p>
                  </td>

                  <td className="p-4 text-[11px]">
                    <p>{b.pickup_date} ({b.pickup_time})</p>
                    <p className="text-slate-500">&darr; {b.dropoff_date} ({b.dropoff_time})</p>
                  </td>

                  <td className="p-4">
                    <p className="font-bold text-white">{formatINR(b.total_amount)}</p>
                    <p className="text-[10px] text-emerald-400">Paid: {formatINR(b.paid_amount)}</p>
                    {b.balance_amount > 0 && (
                      <p className="text-[10px] text-amber-400 font-bold">Due: {formatINR(b.balance_amount)}</p>
                    )}
                  </td>

                  <td className="p-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        b.status === "active"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : b.status === "confirmed"
                          ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30"
                          : b.status === "completed"
                          ? "bg-slate-800 text-slate-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {b.status.replace("_", " ")}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {b.balance_amount > 0 && (
                        <button
                          onClick={() => handleMarkCashPaid(b.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                        >
                          <Banknote className="w-3 h-3" /> Mark Cash Paid
                        </button>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
