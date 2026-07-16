"use client";

import { ShoppingBag, Download, CreditCard, FileText, Rocket, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePurchasesStore } from "@/store/use-purchases-store";
import { cn } from "@/lib/utils";

export function MyPurchases() {
  const { purchases } = usePurchasesStore();

  const totalSpent = purchases.reduce((sum, p) => sum + p.price, 0);
  const activeDeployments = purchases.reduce((sum, p) => sum + p.deployments.filter((d) => d.status === "running").length, 0);
  const totalDeployments = purchases.reduce((sum, p) => sum + p.deployments.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Purchases</h1>
        <p className="text-sm text-muted-foreground mt-1">{purchases.length} products purchased</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10"><ShoppingBag className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{purchases.length}</p><p className="text-xs text-muted-foreground">Purchases</p></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10"><Rocket className="h-5 w-5 text-emerald-500" /></div>
            <div><p className="text-2xl font-bold">{activeDeployments}</p><p className="text-xs text-muted-foreground">Active</p></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10"><Download className="h-5 w-5 text-amber-500" /></div>
            <div><p className="text-2xl font-bold">{totalDeployments}</p><p className="text-xs text-muted-foreground">Deployments</p></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10"><CreditCard className="h-5 w-5 text-blue-500" /></div>
            <div><p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Spent</p></div>
          </CardContent>
        </Card>
      </div>

      {purchases.length === 0 ? (
        <div className="glass rounded-xl py-16 text-center">
          <div className="p-4 rounded-2xl bg-muted inline-flex mb-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No purchases yet</h3>
          <p className="text-sm text-muted-foreground">Browse the store and install your first product.</p>
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="glass">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-3">
            {purchases.map((p) => (
              <Card key={p.id} className="glass">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-lg font-bold text-primary">
                        {p.productName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{p.productName}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Purchased {new Date(p.purchasedAt).toLocaleDateString()}</span>
                          <Badge variant="secondary" className="text-[10px] capitalize">{p.license.replace("-", " ")}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">${p.price}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                      <p className="text-[10px] text-muted-foreground">{p.deployments.length} deployment{p.deployments.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="active" className="mt-4">
            {purchases.filter((p) => p.deployments.some((d) => d.status === "running")).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No active deployments.</p>
            ) : (
              <div className="space-y-3">
                {purchases.filter((p) => p.deployments.some((d) => d.status === "running")).map((p) => (
                  <Card key={p.id} className="glass">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></div>
                        <div>
                          <p className="text-sm font-medium">{p.productName}</p>
                          <p className="text-xs text-muted-foreground">{p.deployments.filter((d) => d.status === "running").length} active deployment{p.deployments.filter((d) => d.status === "running").length !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">Running</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="invoices" className="mt-4">
            <div className="glass rounded-xl py-8 text-center text-sm text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              Invoice history coming soon.
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
