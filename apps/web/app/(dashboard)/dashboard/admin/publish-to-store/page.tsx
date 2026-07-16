"use client";

import { useState } from "react";
import { PageTransition } from "@/components/animations";
import { PublishToStore } from "@/components/cms";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function PublishToStorePage() {
  const [open, setOpen] = useState(false);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Publish to Store</h1>
            <p className="text-sm text-muted-foreground mt-1">Make your AI solutions available on the marketplace.</p>
          </div>
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Globe className="h-4 w-4" /> New Listing
          </Button>
        </div>
        <div className="glass rounded-xl py-16 text-center">
          <div className="p-4 rounded-2xl bg-muted inline-flex mb-4">
            <Globe className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Publish your project to the store</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Transform your custom AI project into a store product available to all BUILDAGENT users.
          </p>
          <Button onClick={() => setOpen(true)} className="mt-4">
            Publish New Product
          </Button>
        </div>
        <PublishToStore open={open} onClose={() => setOpen(false)} />
      </div>
    </PageTransition>
  );
}
