"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/lib/api";
import { Vehicle, Location, Booking, PricingTier } from "@/src/types";
import { formatINR, computePricing, validateBusinessHours, formatApiError } from "@/src/lib/utils";
import { processRazorpayPayment } from "@/src/lib/razorpay";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Key,
  CreditCard,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const FALLBACK_VEHICLES: Vehicle[] = [
  {
    id: "v-rumion",
    name: "Toyota Rumion",
    type: "MPV",
    fuel_type: "Petrol + CNG",
    image_urls: [
      "https://pub-6e164401844e42a18bdff5533ec36d1f.r2.dev/vehicles/5f85e3cc-d253-4000-962c-b7f65fd6f6a9.jpg",
    ],
    price_per_24hrs: 3000,
    deposit_amount: 5000,
    overtime_rate_per_hour: 125,
    is_available: true,
    description: "7-seater with premium captain seats, smooth suspension, and ultra-economical CNG range.",
    seats: 7,
    transmission: "Manual",
  },
  {
    id: "v-thar-roxx",
    name: "Mahindra Thar Roxx",
    type: "SUV",
    fuel_type: "Diesel",
    image_urls: [
      "https://pub-6e164401844e42a18bdff5533ec36d1f.r2.dev/vehicles/9c87c784-9691-46f0-a8eb-341cfa9595e9.jpg",
    ],
    price_per_24hrs: 7848,
    deposit_amount: 8000,
    overtime_rate_per_hour: 327,
    is_available: true,
    description: "Iconic 4x4 off-roader with Harman Kardon sound, panoramic sunroof, and automatic gearbox.",
    seats: 5,
    transmission: "Automatic",
  },
  {
    id: "v-punch",
    name: "Tata Punch",
    type: "SUV",
    fuel_type: "Petrol + CNG",
    image_urls: [
      "https://pub-6e164401844e42a18bdff5533ec36d1f.r2.dev/vehicles/c12c75a4-4f38-4dd6-9b2d-0938c395f7b6.jpg",
    ],
    price_per_24hrs: 2808,
    deposit_amount: 3000,
    overtime_rate_per_hour: 117,
    is_available: true,
    description: "5-star GNCAP safety rated compact SUV, high ground clearance, and easy parking.",
    seats: 5,
    transmission: "Manual",
  },
  {
    id: "v-carens",
    name: "Kia Carens",
    type: "MPV",
    fuel_type: "Diesel",
    image_urls: [
      "https://pub-6e164401844e42a18bdff5533ec36d1f.r2.dev/vehicles/dedd5d17-11d5-4be2-97c8-433235b95392.jpg",
    ],
    price_per_24hrs: 4488,
    deposit_amount: 6000,
    overtime_rate_per_hour: 187,
    is_available: true,
    description: "Spacious 7-seater with rear AC vents, ventilated seats, and expansive boot space.",
    seats: 7,
    transmission: "Manual",
  },
  {
    id: "v-i20",
    name: "Hyundai i20",
    type: "Hatchback",
    fuel_type: "Petrol",
    image_urls: [
      "https://pub-6e164401844e42a18bdff5533ec36d1f.r2.dev/vehicles/59995f89-6e09-4c92-9f5a-49f9349fbfa5.jpg",
    ],
    price_per_24hrs: 2808,
    deposit_amount: 4000,
    overtime_rate_per_hour: 117,
    is_available: true,
    description: "Premium European styling, digital cluster, and crisp responsive steering for highway trips.",
    seats: 5,
    transmission: "Manual",
  },
  {
    id: "v-swift",
    name: "Maruti Swift",
    type: "Hatchback",
    fuel_type: "Petrol",
    image_urls: [
      "https://pub-6e164401844e42a18bdff5533ec36d1f.r2.dev/vehicles/c2443da4-3a61-4164-916e-5420eb76323c.jpg",
    ],
    price_per_24hrs: 2200,
    deposit_amount: 3000,
    overtime_rate_per_hour: 99,
    is_available: true,
    description: "City champion with 24 km/l fuel efficiency, wireless Apple CarPlay, and plush cabin.",
    seats: 5,
    transmission: "Manual",
  },
];

