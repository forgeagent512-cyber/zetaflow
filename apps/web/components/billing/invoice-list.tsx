"use client";

import { useState } from "react";
import { Download, FileText, Mail, CheckCircle2, AlertCircle, Clock, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useBillingStore } from "@/store/use-billing-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-500",
  pending: "bg-amber-500/10 text-amber-500",
  overdue: "bg-red-500/10 text-red-500",
  cancelled: "bg-muted text-muted-foreground",
  draft: "bg-blue-500/10 text-blue-500",
  refunded: "bg-purple-500/10 text-purple-500",
};

export function InvoiceList() {
  const { invoices } = useBillingStore();
  const [query, setQuery] = useState("");

  const filtered = invoices.filter((inv) =>
    inv.number.toLowerCase().includes(query.toLowerCase()) ||
    inv.status.includes(query.toLowerCase())
  );

  const totalPending = invoices.filter((i) => i.status === "pending" || i.status === "overdue").reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoices..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 glass w-64" />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Outstanding:</span>
          <span className="font-bold text-amber-500">${totalPending.toFixed(2)}</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-xl py-12 text-center">
          <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-1">No invoices found</h3>
          <p className="text-sm text-muted-foreground">Invoices will appear here once generated.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((invoice) => (
            <Card key={invoice.id} className="glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", statusStyles[invoice.status] || "bg-muted")}>
                      {invoice.status === "paid" ? <CheckCircle2 className="h-5 w-5" /> :
                       invoice.status === "overdue" ? <AlertCircle className="h-5 w-5" /> :
                       invoice.status === "pending" ? <Clock className="h-5 w-5" /> :
                       <FileText className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{invoice.number}</h3>
                        <Badge className={cn("text-[10px]", statusStyles[invoice.status])}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(invoice.issuedAt).toLocaleDateString()} • {invoice.type.replace("-", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold">${invoice.total.toFixed(2)}</p>
                      <p className="text-[10px] text-muted-foreground">Due {new Date(invoice.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Download PDF">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      {invoice.status === "pending" && (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground" title="Send via email">
                          <Mail className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {invoice.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-1">
                    {invoice.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.label} x{item.quantity}</span>
                        <span>${item.total.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between text-xs pt-1 border-t">
                      <span>Tax</span>
                      <span>${invoice.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-semibold pt-1 border-t">
                      <span>Total</span>
                      <span>${invoice.total.toFixed(2)}</span>
                    </div>
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
