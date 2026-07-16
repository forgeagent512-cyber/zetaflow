"use client";

import { useState } from "react";
import {
  Search, Eye, EyeOff, Star, DollarSign, Clock, Archive, Trash2,
  RefreshCw, Bell, Check, X, ToggleLeft, ToggleRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProductsStore } from "@/store/use-products-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function AdminControls() {
  const { products, updateProduct, deleteProduct, setSelectedCategory } = useProductsStore();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<string>("all");

  const filtered = products.filter((p) => {
    if (tab === "published") return p.status === "published";
    if (tab === "draft") return p.status === "draft";
    if (tab === "archived") return p.status === "archived";
    if (tab === "featured") return p.featured;
    if (tab === "hidden") return p.status === "hidden";
    return true;
  }).filter((p) => !query || p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Store Administration</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} total products</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="glass">
          <TabsTrigger value="all" className="text-xs">All ({products.length})</TabsTrigger>
          <TabsTrigger value="published" className="text-xs">Published</TabsTrigger>
          <TabsTrigger value="draft" className="text-xs">Draft</TabsTrigger>
          <TabsTrigger value="featured" className="text-xs">Featured</TabsTrigger>
          <TabsTrigger value="hidden" className="text-xs">Hidden</TabsTrigger>
          <TabsTrigger value="archived" className="text-xs">Archived</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search products..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 glass max-w-md" />
      </div>

      <div className="space-y-2">
        {filtered.map((product) => (
          <Card key={product.id} className="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                    {product.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold truncate">{product.name}</h3>
                      <Badge variant={product.status === "published" ? "default" : product.status === "draft" ? "secondary" : "outline"} className="text-[10px] capitalize">
                        {product.status}
                      </Badge>
                      {product.featured && <Badge className="text-[10px] bg-amber-500">Featured</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{product.tagline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => updateProduct(product.id, { featured: !product.featured })}
                    className={cn("p-1.5 rounded-lg transition-colors", product.featured ? "text-amber-500 hover:bg-amber-500/10" : "text-muted-foreground hover:text-amber-500 hover:bg-accent")}
                    title={product.featured ? "Remove featured" : "Feature product"}
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      const newStatus = product.status === "hidden" ? "published" : "hidden";
                      updateProduct(product.id, { status: newStatus });
                      toast.success(newStatus === "hidden" ? "Product hidden" : "Product visible");
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title={product.status === "hidden" ? "Show product" : "Hide product"}
                  >
                    {product.status === "hidden" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      updateProduct(product.id, { status: product.status === "published" ? "draft" : "published" });
                      toast.success(product.status === "published" ? "Product unpublished" : "Product published");
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Toggle publish"
                  >
                    {product.status === "published" ? <ToggleRight className="h-3.5 w-3.5 text-emerald-500" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => updateProduct(product.id, { status: "archived" })}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Archive"
                  >
                    <Archive className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => { deleteProduct(product.id); toast.success("Product deleted"); }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
