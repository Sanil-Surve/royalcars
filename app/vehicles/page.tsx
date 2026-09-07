"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { api } from "@/src/lib/api";
import { Vehicle } from "@/src/types";
import { formatINR } from "@/src/lib/utils";
import {
  Users,
  Fuel,
  Settings,
  Search,
  Filter,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  Info,
  MapPin,
  X,
  SlidersHorizontal,
  Car,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DEMO_VEHICLES: Vehicle[] = [
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

/* ───────────────── helpers ───────────────── */

const TYPE_ICONS: Record<string, string> = {
  SUV: "🏔️",
  Sedan: "🚗",
  Hatchback: "🏙️",
  MPV: "👨‍👩‍👧‍👦",
};

/* ───────────────── page wrapper ───────────────── */

export default function VehiclesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-950">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading fleet catalog...</p>
        </div>
      }
    >
      <VehiclesContent />
    </React.Suspense>
  );
}

/* ───────────────── main content ───────────────── */

function VehiclesContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [vehicles, setVehicles] = useState<Vehicle[]>(DEMO_VEHICLES);

  // Filters State
  const [category, setCategory] = useState<string>(initialType);
  const [transmission, setTransmission] = useState<string>("All");
  const [fuelType, setFuelType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [maxPrice, setMaxPrice] = useState<number>(8500);
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [availableOnly, setAvailableOnly] = useState<boolean>(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    api
      .get<Vehicle[]>("/vehicles?available_only=false")
      .then((vehRes) => {
        if (vehRes.data && vehRes.data.length > 0) {
          setVehicles(vehRes.data);
        }
      })
      .catch(() => {
        setVehicles(DEMO_VEHICLES);
      });
  }, []);

  const resetFilters = () => {
    setCategory("All");
    setTransmission("All");
    setFuelType("All");
    setMaxPrice(8500);
    setSearchQuery("");
  };

  const hasActiveFilters =
    category !== "All" || transmission !== "All" || fuelType !== "All" || maxPrice < 8500 || searchQuery.trim() !== "";

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

  /* ───────────── shared filter panel (sidebar + mobile drawer) ───────────── */
  const filterPanel = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" /> Filters
        </span>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Vehicle Type */}
      <div className="space-y-3">
        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Vehicle Type
        </label>
        <div className="flex flex-wrap gap-2">
          {["All", "SUV", "Sedan", "Hatchback", "MPV"].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                category === c
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {c !== "All" && <span className="mr-1">{TYPE_ICONS[c] || ""}</span>}
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div className="space-y-3">
        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Transmission
        </label>
        <div className="flex flex-wrap gap-2">
          {["All", "Manual", "Automatic"].map((tr) => (
            <button
              key={tr}
              onClick={() => setTransmission(tr)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                transmission === tr
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tr}
            </button>
          ))}
        </div>
      </div>

      {/* Fuel Type */}
      <div className="space-y-3">
        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Fuel Type
        </label>
        <div className="flex flex-wrap gap-2">
          {["All", "Petrol", "Diesel", "Petrol + CNG"].map((f) => (
            <button
              key={f}
              onClick={() => setFuelType(f)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                fuelType === f
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Max Daily Rate
          </label>
          <span className="text-sm font-extrabold text-primary">{formatINR(maxPrice)}</span>
        </div>
        <input
          type="range"
          min={1500}
          max={8500}
          step={200}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-primary cursor-pointer h-2"
        />
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>{formatINR(1500)}</span>
          <span>{formatINR(8500)}</span>
        </div>
      </div>

      {/* Availability */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div
          onClick={() => setAvailableOnly(!availableOnly)}
          className="flex items-center justify-between cursor-pointer select-none group"
        >
          <div>
            <span className="text-sm text-slate-800 dark:text-slate-200 font-semibold group-hover:text-primary transition-colors">
              Available Now Only
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Hide vehicles currently on trip</p>
          </div>
          <Switch
            checked={availableOnly}
            onCheckedChange={(checked) => setAvailableOnly(Boolean(checked))}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* ═══════════════ Hero Header ═══════════════ */}
      <div className="relative bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" /> Our Fleet
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Choose Your <br className="hidden sm:block" />
                <span className="text-primary">Perfect Ride</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                Fully insured, sanitized cars available at Little World Mall Kharghar &amp; Orion Mall Panvel — or delivered to your doorstep.
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0 pt-2">
              <Car className="w-4 h-4" />
              <span className="font-bold text-slate-900 dark:text-white">{vehicles.length}</span> vehicles in fleet
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ Search & Sort Toolbar ═══════════════ */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </Button>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search by car name or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:border-primary focus-visible:ring-primary/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-3 ml-auto">
              {/* Results count */}
              <span className="text-xs text-slate-400">
                <span className="font-bold text-slate-900 dark:text-white">{filteredVehicles.length}</span>{" "}
                {filteredVehicles.length === 1 ? "vehicle" : "vehicles"}
              </span>

              {/* Sort */}
              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200 dark:border-slate-700">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-9 rounded-lg bg-transparent text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none cursor-pointer pr-6"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active:</span>
              {category !== "All" && (
                <Badge variant="secondary" className="gap-1 text-xs rounded-lg cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setCategory("All")}>
                  {category} <X className="w-3 h-3" />
                </Badge>
              )}
              {transmission !== "All" && (
                <Badge variant="secondary" className="gap-1 text-xs rounded-lg cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setTransmission("All")}>
                  {transmission} <X className="w-3 h-3" />
                </Badge>
              )}
              {fuelType !== "All" && (
                <Badge variant="secondary" className="gap-1 text-xs rounded-lg cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setFuelType("All")}>
                  {fuelType} <X className="w-3 h-3" />
                </Badge>
              )}
              {maxPrice < 8500 && (
                <Badge variant="secondary" className="gap-1 text-xs rounded-lg cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setMaxPrice(8500)}>
                  Under {formatINR(maxPrice)} <X className="w-3 h-3" />
                </Badge>
              )}
              <button onClick={resetFilters} className="text-[11px] font-bold text-primary hover:underline ml-1">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════ Main Content Area ═══════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* ─── Desktop Sidebar ─── */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                {filterPanel}
              </div>

              {/* Hub Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-slate-900 border border-primary/10 dark:border-primary/20">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  Pickup Hubs
                </div>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Little World Mall, Kharghar Sec 2</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Orion Mall, Panvel Station Road</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Doorstep delivery across Navi Mumbai</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ─── Mobile Filter Drawer ─── */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
              <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white dark:bg-slate-900 p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Filters</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {filterPanel}
                <Button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full mt-6 rounded-xl h-12 bg-primary text-white font-bold text-sm"
                >
                  Show {filteredVehicles.length} vehicles
                </Button>
              </div>
            </div>
          )}

          {/* ─── Vehicle Grid ─── */}
          <div className="flex-1 min-w-0">
            {filteredVehicles.length === 0 ? (
              /* Empty State */
              <div className="py-20 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-5">
                  <Info className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  No Vehicles Found
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                  Try adjusting your filters or price range to discover more vehicles in our fleet.
                </p>
                <Button onClick={resetFilters} className="rounded-xl bg-primary text-white font-bold text-sm px-6">
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────── Vehicle Card Component ───────────────── */

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const imageSrc =
    vehicle.image_urls?.[0] ||
    "https://pub-6e164401844e42a18bdff5533ec36d1f.r2.dev/vehicles/5f85e3cc-d253-4000-962c-b7f65fd6f6a9.jpg";

  return (
    <div className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 flex flex-col">
      {/* Image Area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900">
        <Image
          src={imageSrc}
          alt={vehicle.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Type Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 backdrop-blur-sm border-0 text-[10px] font-bold uppercase tracking-wider shadow-sm px-2.5 py-1 rounded-lg">
            {TYPE_ICONS[vehicle.type] || "🚘"} {vehicle.type}
          </Badge>
        </div>

        {/* Availability Indicator */}
        {vehicle.is_available ? (
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Available
            </div>
          </div>
        ) : (
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1.5 bg-slate-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
              On Trip
            </div>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-primary transition-colors duration-200">
          {vehicle.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {vehicle.description}
        </p>

        {/* Specs Row */}
        <div className="flex items-center gap-3 mt-4 py-3 border-t border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <Fuel className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">{vehicle.fuel_type}</span>
          </div>
          <div className="w-px h-3.5 bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">{vehicle.transmission}</span>
          </div>
          <div className="w-px h-3.5 bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">{vehicle.seats}</span>
          </div>
        </div>

        {/* Footer: Price + CTA */}
        <div className="flex items-end justify-between mt-auto pt-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                {formatINR(vehicle.price_per_24hrs)}
              </span>
              <span className="text-xs font-medium text-slate-400">/day</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Deposit {formatINR(vehicle.deposit_amount)} · OT {formatINR(vehicle.overtime_rate_per_hour)}/hr
            </p>
          </div>

          <Link
            href={`/book?vehicle=${vehicle.id}`}
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold pl-4 pr-3 py-2.5 rounded-xl transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 group/btn"
          >
            Book
            <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
