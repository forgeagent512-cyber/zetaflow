"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Star, Download, Clock, BarChart3, ShoppingCart, Eye, GitBranch, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StoreProduct } from "@/types/cms";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { usePurchasesStore } from "@/store/use-purchases-store";

const categoryGradients: Record<string, string> = {
  "ai-employees": "from-violet-500/20 to-purple-500/20",
  "ai-agents": "from-blue-500/20 to-cyan-500/20",
  "ai-workflows": "from-emerald-500/20 to-teal-500/20",
  "automation-templates": "from-amber-500/20 to-orange-500/20",
  "industry-packs": "from-rose-500/20 to-pink-500/20",
  "business-packs": "from-indigo-500/20 to-blue-500/20",
  "voice-ai": "from-sky-500/20 to-violet-500/20",
  "chat-ai": "from-green-500/20 to-emerald-500/20",
  "email-ai": "from-red-500/20 to-rose-500/20",
  "marketing-ai": "from-fuchsia-500/20 to-pink-500/20",
  "sales-ai": "from-amber-500/20 to-yellow-500/20",
  "hr-ai": "from-cyan-500/20 to-sky-500/20",
  "finance-ai": "from-lime-500/20 to-green-500/20",
  "customer-support-ai": "from-teal-500/20 to-emerald-500/20",
  "knowledge-bases": "from-slate-500/20 to-gray-500/20",
  "prompt-packs": "from-orange-500/20 to-red-500/20",
  "mcp-servers": "from-purple-500/20 to-violet-500/20",
  integrations: "from-blue-500/20 to-indigo-500/20",
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-500",
  intermediate: "bg-amber-500/10 text-amber-500",
  advanced: "bg-red-500/10 text-red-500",
  expert: "bg-purple-500/10 text-purple-500",
};

interface ProductCardProps {
  product: StoreProduct;
  viewMode?: "grid" | "list";
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isFavorite, toggleFavorite } = useWishlistStore();
  const { getPurchase } = usePurchasesStore();
  const purchased = !!getPurchase(product.id);
  const gradient = categoryGradients[product.category] || "from-gray-500/20 to-gray-500/20";

  if (viewMode === "list") {
    return (
      <Card
        className="glass group relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex gap-4 p-4">
          <div className={cn("w-20 h-20 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0", gradient)}>
            <div className="w-10 h-10 rounded-lg bg-background/80 flex items-center justify-center text-lg font-bold text-primary">
              {product.name.charAt(0)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold truncate">{product.name}</h3>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{product.version}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{product.tagline}</p>
              </div>
              <button
                onClick={(e) => { e.preventDefault(); toggleFavorite(product.id); }}
                className="shrink-0 p-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                <Heart className={cn("h-3.5 w-3.5", isFavorite(product.id) ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
              </button>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-500 text-amber-500" />{product.rating}</span>
              <span className="flex items-center gap-1"><Download className="h-3 w-3" />{product.downloadCount.toLocaleString()}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{product.setupTime}</span>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-2">
            <div className="text-right">
              {product.pricing.monthly ? (
                <>
                  <span className="text-lg font-bold">${product.pricing.monthly}</span>
                  <span className="text-xs text-muted-foreground">/mo</span>
                </>
              ) : product.pricing.oneTime ? (
                <>
                  <span className="text-lg font-bold">${product.pricing.oneTime}</span>
                  <span className="text-xs text-muted-foreground"> once</span>
                </>
              ) : (
                <span className="text-sm font-medium text-primary">Contact Us</span>
              )}
            </div>
            <div className="flex gap-1.5">
              <Link href={`/dashboard/automation-store/${product.slug}`}>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                  <Eye className="h-3 w-3" /> Details
                </Button>
              </Link>
              {!purchased && (
                <Button size="sm" className="h-7 text-xs gap-1">
                  <ShoppingCart className="h-3 w-3" /> Install
                </Button>
              )}
              {purchased && (
                <Badge variant="secondary" className="h-7 text-xs gap-1">
                  <Check className="h-3 w-3" /> Owned
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Link href={`/dashboard/automation-store/${product.slug}`}>
      <Card
        className="glass group relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 h-full cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn("relative h-36 bg-gradient-to-br flex items-center justify-center overflow-hidden", gradient)}>
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 transition-opacity duration-300",
            isHovered && "opacity-100"
          )} />
          <div className={cn(
            "w-16 h-16 rounded-2xl bg-background/80 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-primary transition-all duration-500",
            isHovered && "scale-110 rotate-3"
          )}>
            {product.name.charAt(0)}
          </div>
          {product.featured && (
            <Badge className="absolute top-2 left-2 text-[10px] bg-primary/90 hover:bg-primary">
              Featured
            </Badge>
          )}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(product.id); }}
            className={cn(
              "absolute top-2 right-2 p-1.5 rounded-lg transition-all duration-300",
              isFavorite(product.id) ? "bg-red-500/20 text-red-500" : "bg-background/40 text-muted-foreground opacity-0 group-hover:opacity-100"
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", isFavorite(product.id) && "fill-red-500")} />
          </button>
        </div>
        <CardContent className="p-4 space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold truncate">{product.name}</h3>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">{product.version}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.tagline}</p>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-500 text-amber-500" />{product.rating}</span>
            <span className="flex items-center gap-1"><Download className="h-3 w-3" />{product.downloadCount.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", difficultyColors[product.difficulty])}>
              <BarChart3 className="h-2.5 w-2.5 mr-0.5" />
              {product.difficulty}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              <Clock className="h-2.5 w-2.5 mr-0.5" />
              {product.setupTime}
            </Badge>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              {product.pricing.monthly ? (
                <>
                  <span className="text-sm font-bold">${product.pricing.monthly}</span>
                  <span className="text-xs text-muted-foreground">/mo</span>
                </>
              ) : product.pricing.oneTime ? (
                <>
                  <span className="text-sm font-bold">${product.pricing.oneTime}</span>
                  <span className="text-xs text-muted-foreground"> once</span>
                </>
              ) : (
                <span className="text-xs font-medium text-primary">Contact Us</span>
              )}
            </div>
            {!purchased ? (
              <div className="flex gap-1">
                <Button size="sm" className="h-7 text-xs gap-1">
                  <ShoppingCart className="h-3 w-3" /> Install
                </Button>
              </div>
            ) : (
              <Badge variant="secondary" className="text-xs gap-1">
                <Check className="h-3 w-3" /> Owned
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
