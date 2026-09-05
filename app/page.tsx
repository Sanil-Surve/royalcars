"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  Car,
  Key,
  Truck,
  Building2,
  CheckCircle2,
  Users,
  Gauge,
  Fuel,
  ChevronRight,
  Star,
} from "lucide-react";
import { api } from "@/src/lib/api";
import { Location, Vehicle } from "@/src/types";
import { formatINR } from "@/src/lib/utils";
import PricingCalculator from "@/src/components/PricingCalculator";

const DEMO_VEHICLES: Vehicle[] = [
  {
    id: "v1",
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
    description: "Panoramic sunroof, ventilated leather seats, and automatic cruise control.",
    seats: 5,
    transmission: "Automatic",
  },
  {
    id: "v2",
    name: "Toyota Innova Crysta",
    type: "MPV",
    fuel_type: "Diesel",
    image_urls: [
      "https://images.pexels.com/photos/19410427/pexels-photo-19410427.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    ],
    price_per_24hrs: 3800,
    deposit_amount: 7000,
    overtime_rate_per_hour: 300,
    is_available: true,
    description: "Spacious 7-seater captain seats, twin AC, ideal for Lonavala & Pune trips.",
    seats: 7,
    transmission: "Manual",
  },
  {
    id: "v3",
    name: "Honda City ZX",
    type: "Sedan",
    fuel_type: "Petrol",
    image_urls: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=940&q=80",
    ],
    price_per_24hrs: 2200,
    deposit_amount: 4000,
    overtime_rate_per_hour: 180,
    is_available: true,
    description: "Executive luxury sedan with paddle shifters and premium sound system.",
    seats: 5,
    transmission: "Automatic",
  },
  {
    id: "v4",
    name: "Maruti Swift ZXi+",
    type: "Hatchback",
    fuel_type: "Petrol",
    image_urls: [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=940&q=80",
    ],
    price_per_24hrs: 1500,
    deposit_amount: 3000,
    overtime_rate_per_hour: 150,
    is_available: true,
    description: "Nimble city commuter with 22 km/l efficiency and Apple CarPlay.",
    seats: 5,
    transmission: "Manual",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>(DEMO_VEHICLES);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Search Widget State
  const [pickupLoc, setPickupLoc] = useState<string>("");
  const [dropoffLoc, setDropoffLoc] = useState<string>("");
  const [pickupDate, setPickupDate] = useState<string>("");
  const [dropoffDate, setDropoffDate] = useState<string>("");
  const [pickupTime, setPickupTime] = useState<string>("09:00");
  const [dropoffTime, setDropoffTime] = useState<string>("21:00");
  const [doorstep, setDoorstep] = useState<boolean>(false);

  useEffect(() => {
    // Set default dates (tomorrow and day after)
    const today = new Date();
    const tTomorrow = new Date(today);
    tTomorrow.setDate(today.getDate() + 1);
    const tDayAfter = new Date(today);
    tDayAfter.setDate(today.getDate() + 2);

    setPickupDate(tTomorrow.toISOString().split("T")[0]);
    setDropoffDate(tDayAfter.toISOString().split("T")[0]);

    // Fetch locations from backend
    api
      .get<Location[]>("/locations")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setLocations(res.data);
          setPickupLoc(res.data[0].id);
          setDropoffLoc(res.data[0].id);
        }
      })
      .catch(() => {
        // Fallback demo locations
        const fallback = [
          { id: "loc-kharghar", name: "Kharghar - Little World Mall (Sector 2)", address: "Navi Mumbai", is_active: true },
          { id: "loc-panvel", name: "Panvel - Orion Mall (Station Road)", address: "Navi Mumbai", is_active: true },
        ];
        setLocations(fallback);
        setPickupLoc(fallback[0].id);
        setDropoffLoc(fallback[0].id);
      });

    // Fetch vehicles from backend
    api
      .get<Vehicle[]>("/vehicles")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setVehicles(res.data);
        }
      })
      .catch(() => {
        setVehicles(DEMO_VEHICLES);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (pickupLoc) params.set("pickup", pickupLoc);
    if (dropoffLoc) params.set("dropoff", dropoffLoc);
    if (pickupDate) params.set("pickupDate", pickupDate);
    if (dropoffDate) params.set("dropoffDate", dropoffDate);
    if (pickupTime) params.set("pickupTime", pickupTime);
    if (dropoffTime) params.set("dropoffTime", dropoffTime);
    if (doorstep) params.set("doorstep", "1");
    router.push(`/vehicles?${params.toString()}`);
  };

  const filteredVehicles =
    selectedCategory === "All"
      ? vehicles
      : vehicles.filter((v) => v.type?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#060E1A] via-[#0A192F] to-[#060E1A] pt-12 pb-24 lg:pt-20 lg:pb-32">
        {/* Ambient Light Orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-6"
            >
              <Sparkles className="w-4 h-4" /> Navi Mumbai’s Premier Fleet
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]"
            >
              Drive Something <span className="italic text-[#D4AF37]">Royal</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal"
            >
              Experience the pinnacle of self-drive freedom. Hand-picked SUVs, sedans & MPVs with instant booking,
              keyless digital unlock, doorstep delivery, and transparent pricing.
            </motion.p>
          </div>

          {/* Instant Search Bar Card */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 max-w-5xl mx-auto rounded-3xl bg-[#0A192F]/95 border border-[#D4AF37]/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
          >
            <form onSubmit={handleSearch} className="space-y-6">
              {/* Pickup Mode Toggle (Mall Hub vs Doorstep) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <Key className="w-4 h-4 text-[#D4AF37]" /> Select Delivery Option
                </div>

                <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDoorstep(false)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      !doorstep
                        ? "bg-[#D4AF37] text-[#0A192F] shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Mall Hub Pickup (Free)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoorstep(true)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      doorstep
                        ? "bg-[#D4AF37] text-[#0A192F] shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" /> Doorstep Delivery (+₹499)
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pickup Hub */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Pickup Location
                  </label>
                  <div className="relative">
                    <select
                      value={pickupLoc}
                      onChange={(e) => setPickupLoc(e.target.value)}
                      className="w-full h-12 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-white font-medium focus:border-[#D4AF37] focus:outline-none"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Drop-off Hub */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Drop-off Location
                  </label>
                  <div className="relative">
                    <select
                      value={dropoffLoc}
                      onChange={(e) => setDropoffLoc(e.target.value)}
                      className="w-full h-12 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-white font-medium focus:border-[#D4AF37] focus:outline-none"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pickup Date & Time */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Pickup Date & Time
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="h-12 rounded-xl bg-slate-900 border border-slate-700 px-2 text-xs text-white font-medium focus:border-[#D4AF37] focus:outline-none"
                    />
                    <select
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="h-12 rounded-xl bg-slate-900 border border-slate-700 px-2 text-xs text-white font-medium focus:border-[#D4AF37] focus:outline-none"
                    >
                      {Array.from({ length: 19 }).map((_, i) => {
                        const h = 5 + i; // 05:00 to 23:00 business hours
                        const str = `${h < 10 ? "0" + h : h}:00`;
                        return (
                          <option key={str} value={str}>
                            {str}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Drop-off Date & Time */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Drop-off Date & Time
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={dropoffDate}
                      onChange={(e) => setDropoffDate(e.target.value)}
                      className="h-12 rounded-xl bg-slate-900 border border-slate-700 px-2 text-xs text-white font-medium focus:border-[#D4AF37] focus:outline-none"
                    />
                    <select
                      value={dropoffTime}
                      onChange={(e) => setDropoffTime(e.target.value)}
                      className="h-12 rounded-xl bg-slate-900 border border-slate-700 px-2 text-xs text-white font-medium focus:border-[#D4AF37] focus:outline-none"
                    >
                      {Array.from({ length: 19 }).map((_, i) => {
                        const h = 5 + i;
                        const str = `${h < 10 ? "0" + h : h}:00`;
                        return (
                          <option key={str} value={str}>
                            {str}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit CTA Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> 100% Sanitized Handover
                  </span>
                  <span>·</span>
                  <span>Zero Hidden Surcharges</span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-400 text-[#0A192F] font-bold text-sm uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 transition-all flex items-center justify-center gap-2"
                >
                  Search Available Fleet <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Theme 1 & 2 Value Props Bar */}
      <section className="py-16 bg-[#060E1A] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0A192F] to-[#0d203a] border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-4">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">Self-Drive Convenience</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Instant digital booking, doorstep car delivery, and Bluetooth-enabled keyless unlock on your phone.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0A192F] to-[#0d203a] border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">Local Trust & Safety</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Verified cars, transparent start & end odometer logs, and physical hubs at Little World Mall & Orion Mall.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0A192F] to-[#0d203a] border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">Flexible Pricing</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Choose between 6h/12h hourly getaways, 24h daily rates, or save up to 30% on subscription passes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0A192F] to-[#0d203a] border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">Business Fleet Mode</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Tailored for SMEs needing recurring bookings: GST tax invoicing, priority allocation, and corporate credit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Fleet Catalog Section */}
      <section className="py-20 bg-gradient-to-b from-[#060E1A] to-[#0A192F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-2">Our Premium Garage</div>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
                Hand-Picked Fleet for Every Occasion
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Every vehicle is thoroughly sanitized, serviced at authorized dealership workshops, and verified with GPS telematics.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
              {["All", "SUV", "Sedan", "Hatchback", "MPV"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? "bg-[#D4AF37] text-[#0A192F] shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredVehicles.map((vehicle) => (
              <motion.div
                key={vehicle.id}
                whileHover={{ y: -6 }}
                className="group rounded-2xl bg-gradient-to-b from-[#0A192F] to-[#071324] border border-slate-800 hover:border-[#D4AF37]/50 shadow-xl overflow-hidden flex flex-col transition-all"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={vehicle.image_urls?.[0] || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2"}
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#0A192F]/80 backdrop-blur-md border border-slate-700 text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                    {vehicle.type}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                    Instant Keyless
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                      {vehicle.name}
                    </h3>

                    {/* Specs Pills */}
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-300">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#D4AF37]" /> {vehicle.seats || 5} Seats
                      </div>
                      <div className="flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-[#D4AF37]" /> {vehicle.transmission || "Auto"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Fuel className="w-3.5 h-3.5 text-[#D4AF37]" /> {vehicle.fuel_type || "Petrol"}
                      </div>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-heading text-xl font-extrabold text-[#D4AF37]">
                        {formatINR(vehicle.price_per_24hrs)}
                        <span className="text-[10px] text-slate-400 font-sans font-normal"> / 24h</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Deposit: {formatINR(vehicle.deposit_amount)}
                      </div>
                    </div>

                    <Link
                      href={`/book?vehicle=${vehicle.id}`}
                      className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0A192F] font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-md"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-[#D4AF37] text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Explore Full 15+ Vehicle Fleet <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Theme 3: Flexible Pricing Calculator Section */}
      <section id="pricing" className="py-20 bg-[#060E1A] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PricingCalculator vehicles={vehicles} defaultVehicle={vehicles[0]} />
        </div>
      </section>

      {/* Theme 4: SME Business Fleet Mode Feature Banner */}
      <section className="py-20 bg-gradient-to-r from-[#0A192F] via-[#0D203A] to-[#0A192F] border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-400 uppercase tracking-widest">
                <Building2 className="w-4 h-4" /> SME Fleet Solutions
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Empower Your Business With On-Demand Recurring Fleet
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Whether you need corporate airport transfers, weekly client executive mobility, or monthly staff rentals across Navi Mumbai and Mumbai, Royal Cars Business Fleet offers full GST invoicing with 18% ITC input tax credit.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> Dedicated Fleet Account Manager
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> Itemized GST Invoicing & Receipts
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> Zero Security Deposit on PO Approvals
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> Priority Sanitized Doorstep Dispatch
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/business"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-400 text-[#0A192F] font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-lg"
                >
                  Explore SME Business Fleet &rarr;
                </Link>
                <Link
                  href="/vehicles?business=1"
                  className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors"
                >
                  Book with GST Number
                </Link>
              </div>
            </div>

            {/* Business Perk Card */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/90 border border-slate-700 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-xs uppercase font-bold text-slate-400">Sample GST Tax Invoice</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37]">
                  GSTIN: 27AABCR9821Q1Z4
                </span>
              </div>
              <div className="space-y-3 py-4 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Weekly Executive SUV (Innova Crysta)</span>
                  <span className="font-mono font-semibold text-white">₹22,610</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Doorstep Priority Delivery</span>
                  <span className="font-mono font-semibold text-emerald-400">FREE (Corporate)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>SGST (9%) + CGST (9%)</span>
                  <span className="font-mono font-semibold text-amber-300">₹4,070 (ITC Claimable)</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                  <span>Total Tax Deductible Expense</span>
                  <span className="text-[#D4AF37]">₹26,680</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 text-[11px] text-slate-400">
                💡 <span className="text-white font-medium">SME Tax Benefit:</span> Your company saves approximately ₹4,070 in GST input credit on every recurring booking.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hub Locations Section */}
      <section id="hubs" className="py-20 bg-[#060E1A] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-2">Navi Mumbai Hubs</div>
            <h2 className="font-heading text-3xl font-extrabold text-white">
              Centrally Located at Leading Malls
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Pick up directly outside the mall or choose doorstep delivery anywhere in Kharghar, Panvel, Vashi & Belapur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Kharghar Hub */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0A192F] to-[#0a1626] border border-slate-800 hover:border-[#D4AF37]/60 transition-colors shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-bold tracking-wider uppercase">
                  Hub 01 · Kharghar
                </span>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 8 Cars Available
                </span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-white">Little World Mall</h3>
              <p className="text-xs text-slate-400 mt-1">Sector 2, Kharghar, Navi Mumbai (Opposite Kharghar Railway Station)</p>

              <div className="mt-6 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#D4AF37]" /> Active Handover: 05:00 AM – 11:00 PM Daily
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Dedicated secure basement parking bay
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <a
                  href="https://maps.google.com/?q=Little+World+Mall+Kharghar"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
                >
                  View on Google Maps &rarr;
                </a>
                <Link
                  href="/vehicles?location=kharghar"
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white hover:bg-slate-800"
                >
                  View Hub Fleet
                </Link>
              </div>
            </div>

            {/* Panvel Hub */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0A192F] to-[#0a1626] border border-slate-800 hover:border-[#D4AF37]/60 transition-colors shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-bold tracking-wider uppercase">
                  Hub 02 · Panvel
                </span>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 6 Cars Available
                </span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-white">Orion Mall Panvel</h3>
              <p className="text-xs text-slate-400 mt-1">Station Road, Panvel, Navi Mumbai (Minutes from Mumbai-Pune Expressway)</p>

              <div className="mt-6 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#D4AF37]" /> Active Handover: 05:00 AM – 11:00 PM Daily
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Fast-tag enabled expressway express exit
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <a
                  href="https://maps.google.com/?q=Orion+Mall+Panvel"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
                >
                  View on Google Maps &rarr;
                </a>
                <Link
                  href="/vehicles?location=panvel"
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white hover:bg-slate-800"
                >
                  View Hub Fleet
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
