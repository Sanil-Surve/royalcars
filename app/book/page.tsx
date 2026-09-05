"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/lib/api";
import { Vehicle, Location, Booking, PricingTier } from "@/src/types";
import { formatINR, computePricing, validateBusinessHours, formatApiError } from "@/src/lib/utils";
import { processRazorpayPayment } from "@/src/lib/razorpay";
import { toast } from "sonner";
import {
  Car,
  Calendar,
  Clock,
  MapPin,
  Truck,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Key,
  CreditCard,
  Banknote,
  FileCheck,
  Sparkles,
  QrCode,
} from "lucide-react";

export default function BookingWizardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-[#060E1A]">
          <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading reservation wizard...</p>
        </div>
      }
    >
      <BookingWizardContent />
    </React.Suspense>
  );
}

function BookingWizardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const vehicleParam = searchParams.get("vehicle") || "";
  const tierParam = (searchParams.get("tier") as PricingTier) || "daily";

  const doorstepParam = searchParams.get("doorstep") === "1";
  const businessParam = searchParams.get("business") === "1";

  const [step, setStep] = useState<number>(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicleParam);
  const [pickupLocId, setPickupLocId] = useState<string>("");
  const [dropoffLocId, setDropoffLocId] = useState<string>("");
  const [pickupDate, setPickupDate] = useState<string>("");
  const [pickupTime, setPickupTime] = useState<string>("09:00");
  const [dropoffDate, setDropoffDate] = useState<string>("");
  const [dropoffTime, setDropoffTime] = useState<string>("21:00");

  // Delivery & Business Addons
  const [isDoorstep, setIsDoorstep] = useState<boolean>(doorstepParam);
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [isBusiness, setIsBusiness] = useState<boolean>(businessParam);
  const [companyName, setCompanyName] = useState<string>("");
  const [gstin, setGstin] = useState<string>("");

  // Payment & Booking Confirmation State
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Default dates
    const today = new Date();
    const tom = new Date(today);
    tom.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);

    setPickupDate(tom.toISOString().split("T")[0]);
    setDropoffDate(dayAfter.toISOString().split("T")[0]);

    Promise.all([
      api.get<Vehicle[]>("/vehicles").catch(() => ({ data: [] })),
      api.get<Location[]>("/locations").catch(() => ({ data: [] })),
    ]).then(([vehRes, locRes]) => {
      setVehicles(vehRes.data || []);
      setLocations(locRes.data || []);
      if (locRes.data && locRes.data.length > 0) {
        setPickupLocId(locRes.data[0].id);
        setDropoffLocId(locRes.data[0].id);
      }
      if (!vehicleParam && vehRes.data && vehRes.data[0]) {
        setSelectedVehicleId(vehRes.data[0].id);
      }
      setLoading(false);
    });
  }, [vehicleParam]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  const breakdown = selectedVehicle
    ? computePricing(selectedVehicle, tierParam, isDoorstep, isBusiness)
    : null;

  // Handler for creating the booking on backend
  const handleCreateBooking = async (paymentOption: "full" | "partial" | "site") => {
    if (!user) {
      toast.info("Please sign in or create an account to finalize your booking.");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    if (!selectedVehicle) {
      toast.error("Please select a vehicle.");
      return;
    }

    if (!validateBusinessHours(pickupTime) || !validateBusinessHours(dropoffTime)) {
      toast.error("Pickup and Drop-off times must be between 5:00 AM and 11:00 PM.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create booking in backend
      const res = await api.post<Booking>("/bookings", {
        vehicle_id: selectedVehicle.id,
        pickup_location_id: pickupLocId || locations[0]?.id || "loc1",
        dropoff_location_id: dropoffLocId || locations[0]?.id || "loc1",
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        dropoff_date: dropoffDate,
        dropoff_time: dropoffTime,
      });

      const newBooking = res.data;

      // 2. Handle chosen payment option
      if (paymentOption === "site") {
        const siteRes = await api.post<Booking>("/payments/pay-at-site", {
          booking_id: newBooking.id,
        });
        setCreatedBooking(siteRes.data);
        setStep(5);
        toast.success("Booking confirmed! Pay at mall hub upon vehicle handover.");
      } else {
        // Razorpay Checkout
        const updated = await processRazorpayPayment(newBooking, paymentOption, (bk) => {
          setCreatedBooking(bk);
          setStep(5);
        });
        if (updated) {
          setCreatedBooking(updated);
          setStep(5);
        } else {
          // If cancelled or closed, still set booking so customer can see it
          setCreatedBooking(newBooking);
          setStep(5);
        }
      }
    } catch (err: any) {
      toast.error(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-[#060E1A]">
        <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Initializing reservation wizard...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#060E1A] py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Wizard Progress Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            <span>Step {step} of 5</span>
            <span className="text-[#D4AF37]">
              {step === 1 && "Vehicle & Schedule"}
              {step === 2 && "Delivery & Handover Mode"}
              {step === 3 && "Add-ons & SME GST"}
              {step === 4 && "Review & Payment"}
              {step === 5 && "Voucher & Keyless Pass"}
            </span>
          </div>

          <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <motion.div
              className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-400"
              initial={{ width: "20%" }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Wizard Card Body */}
        <div className="rounded-3xl bg-[#0A192F] border border-slate-800 p-6 sm:p-8 lg:p-10 shadow-2xl">
          {/* STEP 1: Vehicle & Schedule */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">Select Vehicle & Trip Schedule</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Choose your preferred model and scheduled dates. Handover is available from 05:00 AM to 11:00 PM.
                </p>
              </div>

              {/* Vehicle Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Vehicle Selection</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vehicles.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        selectedVehicleId === v.id
                          ? "bg-slate-900 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10"
                          : "bg-slate-950/60 border-slate-800 opacity-70 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={v.image_urls?.[0]}
                        alt={v.name}
                        className="w-16 h-12 rounded-xl object-cover border border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{v.name}</p>
                        <p className="text-[10px] text-slate-400">{v.type} · {v.transmission}</p>
                        <p className="text-xs font-bold text-[#D4AF37] mt-0.5">{formatINR(v.price_per_24hrs)}/24h</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule Dates & Times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Calendar className="w-4 h-4 text-[#D4AF37]" /> Pickup Date & Time
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="h-11 rounded-xl bg-slate-950 border border-slate-700 px-2 text-xs text-white"
                    />
                    <select
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="h-11 rounded-xl bg-slate-950 border border-slate-700 px-2 text-xs text-white"
                    >
                      {Array.from({ length: 19 }).map((_, i) => {
                        const h = 5 + i;
                        const str = `${h < 10 ? "0" + h : h}:00`;
                        return <option key={str} value={str}>{str}</option>;
                      })}
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Calendar className="w-4 h-4 text-[#D4AF37]" /> Drop-off Date & Time
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={dropoffDate}
                      onChange={(e) => setDropoffDate(e.target.value)}
                      className="h-11 rounded-xl bg-slate-950 border border-slate-700 px-2 text-xs text-white"
                    />
                    <select
                      value={dropoffTime}
                      onChange={(e) => setDropoffTime(e.target.value)}
                      className="h-11 rounded-xl bg-slate-950 border border-slate-700 px-2 text-xs text-white"
                    >
                      {Array.from({ length: 19 }).map((_, i) => {
                        const h = 5 + i;
                        const str = `${h < 10 ? "0" + h : h}:00`;
                        return <option key={str} value={str}>{str}</option>;
                      })}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-[#D4AF37] text-[#0A192F] font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-amber-400 shadow"
                >
                  Continue To Handover Mode <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery & Handover Mode */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">Choose Handover Mode</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Pick up at a Navi Mumbai mall hub or have the sanitized vehicle dispatched to your home / office.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setIsDoorstep(false)}
                  className={`p-6 rounded-2xl border text-left space-y-3 transition-all ${
                    !isDoorstep
                      ? "bg-slate-900 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10"
                      : "bg-slate-950 border-slate-800 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Mall Hub Handover (Free)</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Pick up and drop off at Little World Mall Kharghar or Orion Mall Panvel.
                    </p>
                  </div>
                  <span className="inline-block text-[10px] font-bold text-emerald-400 uppercase">₹0 Extra Charge</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDoorstep(true)}
                  className={`p-6 rounded-2xl border text-left space-y-3 transition-all ${
                    isDoorstep
                      ? "bg-slate-900 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10"
                      : "bg-slate-950 border-slate-800 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Doorstep Delivery & Return (+₹499)</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Our fleet executive delivers the sanitized vehicle to your doorstep and collects it on return.
                    </p>
                  </div>
                  <span className="inline-block text-[10px] font-bold text-[#D4AF37] uppercase">Premium Convenience</span>
                </button>
              </div>

              {!isDoorstep ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">Pickup Hub</label>
                    <select
                      value={pickupLocId}
                      onChange={(e) => setPickupLocId(e.target.value)}
                      className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-xs text-white"
                    >
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">Drop-off Hub</label>
                    <select
                      value={dropoffLocId}
                      onChange={(e) => setDropoffLocId(e.target.value)}
                      className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-xs text-white"
                    >
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Doorstep Delivery Address in Navi Mumbai
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter building name, flat number, street and landmark (Kharghar, Panvel, Vashi, Belapur, Seawoods)..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-xs text-white placeholder:text-slate-500"
                  />
                </div>
              )}

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold uppercase flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl bg-[#D4AF37] text-[#0A192F] font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-amber-400 shadow"
                >
                  Continue To Add-ons & GST <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Add-ons & SME Corporate GST Mode */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">Add-ons & Corporate Billing</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Configure business GST invoicing for tax input credit and extra trip assurances.
                </p>
              </div>

              {/* Business Fleet Toggle */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Book under SME / Corporate Account</p>
                      <p className="text-xs text-slate-400">Generate 18% GST invoice with input tax credit (ITC)</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isBusiness}
                    onChange={(e) => setIsBusiness(e.target.checked)}
                    className="w-5 h-5 rounded accent-[#D4AF37]"
                  />
                </label>

                {isBusiness && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-400">Registered Company Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Technologies Pvt Ltd"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full h-10 rounded-xl bg-slate-950 border border-slate-700 px-3 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-400">GSTIN Number (15-digit)</label>
                      <input
                        type="text"
                        placeholder="e.g. 27AABCR9821Q1Z4"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                        maxLength={15}
                        className="w-full h-10 rounded-xl bg-slate-950 border border-slate-700 px-3 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Trip Assurances */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" /> Included Free of Charge
                </div>
                <ul className="space-y-1 text-slate-400 pl-6 list-disc">
                  <li>Zero deposit deduction for standard wear & tear</li>
                  <li>Fastag automatic toll reconciliation</li>
                  <li>24/7 Roadside breakdown towing across Mumbai & Pune corridors</li>
                </ul>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold uppercase flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-3 rounded-xl bg-[#D4AF37] text-[#0A192F] font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-amber-400 shadow"
                >
                  Review Summary & Pay <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review Summary & Payment Option */}
          {step === 4 && breakdown && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">Review Summary & Choose Payment</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Choose between 100% online payment, 20% advance token, or paying cash/UPI at the mall hub.
                </p>
              </div>

              {/* Booking Summary Box */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedVehicle?.name}</h3>
                    <p className="text-xs text-slate-400">
                      {pickupDate} ({pickupTime}) &rarr; {dropoffDate} ({dropoffTime})
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#D4AF37] px-2.5 py-1 rounded-full bg-[#D4AF37]/15">
                    {breakdown.durationLabel}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Vehicle Rent</span>
                    <span className="font-semibold text-white">{formatINR(breakdown.finalRent)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Refundable Security Deposit</span>
                    <span className="font-semibold text-emerald-400">{formatINR(breakdown.deposit)}</span>
                  </div>
                  {breakdown.doorstepFee > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>Doorstep Delivery & Return</span>
                      <span className="font-semibold text-white">{formatINR(breakdown.doorstepFee)}</span>
                    </div>
                  )}
                  {breakdown.gstAmount > 0 && (
                    <div className="flex justify-between text-amber-300">
                      <span>GST (18% ITC)</span>
                      <span className="font-semibold">{formatINR(breakdown.gstAmount)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-extrabold text-white">
                    <span>Total Amount</span>
                    <span className="text-[#D4AF37]">{formatINR(breakdown.totalPayable)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods Choice Cards */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Payment Method</label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option 1: 100% Full Payment */}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleCreateBooking("full")}
                    className="p-4 rounded-2xl bg-slate-900 border border-[#D4AF37] hover:bg-slate-800/80 text-left space-y-2 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-[#D4AF37]">Pay 100% Online</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">UPI, Cards, Netbanking via Razorpay</p>
                    </div>
                    <span className="text-xs font-bold text-[#D4AF37] block mt-1">
                      Pay {formatINR(breakdown.totalPayable)}
                    </span>
                  </button>

                  {/* Option 2: 20% Advance Token */}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleCreateBooking("partial")}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-700 hover:border-[#D4AF37] hover:bg-slate-800/80 text-left space-y-2 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-[#D4AF37]">Pay 20% Advance Token</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Lock slot now; balance at handover</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 block mt-1">
                      Pay {formatINR(Math.round(breakdown.totalPayable * 0.2))}
                    </span>
                  </button>

                  {/* Option 3: Pay at Site */}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleCreateBooking("site")}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-700 hover:border-[#D4AF37] hover:bg-slate-800/80 text-left space-y-2 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-[#D4AF37]">Pay at Mall Hub</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Pay via cash or UPI at pickup</p>
                    </div>
                    <span className="text-xs font-bold text-cyan-400 block mt-1">
                      Pay at Handover
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold uppercase flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Booking Voucher & Digital Key Confirmation */}
          {step === 5 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h2 className="font-heading text-3xl font-extrabold text-white">Booking Reserved!</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Your reservation ID is <span className="font-mono text-[#D4AF37] font-bold">#{createdBooking?.id?.slice(0, 8) || "ROYAL78"}</span>.
                  A confirmation summary has been logged to your customer account.
                </p>
              </div>

              {/* Digital Handover Card */}
              <div className="max-w-md mx-auto p-6 rounded-3xl bg-slate-950 border border-[#D4AF37]/40 text-left space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase">Self-Drive Pass</span>
                  <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                    Handover Ready
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vehicle:</span>
                    <span className="font-bold text-white">{createdBooking?.vehicle_name || selectedVehicle?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pickup Date:</span>
                    <span>{createdBooking?.pickup_date || pickupDate} at {createdBooking?.pickup_time || pickupTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled Return:</span>
                    <span>{createdBooking?.dropoff_date || dropoffDate} at {createdBooking?.dropoff_time || dropoffTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="capitalize text-[#D4AF37] font-semibold">{createdBooking?.status || "Confirmed"}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                  <Key className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>
                    Your keyless digital unlock widget is now active on your Customer Dashboard. Make sure your Driving License KYC is uploaded.
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/dashboard"
                  className="px-6 py-3.5 rounded-xl bg-[#D4AF37] text-[#0A192F] font-bold text-xs uppercase tracking-wider hover:bg-amber-400 shadow-lg"
                >
                  Go To Customer Dashboard &rarr;
                </Link>
                <Link
                  href="/kyc"
                  className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold text-xs uppercase tracking-wider hover:bg-slate-800"
                >
                  Verify Driving License (KYC)
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
