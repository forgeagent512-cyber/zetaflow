"use client";

import Link from "next/link";
import { Heart, Trash2, Eye, ShoppingCart, Star, Download, GitCompare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { useProductsStore } from "@/store/use-products-store";
import { cn } from "@/lib/utils";

export function WishlistPage() {
  const { favorites, removeFavorite, compare, removeFromCompare, clearCompare, recentlyViewed, clearRecentlyViewed } = useWishlistStore();
  const products = useProductsStore((s) => s.products);
  const favoriteProducts = products.filter((p) => favorites.includes(p.id));
  const compareProducts = products.filter((p) => compare.includes(p.id));
  const recentProducts = products.filter((p) => recentlyViewed.includes(p.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Favorites</h1>
        <p className="text-sm text-muted-foreground mt-1">{favoriteProducts.length} saved products</p>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="glass rounded-xl py-16 text-center">
          <div className="p-4 rounded-2xl bg-muted inline-flex mb-4">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No favorites yet</h3>
          <p className="text-sm text-muted-foreground">Browse the store and save products you like.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/automation-store">Browse Store</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteProducts.map((product) => (
            <Card key={product.id} className="glass group">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-lg font-bold text-primary">
                      {product.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{product.name}</h3>
                      <p className="text-xs text-muted-foreground">{product.tagline}</p>
                    </div>
                  </div>
                  <button onClick={() => removeFavorite(product.id)} className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-500 text-amber-500" />{product.rating}</span>
                  <span className="flex items-center gap-1"><Download className="h-3 w-3" />{product.downloadCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1">
                    <Link href={`/dashboard/automation-store/${product.slug}`}><Eye className="h-3 w-3" /> View</Link>
                  </Button>
                  <Button size="sm" className="h-7 text-xs gap-1">
                    <ShoppingCart className="h-3 w-3" /> Install
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {compareProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <GitCompare className="h-4 w-4 text-primary" /> Compare ({compareProducts.length})
            </h2>
            <Button variant="ghost" size="sm" className="text-xs" onClick={clearCompare}>Clear All</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {compareProducts.map((product) => (
              <Card key={product.id} className="glass">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-semibold">{product.name}</h3>
                    <button onClick={() => removeFromCompare(product.id)}><X className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Rating</span><span>{product.rating}/5</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Price</span><span>${product.pricing.monthly || product.pricing.oneTime || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Difficulty</span><span className="capitalize">{product.difficulty}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Setup</span><span>{product.setupTime}</span></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {recentProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recently Viewed</h2>
            <Button variant="ghost" size="sm" className="text-xs" onClick={clearRecentlyViewed}>Clear</Button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentProducts.slice(0, 8).map((product) => (
              <Link key={product.id} href={`/dashboard/automation-store/${product.slug}`}>
                <Card className="glass shrink-0 w-44 hover:border-primary/20 transition-all">
                  <CardContent className="p-3 space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-sm font-bold text-primary">
                      {product.name.charAt(0)}
                    </div>
                    <p className="text-xs font-medium truncate">{product.name}</p>
                    <p className="text-[10px] text-muted-foreground">${product.pricing.monthly || product.pricing.oneTime || "—"}/mo</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
