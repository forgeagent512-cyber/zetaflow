"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Building2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { INDUSTRIES } from "@/types/cms";
import { useProductsStore } from "@/store/use-products-store";
import { cn } from "@/lib/utils";

const industryIcons: Record<string, string> = {
  "Real Estate": "🏠",
  "Healthcare": "🏥",
  "Education": "🎓",
  "Restaurants": "🍽️",
  "Construction": "🏗️",
  "Finance": "💰",
  "Insurance": "🛡️",
  "Travel": "✈️",
  "Legal": "⚖️",
  "Manufacturing": "🏭",
  "Retail": "🛍️",
  "Automotive": "🚗",
};

export function IndustryLibrary() {
  const [query, setQuery] = useState("");
  const products = useProductsStore((s) => s.products);
  const published = products.filter((p) => p.status === "published");

  const filtered = INDUSTRIES.filter((ind) =>
    ind.name.toLowerCase().includes(query.toLowerCase())
  ).map((ind) => ({
    ...ind,
    productCount: published.filter((p) => p.industry.includes(ind.name)).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Industry Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse AI solutions and templates by industry.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search industries..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 glass max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((industry) => (
          <Link key={industry.id} href={`/dashboard/automation-store?industry=${industry.name}`}>
            <Card className="glass group hover:border-primary/20 transition-all cursor-pointer h-full">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="text-3xl">{industryIcons[industry.name] || "🏢"}</div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">{industry.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{industry.description}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="secondary">{industry.productCount} Products</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
