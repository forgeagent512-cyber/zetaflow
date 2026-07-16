"use client";

import { PageTransition } from "@/components/animations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlansPage } from "@/components/billing";
import { AdminBillingPanel } from "@/components/billing";
import { InvoiceList, QuoteSystem } from "@/components/billing";

export default function PlansManagerPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Billing & Plans</h1>
        <Tabs defaultValue="plans">
          <TabsList className="glass">
            <TabsTrigger value="plans" className="text-xs">Plans</TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs">Invoices</TabsTrigger>
            <TabsTrigger value="quotes" className="text-xs">Quotes</TabsTrigger>
            <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
          </TabsList>
          <TabsContent value="plans" className="mt-4"><PlansPage /></TabsContent>
          <TabsContent value="invoices" className="mt-4"><InvoiceList /></TabsContent>
          <TabsContent value="quotes" className="mt-4"><QuoteSystem /></TabsContent>
          <TabsContent value="revenue" className="mt-4"><AdminBillingPanel /></TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
