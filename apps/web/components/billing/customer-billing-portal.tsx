"use client";

import { CreditCard, FileText, BarChart3, Activity, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBillingStore } from "@/store/use-billing-store";
import { useUsageStore } from "@/store/use-usage-store";
import { SubscriptionManager } from "./subscription-manager";
import { InvoiceList } from "./invoice-list";
import { QuoteSystem } from "./quote-system";
import { UsageDashboard } from "./usage-dashboard";
import { cn } from "@/lib/utils";

export function CustomerBillingPortal() {
  const { subscription, paymentMethods, invoices, getMRR, getTotalSpent } = useBillingStore();
  const { getUsagePercent } = useUsageStore();
  const mrr = getMRR();
  const totalSpent = getTotalSpent();
  const usagePct = getUsagePercent();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10"><CreditCard className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly Bill</p>
              <p className="text-xl font-bold">${mrr}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10"><FileText className="h-5 w-5 text-emerald-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="text-xl font-bold">${totalSpent.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={cn("p-2 rounded-xl", usagePct >= 80 ? "bg-amber-500/10" : "bg-blue-500/10")}><Activity className={cn("h-5 w-5", usagePct >= 80 ? "text-amber-500" : "text-blue-500")} /></div>
            <div>
              <p className="text-xs text-muted-foreground">Usage</p>
              <p className="text-xl font-bold">{usagePct}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10"><CreditCard className="h-5 w-5 text-purple-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Payment Method</p>
              <p className="text-sm font-medium">
                {paymentMethods.find((m) => m.isDefault)?.brand || "None"} ••
                {paymentMethods.find((m) => m.isDefault)?.last4 || "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscription">
        <TabsList className="glass w-full justify-start overflow-x-auto">
          <TabsTrigger value="subscription" className="text-xs gap-1"><CreditCard className="h-3 w-3" /> Subscription</TabsTrigger>
          <TabsTrigger value="invoices" className="text-xs gap-1"><FileText className="h-3 w-3" /> Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="quotes" className="text-xs gap-1"><FileText className="h-3 w-3" /> Quotes</TabsTrigger>
          <TabsTrigger value="usage" className="text-xs gap-1"><BarChart3 className="h-3 w-3" /> Usage</TabsTrigger>
        </TabsList>
        <TabsContent value="subscription" className="mt-4"><SubscriptionManager /></TabsContent>
        <TabsContent value="invoices" className="mt-4"><InvoiceList /></TabsContent>
        <TabsContent value="quotes" className="mt-4"><QuoteSystem /></TabsContent>
        <TabsContent value="usage" className="mt-4"><UsageDashboard /></TabsContent>
      </Tabs>
    </div>
  );
}
