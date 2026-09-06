import { api } from "./api";
import { formatApiError } from "./utils";
import { toast } from "sonner";
import { Booking } from "@/src/types";

const RZP_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = RZP_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface PaymentInitResponse {
  order_id: string;
  amount: number;
  currency: string;
  key: string;
  customer_id?: string;
  save_token?: boolean;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
}

export async function processRazorpayPayment(
  booking: Booking,
  paymentType: "full" | "partial" | "balance",
  onSuccess?: (updatedBooking: Booking) => void
): Promise<Booking | null> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    toast.error("Unable to load Razorpay payment gateway. Please check your internet connection.");
    return null;
  }

  let initData: PaymentInitResponse;
  try {
    const res = await api.post<PaymentInitResponse>("/payments/init", {
      booking_id: booking.id,
      payment_type: paymentType,
    });
    initData = res.data;
  } catch (err: any) {
    toast.error(formatApiError(err));
    return null;
  }

  return new Promise((resolve) => {
    const options: any = {
      key: initData.key,
      order_id: initData.order_id,
      amount: initData.amount,
      currency: initData.currency || "INR",
      name: "Royal Cars",
      description: `Reservation #${booking.id.slice(0, 8)} · ${paymentType === "partial" ? "20% Advance Token" : paymentType === "full" ? "100% Full Payment" : "Balance Due"}`,
      prefill: initData.prefill || {},
      notes: initData.notes || {},
      theme: {
        color: "#0A192F",
      },
      handler: async (response: any) => {
        try {
          const verifyRes = await api.post<Booking>("/payments/verify", {
            booking_id: booking.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          toast.success("Payment verified successfully! Your booking is confirmed.");
          if (onSuccess) onSuccess(verifyRes.data);
          resolve(verifyRes.data);
        } catch (verifyErr: any) {
          toast.error(formatApiError(verifyErr));
          resolve(null);
        }
      },
      modal: {
        ondismiss: () => {
          toast.info("Payment window was closed.");
          resolve(null);
        },
      },
    };

    if (initData.customer_id) {
      options.customer_id = initData.customer_id;
    }
    if (initData.save_token) {
      options.save = 1;
    }

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp: any) => {
        toast.error(resp?.error?.description || "Payment failed at checkout gateway.");
        resolve(null);
      });
      rzp.open();
    } catch (e: any) {
      toast.error(e?.message || "Failed to initialize Razorpay checkout.");
      resolve(null);
    }
  });
}
