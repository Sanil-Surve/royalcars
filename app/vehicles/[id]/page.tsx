"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { api } from "@/src/lib/api";
import { Vehicle, PricingTier } from "@/src/types";
import { formatINR, computePricing } from "@/src/lib/utils";
import {
  Users,
  Gauge,
  Fuel,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Truck,
  Building2,
  MapPin,
  Clock,
  ArrowRight,
  ChevronLeft,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/src/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VehicleDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const vehicleId = resolvedParams.id;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Booking Calculator in Sidebar
  const [selectedTier, setSelectedTier] = useState<PricingTier>("daily");
  const [doorstepDelivery, setDoorstepDelivery] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);

  useEffect(() => {
    api
      .get<Vehicle>(`/vehicles/${vehicleId}`)
      .then((res) => {
        setVehicle(res.data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback for demo ID if backend is offline
        setVehicle({
          id: vehicleId,
          name: "Hyundai Creta SX (O) Luxury",
          type: "SUV",
          fuel_type: "Petrol",
          image_urls: [
            "https://images.unsplash.com/photo-1758411898312-8592bb81e30d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwzfHxwcmVtaXVtJTIwd2hpdGUlMjBzdXYlMjBjYXJ8ZW58MHx8fHwxNzc2NzY1MTM5fDA&ixlib=rb-4.1.0&q=85",
            "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=940&q=80",
          ],
          price_per_24hrs: 2800,
          deposit_amount: 5000,
          overtime_rate_per_hour: 200,
          is_available: true,
          description:
            "The Hyundai Creta SX (O) delivers uncompromised elegance and commanding SUV presence. Equipped with a panoramic sunroof, ventilated captain seats, premium Bose audio, and automatic cruise control for Mumbai-Pune highway journeys.",
          seats: 5,
          transmission: "Automatic",
        });
        setLoading(false);
      });
  }, [vehicleId]);

  if (loading || !vehicle) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-[#060E1A]">
        <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Loading vehicle specifications...</p>
      </div>
    );
  }

  const breakdown = computePricing(vehicle, selectedTier, doorstepDelivery, isBusiness);

  return (
    <div className="w-full min-h-screen bg-[#060E1A] py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#D4AF37] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Fleet Catalog
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Gallery & Comprehensive Specs */}
          <div className="lg:col-span-7 space-y-8">
            {/* Main Featured Image with Glow */}
            <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={vehicle.image_urls?.[activeImageIndex] || vehicle.image_urls?.[0]}
                alt={vehicle.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute top-4 left-4">
                <Badge variant="outline" className="bg-[#0A192F]/85 backdrop-blur-md border-slate-700 text-xs font-bold text-[#D4AF37]">
                  {vehicle.type}
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge variant="outline" className="bg-emerald-500/20 backdrop-blur-md border-emerald-500/30 text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Verified & Sanitized
                </Badge>
              </div>
            </div>

            {/* Thumbnail Row if multiple images */}
            {vehicle.image_urls && vehicle.image_urls.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {vehicle.image_urls.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === i
                        ? "border-[#D4AF37] scale-105"
                        : "border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Specs & Description Section */}
            <div className="p-8 rounded-3xl bg-[#0A192F] border border-slate-800 space-y-6">
              <div>
                <h1 className="font-heading text-3xl font-bold text-white">{vehicle.name}</h1>
                <p className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wider mt-1">
                  Navi Mumbai Self-Drive Edition
                </p>
                <p className="text-sm text-slate-300 mt-4 leading-relaxed">{vehicle.description}</p>
              </div>

              {/* Technical Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <Users className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Capacity</span>
                  <span className="text-xs font-bold text-white">{vehicle.seats} Passengers</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <Gauge className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Transmission</span>
                  <span className="text-xs font-bold text-white">{vehicle.transmission}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <Fuel className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Fuel Type</span>
                  <span className="text-xs font-bold text-white">{vehicle.fuel_type}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Insurance</span>
                  <span className="text-xs font-bold text-white">Comprehensive</span>
                </div>
              </div>

              {/* Included Perks List */}
              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Included With Every Rental</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Bluetooth Keyless Pass Enabled
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 24/7 Roadside Assistance
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Sanitized Handover
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Fastag Enabled (All Toll Plazas)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Direct Booking & Interactive Tier Pricing */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0A192F] to-[#071529] border border-[#D4AF37]/50 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Pricing Plan</span>
                  <div className="font-heading text-3xl font-extrabold text-[#D4AF37] mt-0.5">
                    {formatINR(breakdown.finalRent)}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs px-3 py-1 bg-[#D4AF37]/15 text-[#D4AF37] font-bold border-[#D4AF37]/30">
                  {breakdown.durationLabel}
                </Badge>
              </div>

              {/* Tier Toggle Pills */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "hourly_6", label: "6 Hours", badge: null },
                  { id: "hourly_12", label: "12 Hours", badge: null },
                  { id: "daily", label: "Daily (24h)", badge: "Standard" },
                  { id: "weekly", label: "7-Day Pass", badge: "15% OFF" },
                  { id: "biweekly", label: "15-Day Pass", badge: "22% OFF" },
                  { id: "monthly", label: "Monthly Pass", badge: "30% OFF" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTier(t.id as PricingTier)}
                    className={`py-2 px-2 rounded-xl text-center border transition-all ${
                      selectedTier === t.id
                        ? "bg-[#D4AF37] text-[#0A192F] font-bold border-[#D4AF37] shadow-md"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-xs block leading-tight">{t.label}</span>
                    {t.badge && (
                      <span className={`text-[9px] font-bold ${selectedTier === t.id ? "text-[#0A192F]" : "text-emerald-400"}`}>
                        {t.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Toggles: Doorstep & Business Mode */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-[#D4AF37]" />
                    <div>
                      <p className="text-xs font-bold text-white">Doorstep Delivery (+₹499)</p>
                      <p className="text-[10px] text-slate-400">Delivered right to your doorstep or airport</p>
                    </div>
                  </div>
                  <Switch
                    checked={doorstepDelivery}
                    onCheckedChange={(val) => setDoorstepDelivery(val)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Business Fleet / GST Invoice</p>
                      <p className="text-[10px] text-slate-400">18% ITC credit for SME corporate accounts</p>
                    </div>
                  </div>
                  <Switch
                    checked={isBusiness}
                    onCheckedChange={(val) => setIsBusiness(val)}
                  />
                </div>
              </div>

              {/* Price Breakdown Sheet */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Base Vehicle Rent ({breakdown.durationLabel})</span>
                  <span className="font-semibold text-white">{formatINR(breakdown.baseRent)}</span>
                </div>

                {breakdown.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>{breakdown.tierLabel} Discount ({breakdown.discountPercent}%)</span>
                    <span>-{formatINR(breakdown.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>100% Refundable Security Deposit</span>
                  <span className="font-semibold text-emerald-300">{formatINR(breakdown.deposit)}</span>
                </div>

                {breakdown.doorstepFee > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Doorstep Delivery & Collection</span>
                    <span className="font-semibold text-white">{formatINR(breakdown.doorstepFee)}</span>
                  </div>
                )}

                {breakdown.gstAmount > 0 && (
                  <div className="flex justify-between text-amber-300">
                    <span>GST (18% ITC applicable)</span>
                    <span className="font-semibold">{formatINR(breakdown.gstAmount)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                  <span>Total Due Today</span>
                  <span className="text-[#D4AF37]">{formatINR(breakdown.totalPayable)}</span>
                </div>
              </div>

              {/* Overtime Policy Note */}
              <div className="text-[11px] text-slate-400">
                Overtime rate: <span className="text-white font-semibold">{formatINR(vehicle.overtime_rate_per_hour)}/hr</span>. Deposit refunded within 4h after safe car return.
              </div>

              {/* Direct Booking CTA */}
              <Link
                href={`/book?vehicle=${vehicle.id}&tier=${selectedTier}${doorstepDelivery ? "&doorstep=1" : ""}${isBusiness ? "&business=1" : ""}`}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full h-12 bg-gradient-to-r from-[#D4AF37] to-amber-400 text-[#0A192F] font-bold text-sm uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#D4AF37]/25 flex items-center justify-center gap-2"
                )}
              >
                Proceed To Booking Wizard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
