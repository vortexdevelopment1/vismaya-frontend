/**
 * Payments API Service
 * Handles Razorpay/gateway order creation, payment verification, and transaction history.
 */

import { apiClient } from "../client.js";
import { isRealMode } from "../config.js";
import { mapPayment } from "../mappers/index.js";
import { mockPayments } from "./mockSeedData.js";

export const paymentService = {
  /**
   * Create an order for checkout
   * @param {Object} payload { amount, currency, planId, description }
   */
  async createPaymentOrder(payload) {
    if (!isRealMode("payments")) {
      const mockOrder = {
        orderId: "order_mock_" + Date.now(),
        amount: payload.amount || 4999,
        currency: payload.currency || "INR",
        status: "Pending",
        keyId: "rzp_test_mock_key",
      };
      return {
        success: true,
        data: mockOrder,
      };
    }

    const res = await apiClient.post("/api/payments/create-order", payload);
    return {
      success: true,
      data: res?.data || res,
    };
  },

  /**
   * Verify signature upon checkout completion
   * @param {Object} payload { razorpay_order_id, razorpay_payment_id, razorpay_signature }
   */
  async verifyPayment(payload) {
    if (!isRealMode("payments")) {
      return {
        success: true,
        message: "Payment verified successfully (Mock)",
        transaction: mapPayment({
          id: "pay_mock_" + Date.now(),
          amount: 4999,
          status: "Paid",
          createdAt: new Date().toISOString(),
        }),
      };
    }

    const res = await apiClient.post("/api/payments/verify", payload);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapPayment(doc) : null,
    };
  },

  /**
   * Fetch authenticated user's transaction history
   */
  async getMyTransactions(params = {}) {
    if (!isRealMode("payments")) {
      return {
        success: true,
        data: mockPayments.map(mapPayment),
      };
    }

    const res = await apiClient.get("/api/payments/my-transactions", { params });
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return {
      success: true,
      data: docs.map(mapPayment),
    };
  },
};
