"use client";

import { useState } from "react";
import {
  Plus,
  GripVertical,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Menu,
  PanelBottom,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavStore } from "@/store/use-nav-store";
import type { NavItem } from "@/types/cms";

export function NavBuilder() {
  const { navItems, footer, addNavItem, updateNavItem, deleteNavItem, reorderNavItems, updateFooter } = useNavStore();
  const [activeTab, setActiveTab] = useState("navbar");
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);

  const addItem = () => {
    const newItem: NavItem = {
      id: `nav-${Date.now()}`,
      label: "New Link",
      href: "/",
      order: navItems.length,
      visible: true,
      roles: ["public"],
      children: [],
      megaMenu: false,
    };
    addNavItem(newItem);
    toast.success("Navigation item added");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Navigation Builder</h2>
          <p className="text-sm text-muted-foreground">Manage navigation menus and footer</p>
        </div>
        <Button size="sm">
          <Save className="mr-2 h-4 w-4" />
          Save Navigation
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="navbar" className="flex items-center gap-2">
            <Menu className="h-4 w-4" /> Navbar
          </TabsTrigger>
          <TabsTrigger value="footer" className="flex items-center gap-2">
            <PanelBottom className="h-4 w-4" /> Footer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="navbar" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Navigation Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {navItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border group">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{item.label}</p>
                      {!item.visible && (
                        <span className="text-xs text-muted-foreground">(hidden)</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.href}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Switch
                      checked={item.visible}
                      onCheckedChange={(v) => updateNavItem(item.id, { visible: v })}
                    />
                    <Button variant="ghost" size="icon-sm" onClick={() => setEditingItem(item)}>
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => { deleteNavItem(item.id); toast.success("Deleted"); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-2" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </CardContent>
          </Card>

          {editingItem && (
            <Card className="glass">
              <CardHeader>
                <CardTitle>Edit: {editingItem.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input
                      value={editingItem.label}
                      onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Href</Label>
                    <Input
                      value={editingItem.href}
                      onChange={(e) => setEditingItem({ ...editingItem, href: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingItem.visible}
                      onCheckedChange={(v) => setEditingItem({ ...editingItem, visible: v })}
                    />
                    <Label className="text-sm">Visible</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingItem.megaMenu}
                      onCheckedChange={(v) => setEditingItem({ ...editingItem, megaMenu: v })}
                    />
                    <Label className="text-sm">Mega Menu</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingItem(null)}>Close</Button>
                  <Button onClick={() => {
                    updateNavItem(editingItem.id, editingItem);
                    setEditingItem(null);
                    toast.success("Updated");
                  }}>Save</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Footer Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Bottom Text</Label>
                <Input
                  value={footer.bottomText}
                  onChange={(e) => updateFooter({ bottomText: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={footer.showSocialIcons}
                    onCheckedChange={(v) => updateFooter({ showSocialIcons: v })}
                  />
                  <Label className="text-sm">Show Social Icons</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={footer.showNewsletter}
                    onCheckedChange={(v) => updateFooter({ showNewsletter: v })}
                  />
                  <Label className="text-sm">Show Newsletter</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
