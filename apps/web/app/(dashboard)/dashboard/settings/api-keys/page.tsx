"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";
import { Plus, Copy, Trash2, Clock } from "lucide-react";

const apiKeys = [
  { id: "1", name: "Production", key: "ba_prod_a1b2c3d4e5f6g7h8i9j0", created: "2024-01-15", lastUsed: "2024-03-20", status: "active" },
  { id: "2", name: "Development", key: "ba_dev_k1l2m3n4o5p6q7r8s9t0", created: "2024-02-01", lastUsed: "2024-03-19", status: "active" },
  { id: "3", name: "Staging", key: "ba_stg_u1v2w3x4y5z6a7b8c9d0", created: "2024-03-01", lastUsed: "2024-03-15", status: "revoked" },
];

export default function ApiKeysSettingsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="API Keys"
          description="Manage API keys for programmatic access."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Settings", href: "/dashboard/settings" },
            { label: "API Keys" },
          ]}
        >
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Generate Key
          </Button>
        </PageHeader>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Your API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{key.name}</p>
                      <Badge variant={key.status === "active" ? "outline" : "secondary"}>
                        {key.status}
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">{key.key}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Created: {key.created}
                      </span>
                      <span>Last used: {key.lastUsed}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
