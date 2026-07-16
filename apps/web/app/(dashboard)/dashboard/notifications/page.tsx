"use client";

import { useState } from "react";
import { Bell, CheckCheck, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";

const notifications = [
  { id: "1", title: "Deployment successful", message: "Customer Support AI v2.4.1 deployed successfully to production.", type: "success", read: false, createdAt: "2 min ago" },
  { id: "2", title: "New agent trained", message: "Lead Qualification Specialist completed training with 97% accuracy.", type: "info", read: false, createdAt: "15 min ago" },
  { id: "3", title: "Usage threshold reached", message: "You've used 80% of your monthly automation runs.", type: "warning", read: true, createdAt: "1 hour ago" },
  { id: "4", title: "Billing invoice ready", message: "Your June 2026 invoice is now available.", type: "info", read: true, createdAt: "1 day ago" },
  { id: "5", title: "Automation failed", message: "Email Follow-up Sequence encountered an error and was paused.", type: "error", read: true, createdAt: "2 days ago" },
];

const typeConfig = {
  success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  error: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
};

export default function NotificationsPage() {
  const [items, setItems] = useState(notifications);

  const markAllRead = () => {
    setItems(items.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Notifications"
          description="Stay updated with platform activity."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Notifications" },
          ]}
          actions={
            unreadCount > 0 ? (
              <Button variant="outline" size="sm" onClick={markAllRead}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all read
              </Button>
            ) : undefined
          }
        />

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No notifications</h3>
            <p className="text-sm text-muted-foreground">You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((notification) => {
              const config = typeConfig[notification.type as keyof typeof typeConfig];
              const Icon = config.icon;
              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                    !notification.read ? "bg-accent/50 border-accent" : "hover:bg-muted/30"
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bg} shrink-0`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium">{notification.title}</p>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.createdAt}</p>
                  </div>
                  <Button variant="ghost" size="icon-sm" className="shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
