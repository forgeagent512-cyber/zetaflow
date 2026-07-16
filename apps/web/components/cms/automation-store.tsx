"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, SlidersHorizontal, Grid3X3, List, ArrowUpDown, Sparkles, TrendingUp,
  Star, Clock, ArrowRight, Layout, Heart, ShoppingCart, Zap, Filter, X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductsStore } from "@/store/use-products-store";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { STORE_CATEGORIES, INDUSTRIES } from "@/types/cms";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

export function AutomationStore() {
  const {
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    selectedIndustry, setSelectedIndustry,
    viewMode, setViewMode,
  } = useProductsStore();
  const { favorites } = useWishlistStore();
  const [activeTab, setActiveTab] = useState<"all" | "featured" | "trending" | "popular" | "favorites">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "downloads" | "newest" | "price">("rating");
  const [loading, setLoading] = useState(false);

  const products = useProductsStore((s) => s.products);
  const getFeatured = useProductsStore((s) => s.getFeatured);
  const getTrending = useProductsStore((s) => s.getTrending);
  const getPopular = useProductsStore((s) => s.getPopular);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeTab === "featured") result = getFeatured();
    else if (activeTab === "trending") result = getTrending();
    else if (activeTab === "popular") result = getPopular();
    else if (activeTab === "favorites") result = products.filter((p) => favorites.includes(p.id));
    else result = products.filter((p) => p.status === "published");

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.industry.some((i) => i.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (selectedIndustry) {
      result = result.filter((p) => p.industry.includes(selectedIndustry));
    }

    if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "downloads") result.sort((a, b) => b.downloadCount - a.downloadCount);
    else if (sortBy === "newest") result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortBy === "price") result.sort((a, b) => (a.pricing.monthly || a.pricing.oneTime || 0) - (b.pricing.monthly || b.pricing.oneTime || 0));

    return result;
  }, [products, activeTab, searchQuery, selectedCategory, selectedIndustry, sortBy, favorites, getFeatured, getTrending, getPopular]);

  const featured = useMemo(() => getFeatured(), [getFeatured, products]);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <Badge variant="secondary" className="text-xs">AI Marketplace</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Automation Store</h1>
          <p className="text-muted-foreground max-w-xl">
            Browse, purchase, and deploy AI employees, agents, workflows, and industry solutions. Everything your business needs, one click away.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Badge variant="outline" className="text-xs gap-1">
              <ShoppingCart className="h-3 w-3" /> {products.filter((p) => p.status === "published").length} Products
            </Badge>
            <Badge variant="outline" className="text-xs gap-1">
              <Download className="h-3 w-3" /> {products.reduce((a, p) => a + p.downloadCount, 0).toLocaleString()} Downloads
            </Badge>
            <Badge variant="outline" className="text-xs gap-1">
              <Star className="h-3 w-3" /> {products.reduce((a, p) => a + p.reviewCount, 0).toLocaleString()} Reviews
            </Badge>
          </div>
        </div>
      </div>

      {featured.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <h2 className="text-lg font-semibold">Featured Products</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="glass">
              <TabsTrigger value="all" className="text-xs gap-1"><Layout className="h-3 w-3" /> All</TabsTrigger>
              <TabsTrigger value="featured" className="text-xs gap-1"><Star className="h-3 w-3" /> Featured</TabsTrigger>
              <TabsTrigger value="trending" className="text-xs gap-1"><TrendingUp className="h-3 w-3" /> Trending</TabsTrigger>
              <TabsTrigger value="popular" className="text-xs gap-1"><Zap className="h-3 w-3" /> Popular</TabsTrigger>
              <TabsTrigger value="favorites" className="text-xs gap-1">
                <Heart className="h-3 w-3" /> Favorites
                {favorites.length > 0 && <span className="ml-1">({favorites.length})</span>}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-3 w-3" /> Filters
            </Button>
            <div className="flex rounded-lg border overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={cn("p-1.5 transition-colors", viewMode === "grid" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                <Grid3X3 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn("p-1.5 transition-colors", viewMode === "list" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, categories, industries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 glass"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="rating">Highest Rated</option>
            <option value="downloads">Most Downloads</option>
            <option value="newest">Newest</option>
            <option value="price">Price: Low to High</option>
          </select>
        </div>

        {showFilters && (
          <div className="glass rounded-xl p-4 space-y-4">
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Category</h4>
              <div className="flex flex-wrap gap-1.5">
                <Badge
                  variant={selectedCategory === "" ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedCategory("")}
                >
                  All
                </Badge>
                {STORE_CATEGORIES.map((cat) => (
                  <Badge
                    key={cat.value}
                    variant={selectedCategory === cat.value ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => setSelectedCategory(cat.value === selectedCategory ? "" : cat.value)}
                  >
                    {cat.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Industry</h4>
              <div className="flex flex-wrap gap-1.5">
                <Badge
                  variant={selectedIndustry === "" ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedIndustry("")}
                >
                  All
                </Badge>
                {INDUSTRIES.map((ind) => (
                  <Badge
                    key={ind.id}
                    variant={selectedIndustry === ind.name ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => setSelectedIndustry(ind.name === selectedIndustry ? "" : ind.name)}
                  >
                    {ind.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="glass rounded-xl py-16 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-2xl bg-muted">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1">No products found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
          </div>
        ) : (
          <div className={cn(
            viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"
          )}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Download(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
}
