import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PricingTier, PricingBreakdown, Vehicle } from "@/src/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "0";
  return new Intl.NumberFormat("en-IN").format(n);
}

export function validateBusinessHours(timeStr: string): boolean {
  try {
    const [hh, mm] = timeStr.split(":").map(Number);
    const totalMinutes = hh * 60 + mm;
    return totalMinutes >= 5 * 60 && totalMinutes <= 23 * 60;
  } catch {
    return false;
  }
}

export function computePricing(
  vehicle: Vehicle,
  tier: PricingTier = "daily",
  doorstepDelivery = false,
  isBusiness = false
): PricingBreakdown {
  const dailyRate = vehicle.price_per_24hrs || 2500;
  const deposit = vehicle.deposit_amount || 5000;
  const overtimeRate = vehicle.overtime_rate_per_hour || 200;
  const doorstepFee = doorstepDelivery ? 499 : 0;

  let baseRent = dailyRate;
  let discountPercent = 0;
  let tierLabel = "Daily 24h";
  let durationLabel = "1 Day (24 Hours)";

  switch (tier) {
    case "hourly_6":
      tierLabel = "6 Hours Quick";
      durationLabel = "6 Hours";
      baseRent = Math.round(dailyRate * 0.45);
      discountPercent = 0;
      break;
    case "hourly_12":
      tierLabel = "12 Hours Day Pass";
      durationLabel = "12 Hours";
      baseRent = Math.round(dailyRate * 0.75);
      discountPercent = 0;
      break;
    case "daily":
      tierLabel = "Daily Standard";
      durationLabel = "1 Day (24 Hours)";
      baseRent = dailyRate;
      discountPercent = 0;
      break;
    case "weekly":
      tierLabel = "Weekly Pass (7 Days)";
      durationLabel = "7 Days";
      baseRent = dailyRate * 7;
      discountPercent = 15;
      break;
    case "biweekly":
      tierLabel = "15-Day Subscription";
      durationLabel = "15 Days";
      baseRent = dailyRate * 15;
      discountPercent = 22;
      break;
    case "monthly":
      tierLabel = "Monthly Fleet Pass (30 Days)";
      durationLabel = "30 Days";
      baseRent = dailyRate * 30;
      discountPercent = 30;
      break;
  }

  const discountAmount = Math.round((baseRent * discountPercent) / 100);
  const finalRent = baseRent - discountAmount;
  const taxableAmount = finalRent + doorstepFee;
  const gstAmount = isBusiness ? Math.round(taxableAmount * 0.18) : 0;
  const totalPayable = finalRent + deposit + doorstepFee + gstAmount;

  return {
    tier,
    tierLabel,
    durationLabel,
    baseRent,
    discountPercent,
    discountAmount,
    finalRent,
    deposit,
    doorstepFee,
    gstAmount,
    totalPayable,
    overtimeRate,
  };
}

export function formatApiError(error: any): string {
  if (!error) return "An unexpected error occurred.";
  const detail = error.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d) => (typeof d?.msg === "string" ? d.msg : JSON.stringify(d)))
      .filter(Boolean)
      .join(", ");
  }
  if (detail?.msg) return detail.msg;
  if (error.message) return error.message;
  return "An unexpected error occurred.";
}
