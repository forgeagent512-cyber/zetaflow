"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star, Download, Clock, BarChart3, Heart, ShoppingCart, Check, Shield,
  Sparkles, Zap, Users, ArrowLeft, ChevronRight, ChevronLeft, Play,
  ExternalLink, Globe, Package, Layers, Puzzle, ListChecks, Wrench,
  BookOpen, MessageSquare, Tag, DollarSign, Server,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProductsStore } from "@/store/use-products-store";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { usePurchasesStore } from "@/store/use-purchases-store";
import { useReviewsStore } from "@/store/use-reviews-store";
import { InstallFlow } from "./install-flow";
import { ReviewsSection } from "./reviews-section";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";
import type { StoreProduct } from "@/types/cms";

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  advanced: "bg-red-500/10 text-red-500 border-red-500/20",
  expert: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

interface ProductDetailsProps {
  product: StoreProduct;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [showInstall, setShowInstall] = useState(false);
  const { isFavorite, toggleFavorite } = useWishlistStore();
  const { getPurchase } = usePurchasesStore();
  const { getReviewsByProduct, getAverageRating } = useReviewsStore();
  const reviews = getReviewsByProduct(product.id);
  const avgRating = getAverageRating(product.id);
  const purchased = !!getPurchase(product.id);
  const relatedProducts = useProductsStore((s) =>
    s.products.filter((p) => p.id !== product.id && (p.category === product.category || p.industry.some((i) => product.industry.includes(i))) && p.status === "published")
  ).slice(0, 4);

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/automation-store"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Store
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border group">
            <div className="aspect-video flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              <div className="w-24 h-24 rounded-3xl bg-background/80 backdrop-blur-sm flex items-center justify-center text-4xl font-bold text-primary">
                {product.name.charAt(0)}
              </div>
              {product.media.video && (
                <button className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm text-xs font-medium hover:bg-background transition-colors">
                  <Play className="h-3.5 w-3.5" /> Watch Demo
                </button>
              )}
            </div>
            {product.media.screenshots.length > 0 && (
              <div className="flex items-center gap-2 p-3 border-t overflow-x-auto">
                {product.media.screenshots.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={cn(
                      "shrink-0 w-16 h-10 rounded-lg border-2 transition-all",
                      currentImage === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <div className="w-full h-full rounded-lg bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                      Screenshot {i + 1}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground mt-1">{product.tagline}</p>
            <div className="flex items-center gap-3 mt-3 text-sm">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <strong>{product.rating}</strong>
                <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
              </span>
              <span className="text-muted-foreground">|</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Download className="h-3.5 w-3.5" /> {product.downloadCount.toLocaleString()} downloads
              </span>
              <span className="text-muted-foreground">|</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Tag className="h-3.5 w-3.5" /> v{product.version}
              </span>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="glass w-full justify-start overflow-x-auto">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="features" className="text-xs">Features</TabsTrigger>
              <TabsTrigger value="integrations" className="text-xs">Integrations</TabsTrigger>
              <TabsTrigger value="pricing" className="text-xs">Pricing</TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs">Reviews ({reviews.length})</TabsTrigger>
              <TabsTrigger value="faq" className="text-xs">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">About {product.name}</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              {product.modules.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" /> Modules
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.modules.map((mod, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-accent/50 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {mod}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.requirements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-primary" /> Requirements
                  </h3>
                  <ul className="space-y-1.5">
                    {product.requirements.map((req, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl glass">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{feat}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="mt-6 space-y-6">
              {product.integrations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Puzzle className="h-4 w-4 text-primary" /> Integrations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.integrations.map((int, i) => (
                      <Badge key={i} variant="outline" className="text-xs py-1.5">
                        {int}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {product.supportedApps.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" /> Supported Apps
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.supportedApps.map((app, i) => (
                      <Badge key={i} variant="secondary" className="text-xs py-1.5">
                        {app}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pricing" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {product.pricing.monthly && (
                  <Card className="glass relative overflow-hidden">
                    {product.pricing.monthly < 200 && (
                      <div className="absolute top-0 right-0">
                        <Badge className="rounded-bl-lg rounded-tr-xl text-[10px] bg-emerald-500">Popular</Badge>
                      </div>
                    )}
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly</p>
                        <p className="text-3xl font-bold">${product.pricing.monthly}</p>
                        <p className="text-xs text-muted-foreground">per month</p>
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-xs"><Check className="h-3 w-3 text-emerald-500" /> Full access</li>
                        <li className="flex items-center gap-2 text-xs"><Check className="h-3 w-3 text-emerald-500" /> Updates included</li>
                        <li className="flex items-center gap-2 text-xs"><Check className="h-3 w-3 text-emerald-500" /> Support included</li>
                      </ul>
                      <Button className="w-full" size="sm" onClick={() => setShowInstall(true)}>
                        Subscribe Monthly
                      </Button>
                    </CardContent>
                  </Card>
                )}
                {product.pricing.yearly && (
                  <Card className="glass relative overflow-hidden border-primary/30">
                    <div className="absolute top-0 right-0">
                      <Badge className="rounded-bl-lg rounded-tr-xl text-[10px] bg-primary">Best Value</Badge>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Yearly</p>
                        <p className="text-3xl font-bold">${product.pricing.yearly}</p>
                        <p className="text-xs text-muted-foreground">
                          ${Math.round(product.pricing.yearly / 12)}/mo — Save {product.pricing.monthly ? Math.round((1 - product.pricing.yearly / 12 / product.pricing.monthly) * 100) : 0}%
                        </p>
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-xs"><Check className="h-3 w-3 text-emerald-500" /> Everything in Monthly</li>
                        <li className="flex items-center gap-2 text-xs"><Check className="h-3 w-3 text-emerald-500" /> 2 months free</li>
                        <li className="flex items-center gap-2 text-xs"><Check className="h-3 w-3 text-emerald-500" /> Priority support</li>
                      </ul>
                      <Button className="w-full" size="sm" onClick={() => setShowInstall(true)}>
                        Subscribe Yearly
                      </Button>
                    </CardContent>
                  </Card>
                )}
                {product.pricing.oneTime && (
                  <Card className="glass">
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">One-Time</p>
                        <p className="text-3xl font-bold">${product.pricing.oneTime}</p>
                        <p className="text-xs text-muted-foreground">pay once, use forever</p>
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-xs"><Check className="h-3 w-3 text-emerald-500" /> Lifetime access</li>
                        <li className="flex items-center gap-2 text-xs"><Check className="h-3 w-3 text-emerald-500" /> 1 year updates</li>
                        <li className="flex items-center gap-2 text-xs"><Check className="h-3 w-3 text-emerald-500" /> Standard support</li>
                      </ul>
                      <Button className="w-full" size="sm" onClick={() => setShowInstall(true)}>
                        Purchase
                      </Button>
                    </CardContent>
                  </Card>
                )}
                {product.pricing.enterpriseQuote && (
                  <Card className="glass bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Enterprise</p>
                        <p className="text-3xl font-bold">Custom</p>
                        <p className="text-xs text-muted-foreground">tailored to your needs</p>
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-xs"><Check className="h-3 w-3 text-emerald-500" /> Custom deployment</li>
                        <li className="flex items-center gap-2 text-xs"><Check className="h-3 w-3 text-emerald-500" /> Dedicated support</li>
                        <li className="flex items-center gap-2 text-xs"><Check className="h-3 w-3 text-emerald-500" /> SLA guarantee</li>
                      </ul>
                      <Button variant="outline" className="w-full" size="sm">
                        Contact Sales
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Maintenance: ${product.pricing.maintenance}/mo • All prices in {product.pricing.currency}
              </p>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <ReviewsSection productId={product.id} />
            </TabsContent>

            <TabsContent value="faq" className="mt-6">
              <div className="space-y-3">
                {[
                  { q: "What is the setup time?", a: product.setupTime },
                  { q: "What are the system requirements?", a: product.requirements.join(", ") },
                  { q: "Can I cancel my subscription?", a: "Yes, you can cancel anytime. Your access continues until the end of your billing period." },
                  { q: "Is there a money-back guarantee?", a: "We offer a 14-day money-back guarantee on all products. Contact support for a full refund." },
                  { q: "How does deployment work?", a: "After purchase, our one-click install system automatically deploys the product to your environment. You'll receive configuration instructions via email." },
                ].map((faq, i) => (
                  <details key={i} className="group glass rounded-xl">
                    <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium">
                      {faq.q}
                      <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="px-4 pb-4 text-sm text-muted-foreground">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card className="glass sticky top-24">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                {product.pricing.monthly ? (
                  <>
                    <span className="text-3xl font-bold">${product.pricing.monthly}</span>
                    <span className="text-muted-foreground">/month</span>
                  </>
                ) : product.pricing.oneTime ? (
                  <>
                    <span className="text-3xl font-bold">${product.pricing.oneTime}</span>
                    <span className="text-muted-foreground"> once</span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-primary">Custom Pricing</span>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  + ${product.pricing.maintenance}/mo maintenance
                </p>
              </div>

              {!purchased ? (
                <Button className="w-full gap-2" size="lg" onClick={() => setShowInstall(true)}>
                  <ShoppingCart className="h-4 w-4" /> Install {product.name}
                </Button>
              ) : (
                <Button className="w-full gap-2" size="lg" variant="secondary" disabled>
                  <Check className="h-4 w-4" /> Already Installed
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full gap-2"
                size="lg"
                onClick={() => toggleFavorite(product.id)}
              >
                <Heart className={cn("h-4 w-4", isFavorite(product.id) && "fill-red-500 text-red-500")} />
                {isFavorite(product.id) ? "Saved to Favorites" : "Add to Favorites"}
              </Button>

              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Star className="h-3.5 w-3.5" /> Rating</span>
                  <span className="font-medium">{product.rating} / 5</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Download className="h-3.5 w-3.5" /> Downloads</span>
                  <span className="font-medium">{product.downloadCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Setup Time</span>
                  <span className="font-medium">{product.setupTime}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Difficulty</span>
                  <Badge variant="outline" className={cn("text-[10px]", difficultyColors[product.difficulty])}>
                    {product.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Server className="h-3.5 w-3.5" /> AI Cost</span>
                  <span className="font-medium text-xs">{product.estimatedAICost}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> Version</span>
                  <span className="font-medium">v{product.version}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> License</span>
                  <span className="font-medium text-xs capitalize">{product.license.replace("-", " ")}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Developer</span>
                  <span className="font-medium text-xs">{product.developer}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Related Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {showInstall && (
        <InstallFlow product={product} open={showInstall} onClose={() => setShowInstall(false)} />
      )}
    </div>
  );
}
