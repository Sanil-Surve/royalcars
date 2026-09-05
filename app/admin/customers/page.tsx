"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/src/lib/api";
import { User } from "@/src/types";
import { formatApiError } from "@/src/lib/utils";
import { toast } from "sonner";
import { Users, Search, ShieldCheck, Mail, Phone, Calendar, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

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

        <Button
          variant="outline"
          size="sm"
          onClick={loadCustomers}
          className="border-slate-700 bg-slate-900 text-xs font-semibold text-slate-200 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh Customers
        </Button>
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Search by customer name, email, phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-slate-900/90 border-slate-700 text-xs text-white"
        />
      </div>

      <div className="rounded-3xl bg-[#0A192F] border border-slate-800 overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-slate-950/80 border-b border-slate-800">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-3.5">Customer</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-3.5">Contact</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-3.5">KYC Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-3.5">Completed Bookings</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-3.5">Member Since</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-800/60">
            {filtered.map((c) => (
              <TableRow key={c.id} className="border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                <TableCell className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-slate-700 bg-slate-800">
                      <AvatarFallback className="bg-slate-800 text-[#D4AF37] font-bold text-xs">
                        {c.name?.slice(0, 2).toUpperCase() || "RC"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-white text-sm">{c.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">ID: #{c.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="p-4">
                  <p className="text-white flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {c.email}</p>
                  <p className="text-slate-400 flex items-center gap-1.5 mt-0.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {c.phone || "—"}</p>
                </TableCell>
                <TableCell className="p-4">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold px-2.5 py-0.5 uppercase ${
                      c.kyc_status === "approved"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : c.kyc_status === "rejected"
                        ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {c.kyc_status}
                  </Badge>
                </TableCell>
                <TableCell className="p-4 font-bold text-white">
                  {c.booking_count || 0} reservations
                </TableCell>
                <TableCell className="p-4 text-slate-400">
                  {c.created_at ? c.created_at.slice(0, 10) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
