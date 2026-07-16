"use client";

import { useState } from "react";
import { History, ArrowLeft, ArrowRight, RefreshCw, Clock, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCMSStore } from "@/store/use-cms-store";

export function VersionControl() {
  const { versions, pages } = useCMSStore();
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const recentVersions = versions.slice(-20).reverse();

  const handleRollback = (versionId: string) => {
    setSelectedVersion(versionId);
    toast.success("Rolled back to selected version");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Version Control</h2>
          <p className="text-sm text-muted-foreground">{versions.length} total versions across {pages.length} pages</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Versions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{versions.length}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pages Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pages.length}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Latest Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {recentVersions.length > 0
                ? new Date(recentVersions[0].createdAt).toLocaleDateString()
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Version History</CardTitle>
        </CardHeader>
        <CardContent>
          {recentVersions.length === 0 ? (
            <div className="py-12 text-center">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-1">No version history</p>
              <p className="text-sm text-muted-foreground">Changes will be tracked automatically</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentVersions.map((version, i) => (
                <div
                  key={version.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    selectedVersion === version.id ? "border-primary bg-primary/5" : "hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">v{version.version}</p>
                        <Badge variant="secondary" className="text-xs">{version.entityType}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {version.notes || "No description"} · {new Date(version.createdAt).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">by {version.author}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRollback(version.id)}
                    >
                      <RotateCcw className="mr-1 h-3.5 w-3.5" />
                      Rollback
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
