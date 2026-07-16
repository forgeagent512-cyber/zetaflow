"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Subscription, Invoice, Coupon, PaymentMethod, PaymentTransaction,
  BillingSettings, InvoiceStatus, QuoteStatus, SubscriptionStatus,
  BillingPlan, QuoteLineItem,
} from "@/types";
import type { Quote } from "@/types/billing";
import { BILLING_PLANS } from "@/types";

const sampleInvoices: Invoice[] = [
  { id: "inv-1", number: "INV-2026-001", type: "subscription", status: "paid", amount: 299, currency: "USD", tax: 29.90, taxType: "vat", discount: 0, subtotal: 299, total: 328.90, items: [{ label: "Professional Plan", quantity: 1, unitPrice: 299, total: 299 }], customerName: "Acme Corp", customerEmail: "billing@acme.com", companyName: "Acme Corp", dueDate: "2026-07-01", issuedAt: "2026-06-01", paidAt: "2026-06-01", provider: "stripe", providerInvoiceId: "in_123" },
  { id: "inv-2", number: "INV-2026-002", type: "subscription", status: "paid", amount: 299, currency: "USD", tax: 29.90, taxType: "vat", discount: 0, subtotal: 299, total: 328.90, items: [{ label: "Professional Plan", quantity: 1, unitPrice: 299, total: 299 }], customerName: "Acme Corp", customerEmail: "billing@acme.com", companyName: "Acme Corp", dueDate: "2026-08-01", issuedAt: "2026-07-01", paidAt: "2026-07-01", provider: "stripe", providerInvoiceId: "in_124" },
  { id: "inv-3", number: "INV-2026-003", type: "subscription", status: "pending", amount: 299, currency: "USD", tax: 29.90, taxType: "vat", discount: 0, subtotal: 299, total: 328.90, items: [{ label: "Professional Plan", quantity: 1, unitPrice: 299, total: 299 }], customerName: "Acme Corp", customerEmail: "billing@acme.com", companyName: "Acme Corp", dueDate: "2026-09-01", issuedAt: "2026-08-01", provider: "stripe" },
  { id: "inv-4", number: "INV-2026-004", type: "addon", status: "paid", amount: 49, currency: "USD", tax: 4.90, taxType: "vat", discount: 0, subtotal: 49, total: 53.90, items: [{ label: "Extra AI Employee", quantity: 1, unitPrice: 49, total: 49 }], customerName: "Acme Corp", customerEmail: "billing@acme.com", companyName: "Acme Corp", dueDate: "2026-07-15", issuedAt: "2026-07-01", paidAt: "2026-07-01", provider: "stripe" },
  { id: "inv-5", number: "INV-2026-005", type: "overage", status: "paid", amount: 25, currency: "USD", tax: 2.50, taxType: "vat", discount: 0, subtotal: 25, total: 27.50, items: [{ label: "Overage: 2,500 Extra Workflow Runs", quantity: 2500, unitPrice: 0.01, total: 25 }], customerName: "Acme Corp", customerEmail: "billing@acme.com", companyName: "Acme Corp", dueDate: "2026-07-20", issuedAt: "2026-07-10", paidAt: "2026-07-10", provider: "stripe" },
];

const sampleQuotes: Quote[] = [
  { id: "q-1", number: "Q-2026-001", status: "accepted", customerName: "Acme Corp", customerEmail: "billing@acme.com", companyName: "Acme Corp", items: [{ label: "Custom AI Sales Platform", description: "Enterprise sales automation with 5 AI employees", quantity: 1, unitPrice: 15000, type: "one-time" }, { label: "Monthly Maintenance & Support", description: "Ongoing support and updates", quantity: 1, unitPrice: 2500, type: "monthly" }], subtotal: 17500, tax: 1750, total: 19250, currency: "USD", notes: "Custom enterprise solution for Acme Corp's sales team.", validUntil: "2026-08-15", createdAt: "2026-07-01", acceptedAt: "2026-07-05", convertedInvoiceId: "inv-custom-1" },
  { id: "q-2", number: "Q-2026-002", status: "draft", customerName: "Beta Inc", customerEmail: "finance@beta.io", companyName: "Beta Inc", items: [{ label: "AI Customer Support Suite", description: "Full customer support automation", quantity: 1, unitPrice: 8000, type: "one-time" }], subtotal: 8000, tax: 800, total: 8800, currency: "USD", notes: "Beta Inc requires HIPAA compliance.", validUntil: "2026-09-01", createdAt: "2026-07-10" },
];

const sampleSubscriptions: Subscription[] = [
  { id: "sub-1", planId: "professional", planName: "Professional", status: "active", interval: "monthly", provider: "stripe", providerSubscriptionId: "sub_abc123", currentPeriodStart: "2026-07-01", currentPeriodEnd: "2026-08-01", autoRenew: true, price: 299, currency: "USD", addOns: [{ type: "extra-employees", label: "Extra AI Employees", quantity: 2, price: 98 }] },
];

const samplePaymentMethods: PaymentMethod[] = [
  { id: "pm-1", provider: "stripe", type: "card", last4: "4242", brand: "Visa", expMonth: 12, expYear: 2028, isDefault: true },
];

const sampleTransactions: PaymentTransaction[] = [
  { id: "tx-1", invoiceId: "inv-1", invoiceNumber: "INV-2026-001", amount: 328.90, currency: "USD", provider: "stripe", status: "succeeded", processedAt: "2026-06-01T00:00:00Z" },
  { id: "tx-2", invoiceId: "inv-2", invoiceNumber: "INV-2026-002", amount: 328.90, currency: "USD", provider: "stripe", status: "succeeded", processedAt: "2026-07-01T00:00:00Z" },
  { id: "tx-3", invoiceId: "inv-5", invoiceNumber: "INV-2026-005", amount: 27.50, currency: "USD", provider: "stripe", status: "succeeded", processedAt: "2026-07-10T00:00:00Z" },
];

