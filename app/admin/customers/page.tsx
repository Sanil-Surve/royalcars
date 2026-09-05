"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/src/lib/api";
import { User } from "@/src/types";
import { formatApiError } from "@/src/lib/utils";
import { toast } from "sonner";
import { Users, Search, ShieldCheck, Mail, Phone, Calendar, RefreshCw } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadCustomers = () => {
    setLoading(true);
    api
      .get<User[]>("/admin/customers")
      .then((res) => {
        setCustomers(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(formatApiError(err));
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">Registered Customer Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse verified drivers, reservation histories, and contact information.
          </p>
        </div>

        <button
          onClick={loadCustomers}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Customers
        </button>
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by customer name, email, phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
        />
      </div>

      <div className="rounded-3xl bg-[#0A192F] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">KYC Status</th>
                <th className="p-4">Completed Bookings</th>
                <th className="p-4">Member Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-white text-sm">{c.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">ID: #{c.id.slice(0, 8)}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-white flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {c.email}</p>
                    <p className="text-slate-400 flex items-center gap-1.5 mt-0.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {c.phone || "—"}</p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        c.kyc_status === "approved"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : c.kyc_status === "rejected"
                          ? "bg-rose-500/20 text-rose-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {c.kyc_status}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-white">
                    {c.booking_count || 0} reservations
                  </td>
                  <td className="p-4 text-slate-400">
                    {c.created_at ? c.created_at.slice(0, 10) : "—"}
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