export default function BookingWizardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading reservation wizard...</p>
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

  const [step, setStep] = useState<number>(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>(FALLBACK_VEHICLES);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicleParam || FALLBACK_VEHICLES[0].id);
  const [pickupLocId, setPickupLocId] = useState<string>("");
  const [dropoffLocId, setDropoffLocId] = useState<string>("");
  const [pickupDate, setPickupDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [pickupTime, setPickupTime] = useState<string>("09:00");
  const [dropoffDate, setDropoffDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  });
  const [dropoffTime, setDropoffTime] = useState<string>("21:00");

  // Delivery Addon
  const [isDoorstep, setIsDoorstep] = useState<boolean>(doorstepParam);
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");

  // Payment & Booking Confirmation State
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<Vehicle[]>("/vehicles").catch(() => ({ data: [] })),
      api.get<Location[]>("/locations").catch(() => ({ data: [] })),
    ]).then(([vehRes, locRes]) => {
      const backendVehicles = vehRes.data && vehRes.data.length > 0 ? vehRes.data : [];
      const mergedVehicles = backendVehicles.length > 0 ? backendVehicles : FALLBACK_VEHICLES;
      setVehicles(mergedVehicles);

      const locList =
        locRes.data && locRes.data.length > 0
          ? locRes.data
          : [
              { id: "loc-kharghar", name: "Kharghar - Little World Mall (Sector 2)", address: "Navi Mumbai", is_active: true },
              { id: "loc-panvel", name: "Panvel - Orion Mall (Station Road)", address: "Navi Mumbai", is_active: true },
            ];
      setLocations(locList);
      setPickupLocId(locList[0].id);
      setDropoffLocId(locList[0].id);

      // Match vehicleParam by ID or name
      if (vehicleParam) {
        const cleanParam = vehicleParam.toLowerCase();
        const found =
          mergedVehicles.find((v) => v.id === vehicleParam || v.id.toLowerCase() === cleanParam) ||
          mergedVehicles.find((v) =>
            v.name.toLowerCase().includes(cleanParam.replace("v-", "").replace(/-/g, " "))
          );
        if (found) {
          setSelectedVehicleId(found.id);
        } else if (mergedVehicles[0]) {
          setSelectedVehicleId(mergedVehicles[0].id);
        }
      } else if (mergedVehicles[0]) {
        setSelectedVehicleId(mergedVehicles[0].id);
      }
      setLoading(false);
    });
  }, [vehicleParam]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0] || FALLBACK_VEHICLES[0];

  const breakdown = computePricing(selectedVehicle, tierParam, isDoorstep, false);

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
        pickup_location_id: pickupLocId || locations[0]?.id || "loc-kharghar",
        dropoff_location_id: dropoffLocId || locations[0]?.id || "loc-kharghar",
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
          setCreatedBooking(newBooking);
          setStep(5);
        }
      }
    } catch (err: unknown) {
      toast.error(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Initializing reservation wizard...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 lg:py-12 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Wizard Progress Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            <span>Step {step} of 5</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {step === 1 && "Vehicle & Schedule"}
              {step === 2 && "Delivery & Handover Mode"}
              {step === 3 && "Add-ons & Assurances"}
              {step === 4 && "Review & Payment"}
              {step === 5 && "Voucher & Keyless Pass"}
            </span>
          </div>

          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full bg-blue-600"
              initial={{ width: "20%" }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Wizard Card Body */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 lg:p-10 shadow-xl">
          {/* STEP 1: Vehicle & Schedule */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
                  Select Vehicle & Trip Schedule
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Choose your preferred model and scheduled dates. Handover is available from 05:00 AM to 11:00 PM.
                </p>
              </div>

              {/* Vehicle Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Vehicle Selection
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                  {vehicles.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        selectedVehicleId === v.id
                          ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 shadow-md shadow-blue-500/10 ring-1 ring-blue-600"
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={v.image_urls?.[0] || "https://pub-6e164401844e42a18bdff5533ec36d1f.r2.dev/vehicles/5f85e3cc-d253-4000-962c-b7f65fd6f6a9.jpg"}
                        alt={v.name}
                        className="w-16 h-12 rounded-xl object-contain bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{v.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{v.type} · {v.transmission}</p>
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">{formatINR(v.price_per_24hrs)}/24h</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule Dates & Times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Pickup Date & Time
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2 text-xs text-slate-900 dark:text-white font-medium"
                    />
                    <select
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2 text-xs text-slate-900 dark:text-white font-medium"
                    >
                      {Array.from({ length: 19 }).map((_, i) => {
                        const h = 5 + i;
                        const str = `${h < 10 ? "0" + h : h}:00`;
                        return <option key={str} value={str}>{str}</option>;
                      })}
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Drop-off Date & Time
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={dropoffDate}
                      onChange={(e) => setDropoffDate(e.target.value)}
                      className="h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2 text-xs text-slate-900 dark:text-white font-medium"
                    />
                    <select
                      value={dropoffTime}
                      onChange={(e) => setDropoffTime(e.target.value)}
                      className="h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2 text-xs text-slate-900 dark:text-white font-medium"
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
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-blue-700 shadow-md shadow-blue-500/20"
                >
                  Continue To Handover Mode <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery & Handover Mode */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
                  Choose Handover Mode
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Pick up at a Navi Mumbai mall hub or have the sanitized vehicle dispatched to your home / office.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setIsDoorstep(false)}
                  className={`p-6 rounded-2xl border text-left space-y-3 transition-all ${
                    !isDoorstep
                      ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 shadow-md shadow-blue-500/10 ring-1 ring-blue-600"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Mall Hub Handover (Free)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Pick up and drop off at Little World Mall Kharghar or Orion Mall Panvel.
                    </p>
                  </div>
                  <span className="inline-block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    ₹0 Extra Charge
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDoorstep(true)}
                  className={`p-6 rounded-2xl border text-left space-y-3 transition-all ${
                    isDoorstep
                      ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 shadow-md shadow-blue-500/10 ring-1 ring-blue-600"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Doorstep Delivery & Return (+₹499)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Our fleet executive delivers the sanitized vehicle to your doorstep and collects it on return.
                    </p>
                  </div>
                  <span className="inline-block text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                    Premium Convenience
                  </span>
                </button>
              </div>

              {!isDoorstep ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Pickup Hub</label>
                    <select
                      value={pickupLocId}
                      onChange={(e) => setPickupLocId(e.target.value)}
                      className="w-full h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 text-xs text-slate-900 dark:text-white font-medium"
                    >
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Drop-off Hub</label>
                    <select
                      value={dropoffLocId}
                      onChange={(e) => setDropoffLocId(e.target.value)}
                      className="w-full h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 text-xs text-slate-900 dark:text-white font-medium"
                    >
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    Doorstep Delivery Address in Navi Mumbai
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Enter building name, flat number, street and landmark (Kharghar, Panvel, Vashi, Belapur, Seawoods)..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              )}

              <div className="pt-4 flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setStep(3)}
                  className="rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 shadow-md shadow-blue-500/20"
                >
                  Continue To Add-ons & Assurances <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Add-ons & Trip Assurances */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
                  Trip Add-ons & Assurances
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Complimentary assurances and trip coverage included with your reservation.
                </p>
              </div>

              {/* Trip Assurances */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5" /> Included Free of Charge
                </div>
                <ul className="space-y-2 text-emerald-800 dark:text-emerald-300/90 pl-6 list-disc">
                  <li>Zero deposit deduction for standard wear & tear</li>
                  <li>Fastag automatic toll reconciliation</li>
                  <li>24/7 Roadside breakdown towing across Mumbai & Pune corridors</li>
                  <li>Clean, sanitized vehicle with full fuel tank on delivery/pickup</li>
                </ul>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(2)}
                  className="rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setStep(4)}
                  className="rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 shadow-md shadow-blue-500/20"
                >
                  Review Summary & Pay <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Review Summary & Payment Option */}
          {step === 4 && breakdown && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
                  Review Summary & Choose Payment
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Choose between 100% online payment, 20% advance token, or paying cash/UPI at the mall hub.
                </p>
              </div>

              {/* Booking Summary Box */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedVehicle?.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {pickupDate} ({pickupTime}) &rarr; {dropoffDate} ({dropoffTime})
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40">
                    {breakdown.durationLabel}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Base Vehicle Rent</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatINR(breakdown.finalRent)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Refundable Security Deposit</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatINR(breakdown.deposit)}</span>
                  </div>
                  {breakdown.doorstepFee > 0 && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Doorstep Delivery & Return</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{formatINR(breakdown.doorstepFee)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-base font-extrabold text-slate-900 dark:text-white">
                    <span>Total Amount</span>
                    <span className="text-blue-600 dark:text-blue-400">{formatINR(breakdown.totalPayable)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods Choice Cards */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select Payment Method
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option 1: 100% Full Payment */}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleCreateBooking("full")}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-blue-600 hover:bg-blue-50/50 dark:hover:bg-slate-700/50 text-left space-y-2 transition-all shadow-sm group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">Pay 100% Online</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">UPI, Cards, Netbanking</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block mt-1">
                      Pay {formatINR(breakdown.totalPayable)}
                    </span>
                  </button>

                  {/* Option 2: 20% Advance Token */}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleCreateBooking("partial")}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/30 text-left space-y-2 transition-all shadow-sm group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">Pay 20% Token</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Lock slot now; balance at site</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mt-1">
                      Pay {formatINR(Math.round(breakdown.totalPayable * 0.2))}
                    </span>
                  </button>

                  {/* Option 3: Pay at Site */}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleCreateBooking("site")}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-100/50 text-left space-y-2 transition-all shadow-sm group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-slate-950">Pay at Mall Hub</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Pay via cash or UPI at pickup</p>
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mt-1">
                      Pay at Handover
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(3)}
                  className="rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: Booking Voucher & Digital Key Confirmation */}
          {step === 5 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h2 className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white">Booking Reserved!</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Your reservation ID is <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">#{createdBooking?.id?.slice(0, 8) || "ROYAL78"}</span>.
                  A confirmation summary has been logged to your customer account.
                </p>
              </div>

              {/* Digital Handover Card */}
              <div className="max-w-md mx-auto p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-4 shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Rental Pass</span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50">
                    Handover Ready
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vehicle:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{createdBooking?.vehicle_name || selectedVehicle?.name}</span>
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
                    <span className="capitalize text-blue-600 dark:text-blue-400 font-semibold">{createdBooking?.status || "Confirmed"}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2">
                  <Key className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    Your keyless digital unlock widget is now active on your Customer Dashboard. Make sure your Driving License KYC is uploaded.
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/dashboard"
                  className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20"
                >
                  Go To Customer Dashboard &rarr;
                </Link>
                <Link
                  href="/kyc"
                  className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-700"
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