interface BillingStore {
  subscription: Subscription | null;
  invoices: Invoice[];
  quotes: Quote[];
  coupons: Coupon[];
  paymentMethods: PaymentMethod[];
  transactions: PaymentTransaction[];
  settings: BillingSettings;
  setSubscription: (sub: Subscription | null) => void;
  updateSubscription: (data: Partial<Subscription>) => void;
  cancelSubscription: () => void;
  pauseSubscription: () => void;
  resumeSubscription: () => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  addQuote: (quote: Quote) => void;
  updateQuoteStatus: (id: string, status: QuoteStatus) => void;
  convertQuoteToInvoice: (quoteId: string) => void;
  addCoupon: (coupon: Coupon) => void;
  addPaymentMethod: (method: PaymentMethod) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  addTransaction: (tx: PaymentTransaction) => void;
  updateSettings: (data: Partial<BillingSettings>) => void;
  getPlanById: (id: string) => BillingPlan | undefined;
  getUpcomingInvoice: () => Invoice | undefined;
  getTotalSpent: () => number;
  getMRR: () => number;
}

export const useBillingStore = create<BillingStore>()(
  persist(
    (set, get) => ({
      subscription: sampleSubscriptions[0],
      invoices: sampleInvoices,
      quotes: sampleQuotes,
      coupons: [],
      paymentMethods: samplePaymentMethods,
      transactions: sampleTransactions,
      settings: { taxType: "vat", taxRate: 10, currency: "USD", autoInvoiceOverage: true, gracePeriodDays: 7, pauseOnExceeded: true },

      setSubscription: (sub) => set({ subscription: sub }),
      updateSubscription: (data) => set((state) => ({ subscription: state.subscription ? { ...state.subscription, ...data } : null })),
      cancelSubscription: () => set((state) => ({ subscription: state.subscription ? { ...state.subscription, status: "cancelled" as const, cancelledAt: new Date().toISOString(), autoRenew: false } : null })),
      pauseSubscription: () => set((state) => ({ subscription: state.subscription ? { ...state.subscription, status: "paused" as const, pausedAt: new Date().toISOString() } : null })),
      resumeSubscription: () => set((state) => ({ subscription: state.subscription ? { ...state.subscription, status: "active" as const } : null })),
      addInvoice: (invoice) => set((state) => ({ invoices: [invoice, ...state.invoices] })),
      updateInvoiceStatus: (id, status) => set((state) => ({ invoices: state.invoices.map((i) => i.id === id ? { ...i, status, paidAt: status === "paid" ? new Date().toISOString() : i.paidAt } : i) })),
      addQuote: (quote) => set((state) => ({ quotes: [quote, ...state.quotes] })),
      updateQuoteStatus: (id, status) => set((state) => ({ quotes: state.quotes.map((q) => q.id === id ? { ...q, status, acceptedAt: status === "accepted" ? new Date().toISOString() : q.acceptedAt } : q) })),
      convertQuoteToInvoice: (quoteId) => {
        const quote = get().quotes.find((q) => q.id === quoteId);
        if (!quote) return;
        const invoice: Invoice = {
          id: `inv-${Date.now()}`,
          number: `INV-${new Date().getFullYear()}-${String(get().invoices.length + 1).padStart(3, "0")}`,
          type: "quote",
          status: "pending",
          amount: quote.total,
          currency: quote.currency,
          tax: quote.tax,
          taxType: "vat",
          discount: 0,
          subtotal: quote.subtotal,
          total: quote.total,
          items: quote.items.map((i: QuoteLineItem) => ({ label: i.label, quantity: i.quantity, unitPrice: i.unitPrice, total: i.quantity * i.unitPrice })),
          customerName: quote.customerName,
          customerEmail: quote.customerEmail,
          companyName: quote.companyName,
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          issuedAt: new Date().toISOString(),
          provider: "stripe",
        };
        set((state) => ({
          invoices: [invoice, ...state.invoices],
          quotes: state.quotes.map((q) => q.id === quoteId ? { ...q, status: "converted" as const, convertedInvoiceId: invoice.id } : q),
        }));
      },
      addCoupon: (coupon) => set((state) => ({ coupons: [...state.coupons, coupon] })),
      addPaymentMethod: (method) => set((state) => ({ paymentMethods: [...state.paymentMethods, method] })),
      removePaymentMethod: (id) => set((state) => ({ paymentMethods: state.paymentMethods.filter((m) => m.id !== id) })),
      setDefaultPaymentMethod: (id) => set((state) => ({ paymentMethods: state.paymentMethods.map((m) => ({ ...m, isDefault: m.id === id })) })),
      addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions] })),
      updateSettings: (data) => set((state) => ({ settings: { ...state.settings, ...data } })),
      getPlanById: (id) => BILLING_PLANS.find((p) => p.id === id),
      getUpcomingInvoice: () => get().invoices.find((i) => i.status === "pending"),
      getTotalSpent: () => get().invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.total, 0),
      getMRR: () => {
        const sub = get().subscription;
        if (!sub || sub.status !== "active") return 0;
        const addonTotal = sub.addOns.reduce((s, a) => s + a.price, 0);
        return sub.price + addonTotal;
      },
    }),
    { name: "buildagent-billing" }
  )
);
