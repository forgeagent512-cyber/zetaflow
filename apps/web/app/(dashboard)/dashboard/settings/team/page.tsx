"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";
import { Plus, Mail, Shield, UserMinus } from "lucide-react";

const teamMembers = [
  { id: "1", name: "John Doe", email: "john@company.com", role: "Admin", status: "active" },
  { id: "2", name: "Jane Smith", email: "jane@company.com", role: "Manager", status: "active" },
  { id: "3", name: "Bob Wilson", email: "bob@company.com", role: "Member", status: "invited" },
];

export default function TeamSettingsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Team Management"
          description="Manage your team members and their roles."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Settings", href: "/dashboard/settings" },
            { label: "Team" },
          ]}
        >
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Invite Member
          </Button>
        </PageHeader>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Team Members ({teamMembers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={member.role === "Admin" ? "default" : "secondary"}>
                      <Shield className="h-3 w-3 mr-1" /> {member.role}
                    </Badge>
                    <Badge variant={member.status === "active" ? "outline" : "secondary"}>
                      {member.status}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <UserMinus className="h-4 w-4" />
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
