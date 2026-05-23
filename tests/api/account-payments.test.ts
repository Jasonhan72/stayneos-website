/** @jest-environment node */
import { NextRequest } from "next/server";
import { DELETE, PATCH } from "@/app/api/account/payments/[paymentMethodId]/route";
import { stripe } from "@/lib/stripe";

jest.mock("@/lib/auth", () => ({
  getCurrentUserFromRequest: jest.fn(async () => ({ userId: "u1", email: "guest@test.com", role: "USER" })),
}));

jest.mock("@/lib/d1", () => ({
  getDb: jest.fn(() => ({})),
  userDb: {
    findById: jest.fn(async () => ({ id: "u1", stripeCustomerId: "cus_current" })),
  },
}));

jest.mock("@/lib/security/csrf", () => ({
  validateCsrf: jest.fn(() => true),
}));

jest.mock("@/lib/stripe", () => ({
  stripe: {
    customers: {
      update: jest.fn(async () => ({})),
    },
    paymentMethods: {
      retrieve: jest.fn(async () => ({ id: "pm_other", customer: "cus_other" })),
      detach: jest.fn(async () => ({})),
    },
  },
}));

const params = Promise.resolve({ paymentMethodId: "pm_other" });

describe("account payment methods ownership checks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not set another customer's payment method as default", async () => {
    const req = new NextRequest("http://localhost/api/account/payments/pm_other", { method: "PATCH" });

    const res = await PATCH(req, { params });

    expect(res.status).toBe(404);
    expect(stripe.paymentMethods.retrieve).toHaveBeenCalledWith("pm_other");
    expect(stripe.customers.update).not.toHaveBeenCalled();
  });

  it("does not detach another customer's payment method", async () => {
    const req = new NextRequest("http://localhost/api/account/payments/pm_other", { method: "DELETE" });

    const res = await DELETE(req, { params });

    expect(res.status).toBe(404);
    expect(stripe.paymentMethods.retrieve).toHaveBeenCalledWith("pm_other");
    expect(stripe.paymentMethods.detach).not.toHaveBeenCalled();
  });
});
