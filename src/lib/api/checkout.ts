import type { CheckoutPayload, CheckoutResponse } from "@/types/checkout";

/**
 * Submits a new order payload to the backend for processing and validation.
 * 
 * @param payload - The complete checkout data including customer details, delivery info, and cart items
 * @returns A promise resolving to the CheckoutResponse, containing success status, and order identifiers or validation errors.
 */
export async function submitOrder(payload: CheckoutPayload): Promise<CheckoutResponse> {
  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      // Return structured validation errors if available
      return {
        success: false,
        error: data.error || "Failed to submit order. Please try again.",
        fieldErrors: data.fieldErrors, // Backend validation (e.g., date, phone)
      };
    }

    return data as CheckoutResponse;
  } catch (error) {
    console.error("Checkout submission error:", error);
    return {
      success: false,
      error: "A network error occurred. Please check your connection and try again.",
    };
  }
}
