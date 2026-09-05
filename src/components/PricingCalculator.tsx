"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { PricingTier, Vehicle } from "@/src/types";
import { computePricing, formatINR } from "@/src/lib/utils";
import { Check, Sparkles, Building2, Truck, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface PricingCalculatorProps {
  vehicles?: Vehicle[];
  defaultVehicle?: Vehicle;
  onSelectTier?: (tier: PricingTier, vehicleId: string) => void;
}

const TIERS: { id: PricingTier; label: string; badge?: string; desc: string }[] = [
  { id: "hourly_6", label: "6 Hours", desc: "Short errand / dinner drive" },
  { id: "hourly_12", label: "12 Hours", desc: "Day trip across Navi Mumbai" },
  { id: "daily", label: "24 Hours (Daily)", badge: "Most Popular", desc: "Standard full day freedom" },
  { id: "weekly", label: "7-Day Pass", badge: "15% OFF", desc: "Weekly self-drive rental" },
  { id: "biweekly", label: "15-Day Pass", badge: "22% OFF", desc: "Mid-term extended rental" },
  { id: "monthly", label: "30-Day Sub", badge: "30% OFF", desc: "Subscription-style monthly car" },
];

export default function PricingCalculator({ vehicles = [], defaultVehicle }: PricingCalculatorProps) {
  const fallbackVehicle: Vehicle = {
    id: "demo-creta",
    name: "Hyundai Creta SX (O)",
    type: "SUV",
    fuel_type: "Petrol",
    image_urls: [
      "https://images.unsplash.com/photo-1758411898312-8592bb81e30d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwzfHxwcmVtaXVtJTIwd2hpdGUlMjBzdXYlMjBjYXJ8ZW58MHx8fHwxNzc2NzY1MTM5fDA&ixlib=rb-4.1.0&q=85",
    ],
    price_per_24hrs: 2800,
    deposit_amount: 5000,
    overtime_rate_per_hour: 200,
    is_available: true,
    seats: 5,
    transmission: "Automatic",
  };

  const activeVehicles = vehicles.length > 0 ? vehicles : [defaultVehicle || fallbackVehicle];
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    defaultVehicle?.id || activeVehicles[0]?.id || fallbackVehicle.id
  );
  const [selectedTier, setSelectedTier] = useState<PricingTier>("daily");
  const [doorstepDelivery, setDoorstepDelivery] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);

  const currentVehicle =
    activeVehicles.find((v) => v.id === selectedVehicleId) || activeVehicles[0] || fallbackVehicle;

  const breakdown = computePricing(currentVehicle, selectedTier, doorstepDelivery, isBusiness);

  return (
    <div className="w-full rounded-3xl bg-gradient-to-b from-[#0A192F] via-[#0d1e38] to-[#0A192F] border border-[#D4AF37]/30 p-6 sm:p-8 lg:p-10 shadow-2xl text-slate-100">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <Badge
            variant="outline"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2"
          >
            <Sparkles className="w-3.5 h-3.5" /> Transparent Flexible Pricing
          </Badge>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Hourly, Daily or Monthly Subscriptions
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Switch effortlessly between instant city getaways and long-term business passes with zero hidden surcharges.
          </p>
        </div>

        {/* Vehicle Selector Dropdown */}
        {activeVehicles.length > 1 && (
          <div className="w-full md:w-64">
            <label className="text-xs uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">
              Select Fleet Model
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-white font-medium focus:border-[#D4AF37] focus:outline-none transition-colors"
            >
              {activeVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.type})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tier Switcher Pills */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {TIERS.map((t) => {
          const isSelected = selectedTier === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTier(t.id)}
              className={`relative flex flex-col items-center text-center p-3 rounded-2xl border transition-all ${
                isSelected
                  ? "bg-[#D4AF37] text-[#0A192F] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20 scale-[1.02]"
                  : "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60"
              }`}
            >
              {t.badge && (
                <Badge
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${
                    isSelected ? "bg-[#0A192F] text-[#D4AF37]" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {t.badge}
                </Badge>
              )}
              <span className={`text-xs font-bold ${isSelected ? "text-[#0A192F]" : "text-white"}`}>{t.label}</span>
              <span className={`text-[10px] mt-0.5 ${isSelected ? "text-slate-900/80 font-medium" : "text-slate-400"}`}>
                {t.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Options: Doorstep Delivery & SME Business Mode with shadcn Switch */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Doorstep Delivery Toggle */}
        <div
          onClick={() => setDoorstepDelivery(!doorstepDelivery)}
          className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/70 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-[#D4AF37]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Doorstep Delivery & Drop</p>
              <p className="text-xs text-slate-400">Delivered right to your doorstep (+₹499)</p>
            </div>
          </div>
          <Switch
            checked={doorstepDelivery}
            onCheckedChange={(checked) => setDoorstepDelivery(Boolean(checked))}
          />
        </div>

        {/* Business Fleet GST Toggle */}
        <div
          onClick={() => setIsBusiness(!isBusiness)}
          className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/70 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Business Fleet / GST Account</p>
              <p className="text-xs text-slate-400">Itemized 18% GST with full ITC credit</p>
            </div>
          </div>
          <Switch
            checked={isBusiness}
            onCheckedChange={(checked) => setIsBusiness(Boolean(checked))}
          />
        </div>
      </div>

      {/* Pricing Breakdown Sheet */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 rounded-2xl bg-slate-950/70 border border-slate-800">
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-900">
            <span className="text-slate-400">Vehicle Base Rate ({breakdown.durationLabel})</span>
            <span className="font-semibold text-white">{formatINR(breakdown.baseRent)}</span>
          </div>

          {breakdown.discountAmount > 0 && (
            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-900 text-emerald-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Check className="w-3.5 h-3.5" /> {breakdown.tierLabel} Discount ({breakdown.discountPercent}%)
              </span>
              <span className="font-bold font-mono">-{formatINR(breakdown.discountAmount)}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-900">
            <span className="text-slate-400">Effective Rental Amount</span>
            <span className="font-bold text-white">{formatINR(breakdown.finalRent)}</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-900">
            <span className="text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Refundable Security Deposit
            </span>
            <span className="font-semibold text-emerald-300">{formatINR(breakdown.deposit)}</span>
          </div>

          {breakdown.doorstepFee > 0 && (
            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-900">
              <span className="text-slate-400">Doorstep Sanitized Handover & Collection</span>
              <span className="font-semibold text-white">{formatINR(breakdown.doorstepFee)}</span>
            </div>
          )}

          {breakdown.gstAmount > 0 && (
            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-900 text-amber-300">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Corporate GST (18% ITC applicable)
              </span>
              <span className="font-semibold">{formatINR(breakdown.gstAmount)}</span>
            </div>
          )}

          <div className="text-[11px] text-slate-400 pt-1">
            Overtime buffer rate: <span className="text-[#D4AF37] font-semibold">{formatINR(breakdown.overtimeRate)}/hr</span>. Zero surge, transparent policy.
          </div>
        </div>

        {/* Total & Action Column */}
        <div className="lg:col-span-5 flex flex-col justify-center items-center lg:items-end border-t lg:border-t-0 lg:border-l border-slate-800 pt-6 lg:pt-0 lg:pl-6 text-center lg:text-right">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Total Estimated Amount</span>
          <div className="font-heading text-4xl font-extrabold text-white mt-1 text-[#D4AF37]">
            {formatINR(breakdown.totalPayable)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Includes {formatINR(breakdown.deposit)} refundable deposit returned within 4 hours.
          </p>

          <div className="mt-5 w-full flex flex-col gap-2">
            <Link
              href={`/book?vehicle=${currentVehicle.id}&tier=${selectedTier}${doorstepDelivery ? "&doorstep=1" : ""}${isBusiness ? "&business=1" : ""}`}
              className="w-full"
            >
              <Button className="w-full h-12 bg-gradient-to-r from-[#D4AF37] to-amber-400 text-[#0A192F] font-bold text-sm uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 rounded-xl">
                Reserve This Plan <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>

            <span className="text-[10px] text-slate-500 text-center">
              Instant Confirmation · 20% Token or Pay at Site Available
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
