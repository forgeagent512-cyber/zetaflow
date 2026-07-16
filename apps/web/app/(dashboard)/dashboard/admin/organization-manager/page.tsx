"use client";

import { useState } from "react";
import {
  Building2,
  Users,
  CreditCard,
  Shield,
  Search,
  ChevronRight,
  Activity,
  Calendar,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Organization {
  id: number;
  name: string;
  plan: string;
  users: number;
  status: "active" | "suspended" | "trial";
  createdAt: string;
  mrr: string;
}

const organizations: Organization[] = [
  { id: 1, name: "Acme Realty", plan: "Enterprise", users: 45, status: "active", createdAt: "2025-03-15", mrr: "$4,500" },
  { id: 2, name: "PropertyPro Inc.", plan: "Professional", users: 23, status: "active", createdAt: "2025-06-01", mrr: "$2,300" },
  { id: 3, name: "HomeFinders LLC", plan: "Starter", users: 8, status: "trial", createdAt: "2026-06-28", mrr: "$0" },
  { id: 4, name: "EstateVision", plan: "Enterprise", users: 67, status: "active", createdAt: "2024-11-20", mrr: "$5,900" },
  { id: 5, name: "SellSmart Agency", plan: "Professional", users: 15, status: "suspended", createdAt: "2025-09-10", mrr: "$0" },
  { id: 6, name: "Prime Properties", plan: "Starter", users: 5, status: "active", createdAt: "2026-04-01", mrr: "$499" },
  { id: 7, name: "Luxury Estates Co.", plan: "Enterprise", users: 89, status: "active", createdAt: "2024-08-05", mrr: "$7,200" },
  { id: 8, name: "CityScape Realty", plan: "Professional", users: 31, status: "active", createdAt: "2025-12-15", mrr: "$2,300" },
];

const orgStats = [
  { label: "Total Organizations", value: organizations.length.toString(), icon: Building2 },
  { label: "Active", value: organizations.filter((o) => o.status === "active").length.toString(), icon: Activity },
  { label: "Total Users", value: organizations.reduce((a, o) => a + o.users, 0).toString(), icon: Users },
  { label: "Total MRR", value: `$${organizations.filter((o) => o.status === "active").reduce((a, o) => a + parseInt(o.mrr.replace("$", "").replace(",", "")), 0).toLocaleString()}`, icon: CreditCard },
];

export default function OrganizationManagerPage() {
  const [search, setSearch] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  const filtered = organizations.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Organization Manager"
          description="Manage all client organizations."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Organizations" }]}
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {orgStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <StaggerItem key={stat.label}>
                <Card className="glass">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <span className="text-2xl font-bold">{stat.value}</span>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerWrapper>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Organizations</CardTitle>
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search organizations..."
                    className="max-w-xs"
                    icon={<Search className="h-4 w-4" />}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Plan</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Users</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">MRR</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((org) => (
                        <tr
                          key={org.id}
                          className={`border-b border-border/50 hover:bg-white/5 transition-colors cursor-pointer ${selectedOrg?.id === org.id ? "bg-white/10" : ""}`}
                          onClick={() => setSelectedOrg(org)}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{org.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={org.plan === "Enterprise" ? "default" : org.plan === "Professional" ? "secondary" : "outline"}>{org.plan}</Badge>
                          </td>
                          <td className="py-3 px-4">{org.users}</td>
                          <td className="py-3 px-4">
                            <Badge variant={org.status === "active" ? "success" : org.status === "trial" ? "warning" : "destructive"}>{org.status}</Badge>
                          </td>
                          <td className="py-3 px-4">{org.mrr}</td>
                          <td className="py-3 px-4 text-right">
                            <ChevronRight className="h-4 w-4 inline text-muted-foreground" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>{selectedOrg ? selectedOrg.name : "Select an organization"}</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedOrg ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-center">
                      <Building2 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <h3 className="font-semibold text-lg">{selectedOrg.name}</h3>
                      <Badge variant={selectedOrg.status === "active" ? "success" : "warning"} className="mt-1">{selectedOrg.status}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Plan</span>
                        <span className="font-medium">{selectedOrg.plan}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Users</span>
                        <span className="font-medium">{selectedOrg.users}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-border/50">
                        <span className="text-muted-foreground">MRR</span>
                        <span className="font-medium">{selectedOrg.mrr}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium">{selectedOrg.createdAt}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2">
                        <span className="text-muted-foreground">Avg. Per User</span>
                        <span className="font-medium">{selectedOrg.users > 0 ? `$${(parseInt(selectedOrg.mrr.replace("$", "").replace(",", "")) / selectedOrg.users).toFixed(0)}` : "-"}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="glass" size="sm" className="flex-1">Manage</Button>
                      <Button variant="outline" size="sm" className="flex-1">Contact</Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                    <Building2 className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-sm">Select an organization</p>
                    <p className="text-xs mt-1">to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
