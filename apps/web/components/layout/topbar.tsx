"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Command,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebarStore } from "@/store/use-sidebar";
import { useAuthStore } from "@/store/use-auth";
import { useRBAC } from "@/hooks/use-rbac";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const { openMobile, isCollapsed } = useSidebarStore();
  const { user, logout } = useAuthStore();
  const { isAdmin } = useRBAC();
  const [notifications] = useState(3);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-xl px-6 transition-all duration-300",
        isCollapsed ? "left-16" : "left-64"
      )}
    >
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={openMobile}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="font-medium text-foreground hover:text-primary transition-colors">
          {isAdmin() ? "Admin" : "BUILDAGENT"}
        </Link>
        <span>/</span>
        <span className="text-muted-foreground">
          {user?.organizationName || "Dashboard"}
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="hidden md:flex">
          <Command className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                  {notifications}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <span className="text-sm font-medium">Notifications</span>
              <Button variant="ghost" size="xs">Mark all read</Button>
            </div>
            <div className="py-2 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar || ""} alt={user?.fullName || "User"} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-3 px-2 py-2 border-b">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs">
                  {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.fullName || "User"}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </div>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
