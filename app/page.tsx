"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Clock,
  UserCheck,
  Truck,
  Calendar,
  CalendarCheck,
  MapPin,
  Search,
  ChevronDown,
  ChevronUp,
  Fuel,
  Users,
  Settings,
  CheckCircle2,
  ArrowRight,
  Star,
  Sparkles,
} from "lucide-react";
import { api } from "@/src/lib/api";
import { Location, Vehicle } from "@/src/types";
import { formatINR } from "@/src/lib/utils";

const POPULAR_VEHICLES: Vehicle[] = [
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

const FAQS = [
  {
    q: "Why choose Royal Cars in Kharghar & Panvel?",
    a: "Royal Cars gives you complete flexibility, privacy, and convenience to travel on your own schedule. You enjoy comfortable rides for weekend getaways, airport drops, or family trips.",
  },
  {
    q: "What types of cars are available in Kharghar & Panvel?",
    a: "We offer hatchbacks, sedans, compact SUVs, full-size 7-seater MPVs, and rugged 4x4s (including Toyota Rumion, Thar Roxx, Tata Punch, Kia Carens, and Hyundai i20) to match any travel requirement.",
  },
  {
    q: "How can I rent a car in Kharghar or Panvel online?",
    a: "Select your rental duration, choose pickup & return times, choose either hub pickup (Little World Mall Kharghar or Orion Mall Panvel) or doorstep delivery, and confirm your booking instantly online.",
  },
  {
    q: "Is Royal Cars an affordable car rental in Kharghar & Panvel?",
    a: "Yes! We provide all-inclusive transparent pricing with zero hidden surcharges, minimal refundable deposits, and tiered discounts on 24+ hour, weekly, and monthly reservations.",
  },
  {
    q: "Are the vehicles regularly maintained and sanitized?",
    a: "Yes. Every car undergoes a 30-point mechanical inspection, complete cabin sanitization, and tire check before each handover to ensure flawless road safety.",
  },
  {
    q: "Can I book a rental car for multiple days?",
    a: "Absolutely. We offer short-term (24 hours) as well as multi-week and monthly extended rental passes with significant cost savings.",
  },
  {
    q: "What documents are required for car rentals?",
    a: "You need a valid original Indian Driving Licence (held for at least 1 year) and government-issued photo identification (Aadhaar Card or Passport) for quick digital KYC verification.",
  },
  {
    q: "Are your cars suitable for family trips to Pune or Lonavala?",
    a: "Yes! Our fleet features spacious 7-seater MPVs like the Toyota Rumion and Kia Carens with large boot space and comfortable captain seats, perfect for Western Ghats getaways.",
  },
  {
    q: "Why choose Royal Cars for travel around Kharghar & Panvel?",
    a: "With direct highway connections via Sion-Panvel Expressway, Mumbai-Pune Expressway, and Atal Setu (MTHL), Royal Cars offers the ideal balance of speed, comfort, and affordable pricing.",
  },
  {
    q: "How do I choose the right rental vehicle?",
    a: "Consider the number of passengers, luggage needs, destination terrain, and budget. For city commuting, compact hatchbacks or SUVs are best; for group holidays, choose our 7-seater MPVs.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>(POPULAR_VEHICLES);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [seoExpanded, setSeoExpanded] = useState<boolean>(false);

  // Search Widget State
  const [rentalPeriod, setRentalPeriod] = useState<string>("24hrs");
  const [pickupLoc, setPickupLoc] = useState<string>("loc-kharghar");
  const [pickupDate, setPickupDate] = useState<string>(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  });
  const [dropoffDate, setDropoffDate] = useState<string>(() => {
    const today = new Date();
    today.setDate(today.getDate() + 2);
    return today.toISOString().split("T")[0];
  });
  const [pickupTime, setPickupTime] = useState<string>("10:00");
  const [dropoffTime, setDropoffTime] = useState<string>("10:00");

  useEffect(() => {
    // Backend location sync
    api
      .get<Location[]>("/locations")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setLocations(res.data);
          setPickupLoc(res.data[0].id);
        }
      })
      .catch(() => {
        setLocations([
          { id: "loc-kharghar", name: "Kharghar - Little World Mall (Sector 2)", address: "Navi Mumbai", is_active: true },
          { id: "loc-panvel", name: "Panvel - Orion Mall (Station Road)", address: "Navi Mumbai", is_active: true },
          { id: "loc-doorstep", name: "Doorstep Delivery (Kharghar & Panvel)", address: "Navi Mumbai", is_active: true },
        ]);
      });

    // Backend vehicle sync
    api
      .get<Vehicle[]>("/vehicles")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setVehicles(res.data);
        }
      })
      .catch(() => {
        setVehicles(POPULAR_VEHICLES);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (pickupLoc) params.set("pickup", pickupLoc);
    if (pickupDate) params.set("pickupDate", pickupDate);
    if (dropoffDate) params.set("dropoffDate", dropoffDate);
    if (pickupTime) params.set("pickupTime", pickupTime);
    if (dropoffTime) params.set("dropoffTime", dropoffTime);
    if (rentalPeriod) params.set("period", rentalPeriod);
    router.push(`/vehicles?${params.toString()}`);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* 1. HERO SECTION (Royal Blue Gradient Banner with Ghost Watermark) */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex flex-col justify-center pt-16 pb-16 overflow-hidden transition-all">
        {/* Dynamic Vibrant Gradient */}
        <div
          className="absolute inset-0 transition-colors duration-1000"
          style={{ background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #1E40AF 100%)" }}
        />

        {/* Huge Ghost Watermark Typography */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
          <h2 className="text-[16vw] font-black uppercase tracking-tighter text-white/10">
            ROYAL CARS
          </h2>
        </div>

        {/* Ambient Glowing Orbs */}
        <div className="absolute top-12 left-8 w-72 h-72 rounded-full bg-white/15 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-12 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl animate-pulse" />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 z-10">
          {/* Top Hero Headline & Tagline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8">
            <div className="lg:col-span-7 flex flex-col items-start gap-4">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-white/90 bg-white/15 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full shadow-xs">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                Car rentals in Kharghar & Panvel
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                Simple. Reliable.<br />
                Your ride awaits.
              </h1>

              <p className="text-sm sm:text-base max-w-lg text-white/85 leading-relaxed">
                Royal Cars connects you with verified, sanitized rental cars across Kharghar and Panvel. Fast, easy, and always dependable.
              </p>
            </div>

            {/* 3 Value Proposition Badges */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xl border border-white/20 dark:border-slate-800">
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <Link href="/vehicles" className="group flex flex-col items-start">
                  <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="mt-2.5 text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white leading-snug">
                    24+ hr rentals
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    Extended bookings
                  </span>
                </Link>

                <Link href="/vehicles" className="group flex flex-col items-start border-x border-slate-100 dark:border-slate-800 px-2 sm:px-3">
                  <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <span className="mt-2.5 text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white leading-snug">
                    Driver with car
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    Chauffeur on request
                  </span>
                </Link>

                <Link href="/vehicles" className="group flex flex-col items-start">
                  <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="mt-2.5 text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white leading-snug">
                    Doorstep delivery
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    We come to you
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* 2. 5-COLUMN SEGMENTED BOOKING SEARCH WIDGET */}
          <div id="booking-search" className="w-full rounded-2xl shadow-2xl overflow-hidden transition-all">
            <form onSubmit={handleSearch} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-1 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 md:grid-cols-5">
                {/* 1. Rental Period */}
                <div className="p-4 flex flex-col justify-center hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Rental Period
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    <select
                      value={rentalPeriod}
                      onChange={(e) => setRentalPeriod(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                      <option value="24hrs" className="bg-white dark:bg-slate-900">24+ Hours (Standard)</option>
                      <option value="weekend" className="bg-white dark:bg-slate-900">Weekend Getaway (48h)</option>
                      <option value="weekly" className="bg-white dark:bg-slate-900">Weekly Pass (7 Days)</option>
                      <option value="monthly" className="bg-white dark:bg-slate-900">Monthly Subscription</option>
                    </select>
                  </div>
                </div>

                {/* 2. Pickup Date & Time */}
                <div className="p-4 flex flex-col justify-center hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Pickup Date & Time
                  </label>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none cursor-pointer"
                    />
                    <select
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white outline-none cursor-pointer shrink-0"
                    >
                      {Array.from({ length: 18 }).map((_, i) => {
                        const h = 6 + i;
                        const str = `${h < 10 ? "0" + h : h}:00`;
                        return <option key={str} value={str} className="bg-white dark:bg-slate-900">{str}</option>;
                      })}
                    </select>
                  </div>
                </div>

                {/* 3. Return Date & Time */}
                <div className="p-4 flex flex-col justify-center hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Return Date & Time
                  </label>
                  <div className="flex items-center gap-1.5">
                    <CalendarCheck className="w-4 h-4 text-primary shrink-0" />
                    <input
                      type="date"
                      value={dropoffDate}
                      onChange={(e) => setDropoffDate(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none cursor-pointer"
                    />
                    <select
                      value={dropoffTime}
                      onChange={(e) => setDropoffTime(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white outline-none cursor-pointer shrink-0"
                    >
                      {Array.from({ length: 18 }).map((_, i) => {
                        const h = 6 + i;
                        const str = `${h < 10 ? "0" + h : h}:00`;
                        return <option key={str} value={str} className="bg-white dark:bg-slate-900">{str}</option>;
                      })}
                    </select>
                  </div>
                </div>

                {/* 4. Location Hub */}
                <div className="p-4 flex flex-col justify-center hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Pickup Location
                  </label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <select
                      value={pickupLoc}
                      onChange={(e) => setPickupLoc(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none cursor-pointer truncate"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id} className="bg-white dark:bg-slate-900">
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 5. Search Cars CTA */}
                <div className="p-3 flex items-center justify-center">
                  <button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-primary/25 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Cars</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 3. SEO & EDITORIAL STORY SECTION */}
      <section className="py-16 md:py-20 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <header>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Car Rental in Kharghar & Panvel
            </h2>
            <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
              Affordable and reliable cars for every journey across Kharghar & Panvel.
            </p>
          </header>

          <div className="relative mt-6">
            <div
              className={`space-y-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 transition-all ${!seoExpanded ? "max-h-48 overflow-hidden" : ""
                }`}
            >
              <p>
                Looking for a reliable car rental service in Kharghar & Panvel? Royal Cars offers a wide range of impeccably maintained vehicles designed to make your travel experience comfortable, convenient, and affordable. Whether you need a vehicle for daily commuting, a family outing, or a weekend getaway to Lonavala, Mahabaleshwar, or Goa, our rental cars provide the flexibility and freedom to travel at your own rhythm.
              </p>
              <p>
                Our fleet includes hatchbacks, sedans, SUVs, and spacious 7-seater MPVs to match any travel requirement and budget. As a premier provider of car rental in Kharghar and Panvel, we prioritize vehicle safety, complete cleanliness, transparent pricing, and 100% customer satisfaction. Every vehicle undergoes rigorous 30-point inspections before each booking.
              </p>
              <p>
                Choosing to rent a car with Royal Cars means zero surge fees, well-maintained cars, and total privacy for you and your loved ones. Whether you require a car for 24 hours, a weekend, or a monthly extended duration, we deliver doorstep service across Kharghar and Panvel.
              </p>
            </div>

            {!seoExpanded && (
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white dark:from-slate-950 to-transparent pointer-events-none" />
            )}
          </div>

          <button
            type="button"
            onClick={() => setSeoExpanded(!seoExpanded)}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-4 cursor-pointer"
          >
            {seoExpanded ? "View less" : "View more"}
            {seoExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className="mt-8">
            <Link
              href="/vehicles"
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-primary hover:bg-blue-600 text-white text-sm font-semibold transition-colors shadow-sm shadow-primary/20"
            >
              Browse our fleet
            </Link>
          </div>
        </div>
      </section>

      {/* 4. POPULAR CARS SHOWCASE (Modern Card Style) */}
      <section id="popular-cars" className="py-16 md:py-20 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Popular cars
              </h2>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                The vehicles our customers book most often across Navi Mumbai.
              </p>
            </div>
            <Link
              href="/vehicles"
              className="text-sm font-semibold text-primary hover:underline underline-offset-4 shrink-0 inline-flex items-center gap-1"
            >
              View all cars <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.slice(0, 6).map((car) => {
              const imageSrc =
                car.image_urls && car.image_urls.length > 0
                  ? car.image_urls[0]
                  : "https://pub-6e164401844e42a18bdff5533ec36d1f.r2.dev/vehicles/5f85e3cc-d253-4000-962c-b7f65fd6f6a9.jpg";

              return (
                <div
                  key={car.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Aspect Ratio Studio Cutout Image */}
                  <div className="relative aspect-[16/10] bg-slate-50 dark:bg-slate-950/40 flex items-center justify-center p-4 border-b border-slate-100 dark:border-slate-800">
                    <Image
                      src={imageSrc}
                      alt={car.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-lg text-white text-[10px] font-bold uppercase tracking-wider bg-primary shadow-xs z-10">
                      Best Value
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                        {car.type || "Rental Car"}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                        {car.name}
                      </h3>

                      {/* Specs Row */}
                      <div className="grid grid-cols-3 gap-1 py-3 my-3 border-y border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Fuel className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{car.fuel_type}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 border-x border-slate-100 dark:border-slate-800">
                          <Settings className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{car.transmission}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{car.seats} Seats</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-3">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Home delivery & center pick-up available</span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                              {formatINR(car.price_per_24hrs)}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">/day</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {formatINR(car.overtime_rate_per_hour)}/hr base rate
                          </p>
                        </div>

                        <Link
                          href={`/book?vehicle=${car.id}`}
                          className="bg-primary hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-xs shadow-primary/20"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* 6. SOCIAL PROOF & CUSTOMER TESTIMONIALS */}
      <section className="py-16 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1 text-amber-500 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
              <span className="text-xs font-extrabold text-slate-900 dark:text-white ml-1.5">
                4.8 / 5.0 (500+ Reviews)
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Loved by renters across Navi Mumbai
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-1 text-amber-500 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                &ldquo;Rented the Toyota Rumion for our family trip to Alibaug. Car was spotless, handed over right at Little World Mall Kharghar in under 5 minutes. Outstanding service!&rdquo;
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Amit Deshmukh</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Verified Renter</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-1 text-amber-500 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                &ldquo;Thar Roxx was in showroom condition. Prompt doorstep delivery to Sector 20 Kharghar made everything frictionless. Highly recommended!&rdquo;
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Pooja Sharma</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Verified Renter</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-1 text-amber-500 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                &ldquo;Rented the Thar Roxx for a weekend trip to Lonavala with friends. Car condition was spotless, pickup at Little World Mall was instant, and deposit was refunded within hours.&rdquo;
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Rahul Patil</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Verified Renter</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE STICKY 2-COLUMN FAQ ACCORDION */}
      <section id="faq" className="py-16 md:py-24 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
            {/* Sticky Left Title */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Frequently asked questions
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Everything you need to know about car rentals in Kharghar & Panvel.
              </p>
              <Link
                href="/#location"
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline underline-offset-4"
              >
                Still have a question? Contact us <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Right Accordion List */}
            <div className="lg:col-span-2 divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800">
              {FAQS.map((item, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div key={idx} className="py-4">
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full flex items-start justify-between gap-4 text-left group focus:outline-none cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className={`text-sm sm:text-base font-semibold transition-colors ${isOpen ? "text-primary font-bold" : "text-slate-900 dark:text-white group-hover:text-primary"
                        }`}>
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 shrink-0 text-slate-400 transition-transform duration-300 mt-0.5 ${isOpen ? "rotate-180 text-primary" : ""
                          }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="pt-3 pr-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400 animate-in fade-in-50 duration-200">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 8. VISIT OUR LOCATION HUB & MAP EMBED */}
      <section id="location" className="py-16 md:py-24 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Visit our location
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Pick up your vehicle or talk to our fleet team in person, seven days a week.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Info Column */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <dl className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="pb-4">
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Primary Pickup Address
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    Little World Mall, Sector 2, Kharghar, Navi Mumbai, Maharashtra 410210
                  </dd>
                </div>

                <div className="py-4">
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    24/7 Helplines
                  </dt>
                  <dd className="mt-1 text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <a href="tel:+918369434018" className="block hover:text-primary transition-colors font-bold">
                      +91 9892805777
                    </a>
                  </dd>
                </div>

                <div className="pt-4">
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Opening Hours
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Monday to Sunday, 08:00 AM – 10:00 PM
                  </dd>
                </div>
              </dl>

              <a
                href="https://maps.app.goo.gl/Sxke6PctHtZ1dinS8"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center w-full h-11 px-5 rounded-xl bg-primary hover:bg-blue-600 text-white text-sm font-semibold transition-colors shadow-sm shadow-primary/20"
              >
                Get Directions
              </a>
            </div>

            {/* Embedded Google Map Iframe */}
            <div className="lg:col-span-7 h-[360px] lg:h-[420px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative">
              <iframe
                title="Royal Cars Pickup Location Map"
                src="https://www.google.com/maps?q=Little+World+Mall+Kharghar+Navi+Mumbai&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
