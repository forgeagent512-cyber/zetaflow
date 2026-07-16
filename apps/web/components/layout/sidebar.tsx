"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Folder,
  Users,
  Bot,
  Workflow,
  FileText,
  Rocket,
  BarChart3,
  CreditCard,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Search,
  HelpCircle,
  Bell,
  LifeBuoy,
  Store,
  Globe,
  ShoppingCart,
  DollarSign,
  Building,
  Palette,
  Image,
  Shield,
  Activity,
  Flag,
  Monitor,
  Sliders,
  PenSquare,
  BookOpen,
  Menu,
  ClipboardList,
  Megaphone,
  GitBranch,
  Wand,
  Cpu,
  Zap,
  Lock,
  Upload,
  Database,
  HardDrive,
  Code,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebarStore } from "@/store/use-sidebar";
import { useRBAC } from "@/hooks/use-rbac";
import { APP_NAME } from "@/config/constants";
import { dashboardNavigation, adminNavigation, clientNavigation } from "@/config/navigation";

const iconMap: Record<string, React.ElementType> = {
  "layout-dashboard": LayoutDashboard,
  folder: Folder,
  users: Users,
  bot: Bot,
  workflow: Workflow,
  "file-text": FileText,
  rocket: Rocket,
  "bar-chart-3": BarChart3,
  "credit-card": CreditCard,
  settings: Settings,
  bell: Bell,
  "life-buoy": LifeBuoy,
  globe: Globe,
  "shopping-cart": ShoppingCart,
  "dollar-sign": DollarSign,
  building: Building,
  palette: Palette,
  "help-circle": HelpCircle,
  shield: Shield,
  activity: Activity,
  flag: Flag,
  monitor: Monitor,
  sliders: Sliders,
  image: Image,
  "pen-square": PenSquare,
  "book-open": BookOpen,
  menu: Menu,
  "clipboard-list": ClipboardList,
  megaphone: Megaphone,
  "git-branch": GitBranch,
  wand: Wand,
  search: Search,
  code: Code,
  "hard-drive": HardDrive,
  key: Key,
  cpu: Cpu,
  zap: Zap,
  lock: Lock,
  upload: Upload,
  database: Database,
};

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebarStore();
  const { isAdmin } = useRBAC();

  const navigation = isAdmin() ? adminNavigation : clientNavigation;

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col border-r bg-background transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className={cn(
          "flex h-16 items-center border-b px-4",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <Link
              href={isAdmin() ? "/dashboard/admin" : "/dashboard"}
              className="flex items-center gap-2 font-bold text-lg tracking-tight"
              onClick={closeMobile}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                B
              </div>
              <span>{APP_NAME}</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href={isAdmin() ? "/dashboard/admin" : "/dashboard"} onClick={closeMobile}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                B
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleCollapse}
            className="hidden md:flex"
          >
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className={cn("p-2", isCollapsed && "px-1")}>
          <div className="relative">
            {!isCollapsed && (
              <>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search..."
                  className="h-9 w-full rounded-lg border border-input bg-transparent pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 px-2">
          <nav className={cn("space-y-1 py-2", isCollapsed && "px-0")}>
            {navigation.map((item) => {
              const Icon = iconMap[item.icon] || HelpCircle;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                  {!isCollapsed && item.badge && (
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return link;
            })}
          </nav>
        </ScrollArea>

        <div className={cn("border-t p-3", isCollapsed && "p-2")}>
          {!isCollapsed && isAdmin() && (
            <Link href="/dashboard">
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Switch to Client View
              </button>
            </Link>
          )}
          {!isCollapsed && !isAdmin() && (
            <div className="text-xs text-muted-foreground px-3 py-2">
              Client Workspace
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
