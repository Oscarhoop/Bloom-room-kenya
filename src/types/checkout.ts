import { DeliveryTimeSlot, PaymentMethod } from "@prisma/client";

// Request types

export interface CheckoutPayload {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  order: {
    isGift: boolean;
    giftMessage?: string;
    recipientName?: string;
    recipientPhone?: string;
    deliveryDate: string; // ISO format string (YYYY-MM-DD)
    deliveryTimeSlot: DeliveryTimeSlot;
    deliveryAddress: {
      street: string;
      estate: string;
      area: string;
      city: string;
      landmark?: string;
      instructions?: string;
    };
    deliveryNotes?: string;
    paymentMethod: PaymentMethod;
  };
  items: {
    productId: string;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
  }[];
}

// Response types

export interface CheckoutResponse {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}
