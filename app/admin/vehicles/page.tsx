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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

        <Button
          onClick={openAddModal}
          className="bg-[#D4AF37] hover:bg-amber-400 text-[#0A192F] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </Button>
      </div>

      {/* Vehicle Grid Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="rounded-2xl bg-[#0A192F] border border-slate-800 hover:border-slate-700 overflow-hidden flex flex-col justify-between shadow-xl"
          >
            <div className="relative aspect-[16/10] w-full bg-gradient-to-b from-slate-900/80 to-slate-950 flex items-center justify-center p-3 border-b border-slate-800/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.image_urls?.[0] || "https://pub-6e164401844e42a18bdff5533ec36d1f.r2.dev/vehicles/5f85e3cc-d253-4000-962c-b7f65fd6f6a9.jpg"}
                alt={v.name}
                className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute top-3 left-3">
                <Badge variant="outline" className="bg-[#0A192F]/80 text-[#D4AF37] border-[#D4AF37]/30 text-[10px] font-bold">
                  {v.type}
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${
                    v.is_available
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                  }`}
                >
                  {v.is_available ? "Available" : "In Ride / Maintenance"}
                </Badge>
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
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => openEditModal(v)}
                    className="h-8 w-8 rounded-xl bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleDelete(v.id)}
                    className="h-8 w-8 rounded-xl bg-rose-950/40 border-rose-900/50 text-rose-400 hover:bg-rose-900/60"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Vehicle Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => setIsModalOpen(open)}>
        <DialogContent className="dark sm:max-w-2xl bg-[#0A192F] border-slate-700 text-slate-100 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b border-slate-800">
            <DialogTitle className="font-heading text-xl font-bold text-white">
              {editingVehicle ? "Edit Fleet Vehicle" : "Add New Vehicle"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Configure vehicle specifications, hourly/24h rates, security deposits, and upload photos.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 text-xs pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Vehicle Name *</label>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hyundai Creta SX (O)"
                  className="bg-slate-900/90 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Category / Body Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-9 rounded-md bg-slate-900 border border-slate-700 px-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                >
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="MPV">MPV</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Transmission</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="w-full h-9 rounded-md bg-slate-900 border border-slate-700 px-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Fuel Type</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full h-9 rounded-md bg-slate-900 border border-slate-700 px-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Price Per 24h (₹) *</label>
                <Input
                  type="number"
                  required
                  min={500}
                  value={price24}
                  onChange={(e) => setPrice24(Number(e.target.value))}
                  className="bg-slate-900/90 border-slate-700 text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Refundable Deposit (₹) *</label>
                <Input
                  type="number"
                  required
                  min={0}
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  className="bg-slate-900/90 border-slate-700 text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Overtime Rate Per Hour (₹)</label>
                <Input
                  type="number"
                  min={0}
                  value={overtimeRate}
                  onChange={(e) => setOvertimeRate(Number(e.target.value))}
                  className="bg-slate-900/90 border-slate-700 text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Default Hub Location</label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full h-9 rounded-md bg-slate-900 border border-slate-700 px-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                >
                  <option value="">Select Pickup Hub</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cloudinary Image Upload helper */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Vehicle Photos</label>
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
              <Textarea
                rows={2}
                placeholder="Paste direct image URLs (one per line) or use the upload button above..."
                value={imageUrlsText}
                onChange={(e) => setImageUrlsText(e.target.value)}
                className="bg-slate-900/90 border-slate-700 text-white font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Description & Highlights</label>
              <Textarea
                rows={2}
                placeholder="Key features, interior leather, sunroof, Bose sound, cruise control..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-900/90 border-slate-700 text-white text-xs"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <p className="font-semibold text-white text-xs">Active & Available for Booking</p>
                <p className="text-[11px] text-slate-400">Make this car immediately discoverable to clients</p>
              </div>
              <Switch
                checked={isAvailable}
                onCheckedChange={(val) => setIsAvailable(val)}
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#D4AF37] hover:bg-amber-400 text-[#0A192F] font-bold uppercase tracking-wider"
              >
                {submitting ? "Saving..." : "Save Vehicle"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
