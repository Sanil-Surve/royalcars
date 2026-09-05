"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { api } from "@/src/lib/api";
import { Vehicle, Location } from "@/src/types";
import { formatINR } from "@/src/lib/utils";
import {
  Users,
  Gauge,
  Fuel,
  ShieldCheck,
  Search,
  Filter,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  ChevronRight,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

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

export default function VehiclesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-[#060E1A]">
          <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading fleet catalog...</p>
        </div>
      }
    >
      <VehiclesContent />
    </React.Suspense>
  );
}

function VehiclesContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [vehicles, setVehicles] = useState<Vehicle[]>(DEMO_VEHICLES);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [category, setCategory] = useState<string>(initialType);
  const [transmission, setTransmission] = useState<string>("All");
  const [fuelType, setFuelType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [availableOnly, setAvailableOnly] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      api.get<Vehicle[]>("/vehicles?available_only=false").catch(() => ({ data: DEMO_VEHICLES })),
      api.get<Location[]>("/locations").catch(() => ({ data: [] })),
    ]).then(([vehRes, locRes]) => {
      if (vehRes.data && vehRes.data.length > 0) {
        setVehicles(vehRes.data);
      }
      if (locRes.data && locRes.data.length > 0) {
        setLocations(locRes.data);
      }
      setLoading(false);
    });
  }, []);

  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        if (availableOnly && !v.is_available) return false;
        if (category !== "All" && v.type?.toLowerCase() !== category.toLowerCase()) return false;
        if (transmission !== "All" && v.transmission?.toLowerCase() !== transmission.toLowerCase()) return false;
        if (fuelType !== "All" && v.fuel_type?.toLowerCase() !== fuelType.toLowerCase()) return false;
        if (v.price_per_24hrs > maxPrice) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = v.name?.toLowerCase().includes(q);
          const matchType = v.type?.toLowerCase().includes(q);
          const matchDesc = v.description?.toLowerCase().includes(q);
          if (!matchName && !matchType && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.price_per_24hrs - b.price_per_24hrs;
        if (sortBy === "price_desc") return b.price_per_24hrs - a.price_per_24hrs;
        return 0;
      });
  }, [vehicles, availableOnly, category, transmission, fuelType, maxPrice, searchQuery, sortBy]);

  return (
    <div className="w-full min-h-screen bg-[#060E1A] py-10 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="pb-8 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Navi Mumbai Fleet Catalog
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
            Available Self-Drive Vehicles
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Choose from fully insured, GPS-equipped cars. Pick up at Kharghar Little World Mall or Orion Mall Panvel,
            or opt for sanitized doorstep delivery.
          </p>
        </div>

        {/* Search & Sort Controls Bar */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0A192F] border border-slate-800">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
            <Input
              type="text"
              placeholder="Search by car name or model (e.g. Creta, Innova)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-10 pr-4 rounded-xl bg-slate-900 border-slate-700 text-xs text-white placeholder:text-slate-500 focus-visible:border-[#D4AF37]"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs text-slate-400">
              Showing <span className="font-bold text-white">{filteredVehicles.length}</span> cars
            </span>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-[#D4AF37]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-xs text-white font-medium focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid: Sidebar Filters + Vehicle Cards */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="p-6 rounded-2xl bg-[#0A192F] border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-heading text-sm font-bold text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#D4AF37]" /> Filter Fleet
                </span>
                <button
                  onClick={() => {
                    setCategory("All");
                    setTransmission("All");
                    setFuelType("All");
                    setMaxPrice(5000);
                    setSearchQuery("");
                  }}
                  className="text-[11px] text-[#D4AF37] hover:underline"
                >
                  Reset All
                </button>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Vehicle Type</label>
                <div className="space-y-1">
                  {["All", "SUV", "Sedan", "Hatchback", "MPV"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        category === c
                          ? "bg-[#D4AF37] text-[#0A192F] font-bold"
                          : "text-slate-300 hover:bg-slate-800/80"
                      }`}
                    >
                      <span>{c}</span>
                      {category === c && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transmission Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Transmission</label>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  {["All", "Manual", "Automatic"].map((tr) => (
                    <button
                      key={tr}
                      onClick={() => setTransmission(tr)}
                      className={`py-1.5 rounded-lg font-medium text-[11px] transition-colors ${
                        transmission === tr ? "bg-[#D4AF37] text-[#0A192F] font-bold" : "text-slate-400"
                      }`}
                    >
                      {tr === "Automatic" ? "Auto" : tr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fuel Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Fuel Type</label>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  {["All", "Petrol", "Diesel"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFuelType(f)}
                      className={`py-1.5 rounded-lg font-medium text-[11px] transition-colors ${
                        fuelType === f ? "bg-[#D4AF37] text-[#0A192F] font-bold" : "text-slate-400"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-400">Max Daily Rate</span>
                  <span className="font-bold text-[#D4AF37]">{formatINR(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min={1200}
                  max={5000}
                  step={100}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
              </div>

              {/* Availability Toggle */}
              <div className="pt-2 border-t border-slate-800">
                <div
                  onClick={() => setAvailableOnly(!availableOnly)}
                  className="flex items-center justify-between cursor-pointer text-xs select-none"
                >
                  <span className="text-slate-300">Show Available Only</span>
                  <Switch
                    checked={availableOnly}
                    onCheckedChange={(checked) => setAvailableOnly(Boolean(checked))}
                  />
                </div>
              </div>
            </div>

            {/* Quick Trust Highlight */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Royal Cars Assurance
              </div>
              <p className="text-[11px] leading-relaxed">
                All rentals include 100% refundable security deposit, 24/7 roadside assistance, and zero surge pricing.
              </p>
            </div>
          </aside>

          {/* Vehicle List Grid */}
          <div className="lg:col-span-9">
            {filteredVehicles.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#0A192F] border border-slate-800 space-y-4">
                <Info className="w-12 h-12 text-slate-500 mx-auto" />
                <h3 className="font-heading text-xl font-bold text-white">No Vehicles Match Your Filter</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting the transmission, category, or price slider to see more available cars.
                </p>
                <button
                  onClick={() => {
                    setCategory("All");
                    setTransmission("All");
                    setFuelType("All");
                    setMaxPrice(5000);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0A192F] font-bold text-xs uppercase tracking-wider"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <motion.div
                    key={vehicle.id}
                    whileHover={{ y: -5 }}
                    className="rounded-2xl bg-[#0A192F] border border-slate-800 hover:border-[#D4AF37]/50 shadow-xl overflow-hidden flex flex-col transition-all group"
                  >
                    {/* Vehicle Image */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={vehicle.image_urls?.[0] || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2"}
                        alt={vehicle.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant="outline" className="bg-[#0A192F]/80 backdrop-blur-md border-slate-700 text-[10px] font-bold text-[#D4AF37]">
                          {vehicle.type}
                        </Badge>
                      </div>

                      <div className="absolute top-3 right-3">
                        <Badge
                          variant={vehicle.is_available ? "secondary" : "outline"}
                          className={`text-[10px] font-bold backdrop-blur-md ${
                            vehicle.is_available
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {vehicle.is_available ? "Available" : "Reserved"}
                        </Badge>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-heading text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                          {vehicle.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {vehicle.description || "Premium self-drive vehicle with verified maintenance records."}
                        </p>

                        {/* Specs grid */}
                        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-300">
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-[#D4AF37]" /> {vehicle.seats} Seats
                          </div>
                          <div className="flex items-center gap-1">
                            <Gauge className="w-3.5 h-3.5 text-[#D4AF37]" /> {vehicle.transmission}
                          </div>
                          <div className="flex items-center gap-1">
                            <Fuel className="w-3.5 h-3.5 text-[#D4AF37]" /> {vehicle.fuel_type}
                          </div>
                        </div>
                      </div>

                      {/* Pricing & CTA Action */}
                      <div className="mt-5 pt-4 border-t border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-heading text-xl font-extrabold text-[#D4AF37]">
                              {formatINR(vehicle.price_per_24hrs)}
                              <span className="text-[10px] text-slate-400 font-sans font-normal"> / 24h</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Deposit: {formatINR(vehicle.deposit_amount)}
                            </div>
                          </div>
                          <div className="text-right text-[10px] text-slate-400">
                            Overtime: <span className="text-white font-semibold">{formatINR(vehicle.overtime_rate_per_hour)}/hr</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Link href={`/vehicles/${vehicle.id}`} className="w-full">
                            <Button variant="outline" size="sm" className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border-slate-700">
                              Details
                            </Button>
                          </Link>
                          <Link href={`/book?vehicle=${vehicle.id}`} className="w-full">
                            <Button size="sm" className="w-full h-10 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0A192F] font-bold text-xs uppercase tracking-wider shadow">
                              Book Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
