export type UserRole = "customer" | "admin";
export type KYCStatus = "not_submitted" | "pending" | "approved" | "rejected";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  kyc_status: KYCStatus;
  created_at: string;
  booking_count?: number;
}

export interface Vehicle {
  id: string;
  name: string;
  type: "SUV" | "Sedan" | "Hatchback" | "MPV" | string;
  fuel_type: "Petrol" | "Diesel" | "Electric" | "Hybrid" | string;
  image_urls: string[];
  price_per_24hrs: number;
  deposit_amount: number;
  overtime_rate_per_hour: number;
  is_available: boolean;
  location_id?: string | null;
  description?: string | null;
  seats: number;
  transmission: "Manual" | "Automatic" | string;
  created_at?: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  is_active: boolean;
  created_at?: string;
}

export type BookingStatus =
  | "pending_kyc"
  | "verified"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled";

export type PaymentType = "full" | "partial" | "balance" | "pay_at_site" | "balance_cash";

export interface Booking {
  id: string;
  user_id: string;
  vehicle_id: string;
  vehicle_name: string;
  vehicle_image?: string | null;
  pickup_location_id: string;
  dropoff_location_id: string;
  pickup_date: string;
  pickup_time: string;
  dropoff_date: string;
  dropoff_time: string;
  rent_amount: number;
  deposit_amount: number;
  total_amount: number;
  status: BookingStatus;
  payment_type?: PaymentType | null;
  paid_amount: number;
  balance_amount: number;
  created_at: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;

  // Active / End ride details
  ride_started_at?: string;
  ride_started_by?: string;
  odometer_start?: number;
  fuel_level_start?: string;
  pickup_photos?: string[];
  pickup_notes?: string;

  ride_ended_at?: string;
  ride_ended_by?: string;
  odometer_end?: number;
  km_driven?: number;
  fuel_level_end?: string;
  return_photos?: string[];
  return_notes?: string;
  overtime_hours?: number;
  overtime_charge?: number;
  extra_charges?: number;
  extra_charges_reason?: string;
  total_extra_charges?: number;

  // Razorpay
  razorpay_customer_id?: string;
  razorpay_token_id?: string;

  // Client extra: Doorstep & Business details (stored in memory/notes)
  doorstep_delivery?: boolean;
  delivery_address?: string;
  business_billing?: boolean;
  gstin?: string;
  company_name?: string;
}

export type KYCDocumentType =
  | "dl_front"
  | "dl_back"
  | "aadhar_front"
  | "aadhar_back"
  | "rent_agreement"
  | "light_bill";

export interface KYCDocument {
  id: string;
  user_id: string;
  document_type: KYCDocumentType;
  file_url: string;
  public_id: string;
  resource_type: string;
  content_type: string;
  verification_status: "pending" | "approved" | "rejected";
  admin_notes?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  booking_id: string;
  amount: number;
  payment_type: string;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_customer_id?: string | null;
  status: "pending" | "success" | "failed";
  is_balance_charge: boolean;
  paid_at?: string | null;
  created_at: string;
}

export interface AdminMetrics {
  total_bookings: number;
  active_bookings: number;
  completed_bookings: number;
  pending_kyc: number;
  total_vehicles: number;
  available_vehicles: number;
  total_customers: number;
  revenue: number;
  pending_balance: number;
  fleet_utilization: number;
}

export type PricingTier = "hourly_6" | "hourly_12" | "daily" | "weekly" | "biweekly" | "monthly";

export interface PricingBreakdown {
  tier: PricingTier;
  tierLabel: string;
  durationLabel: string;
  baseRent: number;
  discountPercent: number;
  discountAmount: number;
  finalRent: number;
  deposit: number;
  doorstepFee: number;
  gstAmount: number;
  totalPayable: number;
  overtimeRate: number;
}
