"use client";

import { useState } from "react";
import { Globe, Upload, Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useProductsStore } from "@/store/use-products-store";
import { STORE_CATEGORIES, INDUSTRIES } from "@/types/cms";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PublishToStoreProps {
  open: boolean;
  onClose: () => void;
}

export function PublishToStore({ open, onClose }: PublishToStoreProps) {
  const [step, setStep] = useState<"details" | "confirm" | "success">("details");
  const { addProduct } = useProductsStore();
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    category: "ai-agents" as string,
    industry: [] as string[],
    version: "1.0.0",
    monthlyPrice: "",
    oneTimePrice: "",
  });

  const handleSubmit = () => {
    const product = {
      id: `product-${Date.now()}`,
      name: form.name,
      slug: form.name.toLowerCase().replace(/\s+/g, "-"),
      tagline: form.tagline,
      description: form.description,
      category: form.category as any,
      subcategory: "",
      industry: form.industry,
      pricing: {
        monthly: form.monthlyPrice ? Number(form.monthlyPrice) : undefined,
        oneTime: form.oneTimePrice ? Number(form.oneTimePrice) : undefined,
        enterpriseQuote: true,
        customQuote: false,
        maintenance: 0,
        currency: "USD",
      },
      license: "single-company" as const,
      media: { image: "", icon: "", screenshots: [] },
      features: [],
      modules: [],
      integrations: [],
      supportedApps: [],
      requirements: [],
      version: form.version,
      rating: 0,
      reviewCount: 0,
      downloadCount: 0,
      difficulty: "intermediate" as const,
      setupTime: "15 minutes",
      estimatedAICost: "TBD",
      developer: "You",
      status: "draft" as const,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addProduct(product);
    setStep("success");
    toast.success("Product published to store!");
  };

  const toggleIndustry = (ind: string) => {
    setForm((f) => ({
      ...f,
      industry: f.industry.includes(ind) ? f.industry.filter((i) => i !== ind) : [...f.industry, ind],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); setTimeout(() => setStep("details"), 300); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Publish to Store
          </DialogTitle>
          <DialogDescription>Make your project available to everyone on the BUILDAGENT marketplace.</DialogDescription>
        </DialogHeader>

        {step === "details" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Product Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="My AI Solution" className="glass" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tagline</Label>
              <Input value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} placeholder="Short description..." className="glass" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="glass" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs">
                  {STORE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Version</Label>
                <Input value={form.version} onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))} className="glass" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Industries</Label>
              <div className="flex flex-wrap gap-1.5">
                {INDUSTRIES.map((ind) => (
                  <Badge key={ind.id} variant={form.industry.includes(ind.name) ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => toggleIndustry(ind.name)}>
                    {ind.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Monthly Price ($)</Label>
                <Input type="number" value={form.monthlyPrice} onChange={(e) => setForm((f) => ({ ...f, monthlyPrice: e.target.value }))} placeholder="299" className="glass" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">One-Time Price ($)</Label>
                <Input type="number" value={form.oneTimePrice} onChange={(e) => setForm((f) => ({ ...f, oneTimePrice: e.target.value }))} placeholder="1499" className="glass" />
              </div>
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={!form.name || !form.description}>
              <Upload className="h-4 w-4 mr-2" /> Publish to Store
            </Button>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Published Successfully!</h3>
              <p className="text-sm text-muted-foreground mt-1">Your product is now live on the Automation Store as a draft. An admin will review it shortly.</p>
            </div>
            <Button onClick={onClose}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
