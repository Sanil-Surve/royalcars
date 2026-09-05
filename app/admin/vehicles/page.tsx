"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/src/lib/api";
import { Vehicle, Location } from "@/src/types";
import { formatINR, formatApiError } from "@/src/lib/utils";
import { toast } from "sonner";
import {
  Car,
  Plus,
  Edit2,
  Trash2,
  UploadCloud,
  CheckCircle2,
  X,
  Gauge,
  Users,
  Fuel,
  MapPin,
  RefreshCw,
} from "lucide-react";

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState("SUV");
  const [fuelType, setFuelType] = useState("Petrol");
  const [transmission, setTransmission] = useState("Automatic");
  const [seats, setSeats] = useState(5);
  const [price24, setPrice24] = useState(2800);
  const [deposit, setDeposit] = useState(5000);
  const [overtimeRate, setOvertimeRate] = useState(200);
  const [locationId, setLocationId] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrlsText, setImageUrlsText] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadVehicles = () => {
    setLoading(true);
    Promise.all([
      api.get<Vehicle[]>("/vehicles?available_only=false"),
      api.get<Location[]>("/locations").catch(() => ({ data: [] })),
    ])
      .then(([vRes, lRes]) => {
        setVehicles(vRes.data || []);
        setLocations(lRes.data || []);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(formatApiError(err));
        setLoading(false);
      });
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const openAddModal = () => {
    setEditingVehicle(null);
    setName("");
    setType("SUV");
    setFuelType("Petrol");
    setTransmission("Automatic");
    setSeats(5);
    setPrice24(2800);
    setDeposit(5000);
    setOvertimeRate(200);
    setLocationId(locations[0]?.id || "");
    setDescription("");
    setImageUrlsText("");
    setIsAvailable(true);
    setIsModalOpen(true);
  };

  const openEditModal = (v: Vehicle) => {
    setEditingVehicle(v);
    setName(v.name);
    setType(v.type);
    setFuelType(v.fuel_type);
    setTransmission(v.transmission);
    setSeats(v.seats || 5);
    setPrice24(v.price_per_24hrs);
    setDeposit(v.deposit_amount);
    setOvertimeRate(v.overtime_rate_per_hour || 200);
    setLocationId(v.location_id || locations[0]?.id || "");
    setDescription(v.description || "");
    setImageUrlsText((v.image_urls || []).join("\n"));
    setIsAvailable(v.is_available);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    setUploadingImage(true);
    try {
      const res = await api.post<{ url: string }>("/upload/vehicle-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newUrl = res.data.url;
      setImageUrlsText((prev) => (prev ? `${prev}\n${newUrl}` : newUrl));
      toast.success("Image uploaded to Cloudinary!");
    } catch (err: any) {
      toast.error(formatApiError(err));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const imageUrls = imageUrlsText
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    const payload = {
      name,
      type,
      fuel_type: fuelType,
      image_urls: imageUrls,
      price_per_24hrs: Number(price24),
      deposit_amount: Number(deposit),
      overtime_rate_per_hour: Number(overtimeRate),
      is_available: isAvailable,
      location_id: locationId || null,
      description,
      seats: Number(seats),
      transmission,
    };

    try {
      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, payload);
        toast.success("Vehicle updated successfully!");
      } else {
        await api.post("/vehicles", payload);
        toast.success("New vehicle added to fleet!");
      }
      setIsModalOpen(false);
      loadVehicles();
    } catch (err: any) {
      toast.error(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm("Are you sure you want to remove this vehicle from the fleet?")) return;
    try {
      await api.delete(`/vehicles/${vehicleId}`);
      toast.success("Vehicle removed from fleet.");
      loadVehicles();
    } catch (err: any) {
      toast.error(formatApiError(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">Fleet Vehicle Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Add, update specifications, adjust daily rental rates, and upload vehicle photography.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0A192F] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {/* Vehicle Grid Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="rounded-2xl bg-[#0A192F] border border-slate-800 hover:border-slate-700 overflow-hidden flex flex-col justify-between shadow-xl"
          >
            <div className="relative aspect-[16/10] w-full bg-slate-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.image_urls?.[0] || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2"}
                alt={v.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-[#0A192F]/80 text-[10px] font-bold text-[#D4AF37]">
                {v.type}
              </div>
              <div
                className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  v.is_available ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {v.is_available ? "Available" : "Unavailable / In Ride"}
              </div>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold text-white">{v.name}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                  <span>{v.transmission}</span>
                  <span>·</span>
                  <span>{v.fuel_type}</span>
                  <span>·</span>
                  <span>{v.seats} Seats</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-base font-extrabold text-[#D4AF37]">{formatINR(v.price_per_24hrs)}</span>
                  <span className="text-[10px] text-slate-400"> / 24h</span>
                  <p className="text-[10px] text-slate-500">Deposit: {formatINR(v.deposit_amount)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(v)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="p-2 rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-400 hover:bg-rose-900/60"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-950 border border-slate-700 p-6 sm:p-8 space-y-6 text-slate-100 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading text-xl font-bold text-white">
                {editingVehicle ? "Edit Fleet Vehicle" : "Add New Vehicle"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-xs text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase text-slate-400">Vehicle Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Hyundai Creta SX (O)"
                    className="w-full h-10 rounded-xl bg-slate-900 border border-slate-700 px-3 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase text-slate-400">Category / Body Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-900 border border-slate-700 px-3 text-white"
                  >
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="MPV">MPV</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase text-slate-400">Transmission</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-900 border border-slate-700 px-3 text-white"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase text-slate-400">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-900 border border-slate-700 px-3 text-white"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase text-slate-400">Price Per 24h (₹) *</label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={price24}
                    onChange={(e) => setPrice24(Number(e.target.value))}
                    className="w-full h-10 rounded-xl bg-slate-900 border border-slate-700 px-3 text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase text-slate-400">Refundable Deposit (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={deposit}
                    onChange={(e) => setDeposit(Number(e.target.value))}
                    className="w-full h-10 rounded-xl bg-slate-900 border border-slate-700 px-3 text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase text-slate-400">Overtime Rate Per Hour (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={overtimeRate}
                    onChange={(e) => setOvertimeRate(Number(e.target.value))}
                    className="w-full h-10 rounded-xl bg-slate-900 border border-slate-700 px-3 text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase text-slate-400">Default Hub Location</label>
                  <select
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-900 border border-slate-700 px-3 text-white"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cloudinary Image Upload helper */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold uppercase text-slate-400">Vehicle Photos</label>
                  <label className="cursor-pointer text-[11px] font-bold text-[#D4AF37] hover:underline flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" />
                    {uploadingImage ? "Uploading to Cloudinary..." : "Upload Photo File"}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      disabled={uploadingImage}
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                <textarea
                  rows={2}
                  placeholder="Paste direct image URLs (one per line) or use the upload button above..."
                  value={imageUrlsText}
                  onChange={(e) => setImageUrlsText(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase text-slate-400">Description & Highlights</label>
                <textarea
                  rows={2}
                  placeholder="Key features, interior leather, sunroof, Bose sound, cruise control..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-white"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#D4AF37]"
                />
                <span className="font-semibold text-white">Vehicle is active and available for booking</span>
              </label>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#D4AF37] text-[#0A192F] font-bold uppercase tracking-wider shadow"
                >
                  {submitting ? "Saving..." : "Save Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
