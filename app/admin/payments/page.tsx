"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/src/lib/api";
import { PaymentRecord } from "@/src/types";
import { formatINR, formatApiError } from "@/src/lib/utils";
import { toast } from "sonner";
import { CreditCard, CheckCircle2, AlertCircle, RefreshCw, Hash, DollarSign } from "lucide-react";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = () => {
    setLoading(true);
    api
      .get<PaymentRecord[]>("/admin/payments")
      .then((res) => {
        setPayments(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(formatApiError(err));
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const totalCollected = payments
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">Payments Audit Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Razorpay checkout logs, advance tokens, balance charges, and cash receipts.
          </p>
        </div>

        <button
          onClick={loadPayments}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Payments
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-[#0A192F] border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Total Settled Revenue</span>
            <div className="font-heading text-2xl font-bold text-white mt-0.5">{formatINR(totalCollected)}</div>
          </div>
        </div>
        <span className="text-xs text-slate-400">{payments.length} Transactions Recorded</span>
      </div>

      <div className="rounded-3xl bg-[#0A192F] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Payment ID & Order</th>
                <th className="p-4">Booking Ref</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <p className="font-mono font-bold text-white">{p.razorpay_payment_id || p.id.slice(0, 12)}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Order: {p.razorpay_order_id || "Cash Manual"}</p>
                  </td>

                  <td className="p-4 font-mono text-[#D4AF37]">
                    #{p.booking_id.slice(0, 8)}
                  </td>

                  <td className="p-4 font-bold text-white text-sm">
                    {formatINR(p.amount)}
                  </td>

                  <td className="p-4">
                    <span className="capitalize font-semibold text-slate-300">
                      {p.payment_type.replace("_", " ")}
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        p.status === "success"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td className="p-4 text-slate-400 text-[11px]">
                    {p.paid_at ? p.paid_at.replace("T", " ").slice(0, 19) : p.created_at?.slice(0, 10)}
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
