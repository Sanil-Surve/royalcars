"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/src/lib/api";
import { AdminMetrics, Booking } from "@/src/types";
import { formatINR, formatApiError } from "@/src/lib/utils";
import { toast } from "sonner";
import {
  TrendingUp,
  Car,
  FileCheck,
  Calendar,
  AlertCircle,
  Play,
  Square,
  CheckCircle2,
  Gauge,
  Fuel,
  Camera,
  DollarSign,
  Clock,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [activeRides, setActiveRides] = useState<Booking[]>([]);
  const [confirmedRides, setConfirmedRides] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Start Ride Modal State
  const [startRideBooking, setStartRideBooking] = useState<Booking | null>(null);
  const [startOdo, setStartOdo] = useState<number>(15000);
  const [startFuel, setStartFuel] = useState<string>("Full");
  const [startPhotos, setStartPhotos] = useState<string>("");
  const [startNotes, setStartNotes] = useState<string>("Sanitized and clean handover at hub.");
  const [submittingStart, setSubmittingStart] = useState(false);

  // End Ride Modal State
  const [endRideBooking, setEndRideBooking] = useState<Booking | null>(null);
  const [endOdo, setEndOdo] = useState<number>(15250);
  const [endFuel, setEndFuel] = useState<string>("Full");
  const [endPhotos, setEndPhotos] = useState<string>("");
  const [extraCharges, setExtraCharges] = useState<number>(0);
  const [extraReason, setExtraReason] = useState<string>("");
  const [endNotes, setEndNotes] = useState<string>("Vehicle returned in good condition.");
  const [submittingEnd, setSubmittingEnd] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get<AdminMetrics>("/admin/metrics").catch(() => ({ data: null })),
      api.get<Booking[]>("/admin/active-rides").catch(() => ({ data: [] })),
      api.get<Booking[]>("/admin/confirmed-rides").catch(() => ({ data: [] })),
    ]).then(([mRes, aRes, cRes]) => {
      setMetrics(mRes.data);
      setActiveRides(aRes.data || []);
      setConfirmedRides(cRes.data || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startRideBooking) return;
    setSubmittingStart(true);
    try {
      const photosArray = startPhotos
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);

      await api.post(`/admin/bookings/${startRideBooking.id}/start-ride`, {
        odometer_start: Number(startOdo),
        fuel_level_start: startFuel,
        photo_urls: photosArray,
        notes: startNotes,
      });

      toast.success(`Ride started for ${startRideBooking.vehicle_name}!`);
      setStartRideBooking(null);
      loadData();
    } catch (err: any) {
      toast.error(formatApiError(err));
    } finally {
      setSubmittingStart(false);
    }
  };

  const handleEndRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!endRideBooking) return;
    setSubmittingEnd(true);
    try {
      const photosArray = endPhotos
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);

      await api.post(`/admin/bookings/${endRideBooking.id}/end-ride`, {
        odometer_end: Number(endOdo),
        fuel_level_end: endFuel,
        photo_urls: photosArray,
        notes: endNotes,
        extra_charges: Number(extraCharges),
        extra_charges_reason: extraReason || null,
      });

      toast.success(`Ride completed for ${endRideBooking.vehicle_name}! Vehicle returned to available fleet.`);
      setEndRideBooking(null);
      loadData();
    } catch (err: any) {
      toast.error(formatApiError(err));
    } finally {
      setSubmittingEnd(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">Operations & Rides Console</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time fleet utilization, active handover dispatches, and return check-ins.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border-slate-700 text-xs font-semibold text-slate-200 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Live Data
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 rounded-2xl bg-[#0A192F] border-slate-800 space-y-2">
          <CardContent className="p-0 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Revenue</span>
              <DollarSign className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <p className="font-heading text-2xl font-bold text-white">
              {formatINR(metrics?.revenue || 0)}
            </p>
            <span className="text-[10px] text-slate-500">Collected via Razorpay & Hub</span>
          </CardContent>
        </Card>

        <Card className="p-5 rounded-2xl bg-[#0A192F] border-slate-800 space-y-2">
          <CardContent className="p-0 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Active Dispatches</span>
              <Car className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="font-heading text-2xl font-bold text-emerald-400">
              {activeRides.length} <span className="text-xs text-slate-400 font-sans font-normal">on road</span>
            </p>
            <span className="text-[10px] text-slate-500">
              {metrics?.fleet_utilization || 0}% Fleet Utilization
            </span>
          </CardContent>
        </Card>

        <Card className="p-5 rounded-2xl bg-[#0A192F] border-slate-800 space-y-2">
          <CardContent className="p-0 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Pending KYC Queue</span>
              <FileCheck className="w-4 h-4 text-amber-400" />
            </div>
            <p className="font-heading text-2xl font-bold text-amber-400">
              {metrics?.pending_kyc || 0}
            </p>
            <span className="text-[10px] text-slate-500">Awaiting verification review</span>
          </CardContent>
        </Card>

        <Card className="p-5 rounded-2xl bg-[#0A192F] border-slate-800 space-y-2">
          <CardContent className="p-0 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Pending Balances</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="font-heading text-2xl font-bold text-white">
              {formatINR(metrics?.pending_balance || 0)}
            </p>
            <span className="text-[10px] text-slate-500">Collect at physical handover</span>
          </CardContent>
        </Card>
      </div>

      {/* Confirmed Bookings Ready for Handover ("Start Ride" Flow) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Ready for Handover ({confirmedRides.length})
            </h2>
            <p className="text-xs text-slate-400">Confirmed customer reservations ready for vehicle dispatch.</p>
          </div>
        </div>

        {confirmedRides.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#0A192F] border border-slate-800 text-center text-xs text-slate-400">
            No confirmed bookings waiting for handover at this moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {confirmedRides.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-[#0A192F] border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">{b.vehicle_name}</h3>
                    <p className="text-[11px] text-slate-400">
                      Customer: <span className="text-white font-medium">{b.customer_name || "Driver"}</span> ({b.customer_phone || "—"})
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs font-bold text-[#D4AF37] px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border-[#D4AF37]/30">
                    #{b.id.slice(0, 8)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Pickup Scheduled</span>
                    <span>{b.pickup_date} at {b.pickup_time}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Balance to Collect</span>
                    <span className="font-bold text-amber-400">{formatINR(b.balance_amount)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => {
                      setStartRideBooking(b);
                      setStartOdo(15000);
                    }}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Initiate Handover / Start Ride
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Currently Active In-Progress Rides ("End Ride" Flow) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" /> Live Active Rides ({activeRides.length})
            </h2>
            <p className="text-xs text-slate-400">Cars currently on the road with customers.</p>
          </div>
        </div>

        {activeRides.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#0A192F] border border-slate-800 text-center text-xs text-slate-400">
            No active rides on the road right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRides.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-gradient-to-br from-[#0A192F] to-[#07172b] border border-emerald-500/40 space-y-3 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">{b.vehicle_name}</h3>
                    <p className="text-[11px] text-slate-400">
                      Driver: <span className="text-white font-medium">{b.customer_name || "Customer"}</span> ({b.customer_phone || "—"})
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border-emerald-500/30">
                    Active
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Start Odo</span>
                    <span className="font-mono font-bold text-white">{b.odometer_start || 0} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Start Fuel</span>
                    <span className="font-bold text-white">{b.fuel_level_start || "Full"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Return Due</span>
                    <span className="font-bold text-white">{b.dropoff_date} ({b.dropoff_time})</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => {
                      setEndRideBooking(b);
                      setEndOdo((b.odometer_start || 15000) + 120);
                      setExtraCharges(0);
                    }}
                    className="rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0A192F] font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" /> Process Return / End Ride
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* START RIDE MODAL with shadcn Dialog */}
      <Dialog open={Boolean(startRideBooking)} onOpenChange={(open) => { if (!open) setStartRideBooking(null); }}>
        {startRideBooking && (
          <DialogContent className="max-w-lg rounded-3xl bg-slate-950 border border-slate-700 p-6 sm:p-8 space-y-4 text-slate-100 shadow-2xl">
            <DialogHeader className="pb-3 border-b border-slate-800 text-left">
              <DialogTitle className="font-heading text-lg font-bold text-white">Start Ride & Vehicle Handover</DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                {startRideBooking.vehicle_name} · #{startRideBooking.id.slice(0, 8)}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleStartRide} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold uppercase text-slate-400">Starting Odometer Reading (km) *</label>
                <Input
                  type="number"
                  required
                  min={0}
                  value={startOdo}
                  onChange={(e) => setStartOdo(Number(e.target.value))}
                  className="w-full h-11 rounded-xl bg-slate-900 border-slate-700 px-3 text-sm text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase text-slate-400">Starting Fuel Level</label>
                <select
                  value={startFuel}
                  onChange={(e) => setStartFuel(e.target.value)}
                  className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-xs text-white"
                >
                  <option value="Full">Full Tank (100%)</option>
                  <option value="3/4">3/4 Tank (75%)</option>
                  <option value="1/2">1/2 Tank (50%)</option>
                  <option value="1/4">1/4 Tank (25%)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase text-slate-400">Inspection Photo URLs (One per line)</label>
                <Textarea
                  rows={2}
                  placeholder="https://... photo1&#10;https://... photo2"
                  value={startPhotos}
                  onChange={(e) => setStartPhotos(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border-slate-700 p-2 text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase text-slate-400">Handover Notes</label>
                <Input
                  type="text"
                  value={startNotes}
                  onChange={(e) => setStartNotes(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-900 border-slate-700 px-3 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStartRideBooking(null)}
                  className="rounded-xl bg-slate-900 text-slate-400 font-bold border-slate-700"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submittingStart}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider shadow"
                >
                  {submittingStart ? "Starting..." : "Confirm & Start Ride"}
                </Button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>

      {/* END RIDE MODAL with shadcn Dialog */}
      <Dialog open={Boolean(endRideBooking)} onOpenChange={(open) => { if (!open) setEndRideBooking(null); }}>
        {endRideBooking && (
          <DialogContent className="max-w-lg rounded-3xl bg-slate-950 border border-slate-700 p-6 sm:p-8 space-y-4 text-slate-100 shadow-2xl">
            <DialogHeader className="pb-3 border-b border-slate-800 text-left">
              <DialogTitle className="font-heading text-lg font-bold text-white">Process Return & End Ride</DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                {endRideBooking.vehicle_name} · Start: {endRideBooking.odometer_start || 0} km
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEndRide} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold uppercase text-slate-400">Ending Odometer Reading (km) *</label>
                <Input
                  type="number"
                  required
                  min={endRideBooking.odometer_start || 0}
                  value={endOdo}
                  onChange={(e) => setEndOdo(Number(e.target.value))}
                  className="w-full h-11 rounded-xl bg-slate-900 border-slate-700 px-3 text-sm text-white font-mono"
                />
                <span className="text-[10px] text-slate-400">
                  Total distance driven: <span className="font-bold text-[#D4AF37]">{Math.max(0, endOdo - (endRideBooking.odometer_start || 0))} km</span>
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase text-slate-400">Ending Fuel Level</label>
                <select
                  value={endFuel}
                  onChange={(e) => setEndFuel(e.target.value)}
                  className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-xs text-white"
                >
                  <option value="Full">Full Tank (100%)</option>
                  <option value="3/4">3/4 Tank (75%)</option>
                  <option value="1/2">1/2 Tank (50%)</option>
                  <option value="1/4">1/4 Tank (25%)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-slate-400">Extra Charges (₹)</label>
                  <Input
                    type="number"
                    min={0}
                    value={extraCharges}
                    onChange={(e) => setExtraCharges(Number(e.target.value))}
                    className="w-full h-10 rounded-xl bg-slate-900 border-slate-700 px-3 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase text-slate-400">Reason (if any)</label>
                  <Input
                    type="text"
                    placeholder="e.g. Deep dry cleaning"
                    value={extraReason}
                    onChange={(e) => setExtraReason(e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-900 border-slate-700 px-3 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase text-slate-400">Return Inspection Photos (One per line)</label>
                <Textarea
                  rows={2}
                  placeholder="https://... photo1&#10;https://... photo2"
                  value={endPhotos}
                  onChange={(e) => setEndPhotos(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border-slate-700 p-2 text-xs text-white font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEndRideBooking(null)}
                  className="rounded-xl bg-slate-900 text-slate-400 font-bold border-slate-700"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submittingEnd}
                  className="rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0A192F] font-bold uppercase tracking-wider shadow"
                >
                  {submittingEnd ? "Processing..." : "Complete & Close Ride"}
                </Button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
