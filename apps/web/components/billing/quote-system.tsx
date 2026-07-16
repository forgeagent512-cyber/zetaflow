"use client";

import { useState } from "react";
import { FileText, Check, X, MessageSquare, ArrowRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBillingStore } from "@/store/use-billing-store";
import type { QuoteStatus, QuoteLineItem } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  draft: "bg-blue-500/10 text-blue-500",
  sent: "bg-amber-500/10 text-amber-500",
  accepted: "bg-emerald-500/10 text-emerald-500",
  rejected: "bg-red-500/10 text-red-500",
  negotiating: "bg-purple-500/10 text-purple-500",
  converted: "bg-emerald-500/10 text-emerald-500",
};

export function QuoteSystem() {
  const { quotes, addQuote, updateQuoteStatus, convertQuoteToInvoice } = useBillingStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customerName: "", customerEmail: "", companyName: "", notes: "" });
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([
    { label: "", description: "", quantity: 1, unitPrice: 0, type: "one-time" },
  ]);

  const handleAddItem = () => {
    setLineItems([...lineItems, { label: "", description: "", quantity: 1, unitPrice: 0, type: "one-time" }]);
  };

  const handleRemoveItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, data: Partial<QuoteLineItem>) => {
    setLineItems(lineItems.map((item, i) => i === index ? { ...item, ...data } : item));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleCreateQuote = () => {
    if (!form.customerName || lineItems.some((i) => !i.label)) {
      toast.error("Please fill in all required fields");
      return;
    }
    const quote = {
      id: `q-${Date.now()}`,
      number: `Q-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, "0")}`,
      status: "draft" as QuoteStatus,
      ...form,
      items: lineItems,
      subtotal,
      tax,
      total,
      currency: "USD",
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };
    addQuote(quote as any);
    setShowForm(false);
    setForm({ customerName: "", customerEmail: "", companyName: "", notes: "" });
    setLineItems([{ label: "", description: "", quantity: 1, unitPrice: 0, type: "one-time" }]);
    toast.success("Quote created successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Quotations</h2>
          <p className="text-sm text-muted-foreground">{quotes.length} total</p>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-3.5 w-3.5" /> New Quote
        </Button>
      </div>

      {showForm && (
        <Card className="glass border-primary/20">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-semibold">Create New Quote</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1"><Label className="text-xs">Customer Name</Label><Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="glass" /></div>
              <div className="space-y-1"><Label className="text-xs">Email</Label><Input type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} className="glass" /></div>
              <div className="space-y-1"><Label className="text-xs">Company</Label><Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="glass" /></div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Line Items</Label>
              {lineItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={item.label} onChange={(e) => handleItemChange(i, { label: e.target.value })} placeholder="Item name" className="glass flex-1" />
                  <Input value={item.description} onChange={(e) => handleItemChange(i, { description: e.target.value })} placeholder="Description" className="glass flex-1" />
                  <Input type="number" value={item.quantity} onChange={(e) => handleItemChange(i, { quantity: Number(e.target.value) })} className="glass w-16" />
                  <Input type="number" value={item.unitPrice} onChange={(e) => handleItemChange(i, { unitPrice: Number(e.target.value) })} className="glass w-20" placeholder="Price" />
                  <select value={item.type} onChange={(e) => handleItemChange(i, { type: e.target.value as any })} className="h-9 rounded-lg border border-input bg-background px-2 text-xs w-24">
                    <option value="one-time">One-Time</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <button onClick={() => handleRemoveItem(i)} className="p-1.5 text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
              <Button size="sm" variant="outline" className="text-xs gap-1" onClick={handleAddItem}><Plus className="h-3 w-3" /> Add Item</Button>
            </div>
            <div className="space-y-1"><Label className="text-xs">Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="glass" /></div>
            <div className="flex items-center justify-between text-sm">
              <span>Total: <strong>${total.toFixed(2)}</strong> (incl. ${tax.toFixed(2)} tax)</span>
              <Button size="sm" onClick={handleCreateQuote}>Create Quote</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {quotes.length === 0 ? (
        <div className="glass rounded-xl py-12 text-center">
          <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-1">No quotes yet</h3>
          <p className="text-sm text-muted-foreground">Create a quote for custom projects.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {quotes.map((quote) => (
            <Card key={quote.id} className="glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold", statusStyles[quote.status])}>
                      {quote.status === "accepted" ? <Check className="h-5 w-5" /> : quote.status === "rejected" ? <X className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{quote.number}</h3>
                        <Badge className={cn("text-[10px] capitalize", statusStyles[quote.status])}>{quote.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{quote.customerName} • {quote.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold">${quote.total.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">Valid until {new Date(quote.validUntil).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1">
                      {quote.status === "draft" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { updateQuoteStatus(quote.id, "sent"); toast.success("Quote sent to customer"); }}>
                          <ArrowRight className="h-3 w-3 mr-1" /> Send
                        </Button>
                      )}
                      {quote.status === "sent" && (
                        <>
                          <Button size="sm" variant="outline" className="h-7 text-xs text-emerald-500" onClick={() => { updateQuoteStatus(quote.id, "accepted"); toast.success("Quote accepted"); }}>
                            <Check className="h-3 w-3 mr-1" /> Accept
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs text-red-500" onClick={() => { updateQuoteStatus(quote.id, "rejected"); toast.error("Quote rejected"); }}>
                            <X className="h-3 w-3 mr-1" /> Reject
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { updateQuoteStatus(quote.id, "negotiating"); toast.info("Negotiation started"); }}>
                            <MessageSquare className="h-3 w-3 mr-1" /> Negotiate
                          </Button>
                        </>
                      )}
                      {quote.status === "accepted" && (
                        <Button size="sm" className="h-7 text-xs" onClick={() => { convertQuoteToInvoice(quote.id); toast.success("Quote converted to invoice"); }}>
                          <FileText className="h-3 w-3 mr-1" /> Convert to Invoice
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                {quote.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-1">
                    {quote.items.map((item: QuoteLineItem, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.label} x{item.quantity} ({item.type})</span>
                        <span>${(item.quantity * item.unitPrice).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
