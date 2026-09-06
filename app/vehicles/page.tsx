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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

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
    <div className="w-full min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 lg:py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Kharghar & Panvel Fleet
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Available Rental Vehicles
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Choose from fully insured, verified cars. Handover at Little World Mall Kharghar, Orion Mall Panvel, or doorstep delivery across Kharghar and Panvel.
          </p>
        </div>

        {/* Search & Sort Controls Bar */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
            <Input
              type="text"
              placeholder="Search car, brand (e.g. Rumion, Thar, Punch)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:border-primary"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-900 dark:text-white">{filteredVehicles.length}</span> vehicles
            </span>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-primary" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 text-xs text-slate-700 dark:text-slate-300 font-semibold focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid: Sidebar Filters + Vehicle Cards */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-3 space-y-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" /> Filters
                </span>
                <button
                  onClick={() => {
                    setCategory("All");
                    setTransmission("All");
                    setFuelType("All");
                    setMaxPrice(8500);
                    setSearchQuery("");
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Reset All
                </button>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Vehicle Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {["All", "SUV", "Sedan", "Hatchback", "MPV"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        category === c
                          ? "bg-primary text-white shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:text-primary"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transmission Filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Transmission
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {["All", "Manual", "Automatic"].map((tr) => (
                    <button
                      key={tr}
                      onClick={() => setTransmission(tr)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        transmission === tr
                          ? "bg-primary text-white shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:text-primary"
                      }`}
                    >
                      {tr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fuel Filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Fuel Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {["All", "Petrol", "Diesel", "Petrol + CNG"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFuelType(f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        fuelType === f
                          ? "bg-primary text-white shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:text-primary"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-400">Max Daily Rate</span>
                  <span className="font-bold text-primary">{formatINR(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min={1500}
                  max={8500}
                  step={200}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              {/* Availability Toggle */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div
                  onClick={() => setAvailableOnly(!availableOnly)}
                  className="flex items-center justify-between cursor-pointer text-xs select-none"
                >
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Available Now Only</span>
                  <Switch
                    checked={availableOnly}
                    onCheckedChange={(checked) => setAvailableOnly(Boolean(checked))}
                  />
                </div>
              </div>
            </div>

            {/* Hub Quick Info Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <MapPin className="w-4 h-4 text-primary" /> Little World Mall Kharghar Hub
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Walk-in pickup & sanitization center opposite Kharghar station. Doorstep delivery available across all sectors.
              </p>
            </div>
          </aside>

          {/* Vehicle List Grid */}
          <div className="lg:col-span-9">
            {filteredVehicles.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <Info className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Vehicles Match Your Filter</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting the transmission, category, or price slider to see more available cars.
                </p>
                <button
                  onClick={() => {
                    setCategory("All");
                    setTransmission("All");
                    setFuelType("All");
                    setMaxPrice(8500);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-xs"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredVehicles.map((vehicle) => {
                  const imageSrc =
                    vehicle.image_urls?.[0] ||
                    "https://pub-6e164401844e42a18bdff5533ec36d1f.r2.dev/vehicles/5f85e3cc-d253-4000-962c-b7f65fd6f6a9.jpg";

                  return (
                    <div
                      key={vehicle.id}
                      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group"
                    >
                      {/* Vehicle Image */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-50 dark:bg-slate-950/30 flex items-center justify-center p-3 border-b border-slate-100 dark:border-slate-800">
                        <Image
                          src={imageSrc}
                          alt={vehicle.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-white text-[9px] font-bold uppercase tracking-wider bg-primary shadow-xs z-10">
                          Best Value
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                            {vehicle.type}
                          </span>
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                            {vehicle.name}
                          </h3>

                          {/* Specs grid */}
                          <div className="grid grid-cols-3 gap-1 py-2.5 my-2.5 border-y border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Fuel className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">{vehicle.fuel_type}</span>
                            </div>
                            <div className="flex items-center justify-center gap-1 border-x border-slate-100 dark:border-slate-800">
                              <Settings className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">{vehicle.transmission}</span>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>{vehicle.seats} Seats</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto">
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-2 truncate">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">Home delivery & center pick-up</span>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
                            <div>
                              <div className="flex items-baseline gap-0.5">
                                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                                  {formatINR(vehicle.price_per_24hrs)}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">/day</span>
                              </div>
                              <p className="text-[9px] font-medium text-slate-400">
                                {formatINR(vehicle.overtime_rate_per_hour)}/hr base
                              </p>
                            </div>

                            <Link
                              href={`/book?vehicle=${vehicle.id}`}
                              className="bg-primary hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs shadow-primary/20"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
