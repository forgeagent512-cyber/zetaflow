"use client";

import { useState } from "react";
import {
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  RefreshCw,
  Save,
  Layout,
  Move,
  Layers,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useCMSStore } from "@/store/use-cms-store";
import type { CMSSection, SectionType } from "@/types/cms";

const sectionTypes: { type: SectionType; label: string; icon: string }[] = [
  { type: "hero", label: "Hero", icon: "Layout" },
  { type: "features", label: "Features", icon: "Layout" },
  { type: "pricing", label: "Pricing", icon: "Layout" },
  { type: "cards", label: "Cards", icon: "Layout" },
  { type: "cta", label: "CTA", icon: "Layout" },
  { type: "timeline", label: "Timeline", icon: "Layout" },
  { type: "stats", label: "Stats", icon: "Layout" },
  { type: "faq", label: "FAQ", icon: "Layout" },
  { type: "testimonials", label: "Testimonials", icon: "Layout" },
  { type: "video", label: "Video", icon: "Layout" },
  { type: "gallery", label: "Gallery", icon: "Layout" },
  { type: "partners", label: "Partners", icon: "Layout" },
  { type: "newsletter", label: "Newsletter", icon: "Layout" },
  { type: "contact-form", label: "Contact Form", icon: "Layout" },
  { type: "footer", label: "Footer", icon: "Layout" },
];

export function WebsiteBuilder() {
  const { pages, selectedPageId, updatePage, addPage, setSelectedPage, setIsDirty } = useCMSStore();
  const selectedPage = pages.find((p) => p.id === selectedPageId);
  const [activeTab, setActiveTab] = useState("sections");
  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");

  const createPage = () => {
    if (!pageTitle.trim()) {
      toast.error("Page title is required");
      return;
    }
    const newPage = {
      id: `page-${Date.now()}`,
      title: pageTitle,
      slug: pageSlug || pageTitle.toLowerCase().replace(/\s+/g, "-"),
      description: "",
      status: "draft" as const,
      sections: [],
      seo: { title: pageTitle, description: "", keywords: [], noIndex: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    addPage(newPage);
    setSelectedPage(newPage.id);
    setPageTitle("");
    setPageSlug("");
    toast.success("Page created");
  };

  const addSection = (type: SectionType) => {
    if (!selectedPageId) return;
    const section: CMSSection = {
      id: `section-${Date.now()}`,
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1).replace("-", " "),
      visible: true,
      order: selectedPage?.sections.length ?? 0,
      content: {},
      styles: { padding: "4rem 0", background: "transparent", backgroundColor: "transparent", textAlign: "center", maxWidth: "1280px", glassEffect: false },
    };
    updatePage(selectedPageId, { sections: [...(selectedPage?.sections || []), section] });
    setIsDirty(true);
    toast.success(`${section.label} section added`);
  };

  const removeSection = (sectionId: string) => {
    if (!selectedPageId) return;
    updatePage(selectedPageId, {
      sections: selectedPage?.sections.filter((s) => s.id !== sectionId) || [],
    });
    setIsDirty(true);
  };

  const toggleSection = (sectionId: string) => {
    if (!selectedPageId || !selectedPage) return;
    updatePage(selectedPageId, {
      sections: selectedPage.sections.map((s) =>
        s.id === sectionId ? { ...s, visible: !s.visible } : s
      ),
    });
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    if (!selectedPageId || !selectedPage) return;
    const sections = [...selectedPage.sections];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
    updatePage(selectedPageId, {
      sections: sections.map((s, i) => ({ ...s, order: i })),
    });
    setIsDirty(true);
  };

  if (!selectedPage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Website Builder</h2>
            <p className="text-sm text-muted-foreground">Create and manage your website pages</p>
          </div>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Create New Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Page Title</Label>
                <Input
                  placeholder="e.g. Our Features"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>URL Slug</Label>
                <Input
                  placeholder="e.g. features"
                  value={pageSlug}
                  onChange={(e) => setPageSlug(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={createPage}>
              <Plus className="mr-2 h-4 w-4" />
              Create Page
            </Button>
          </CardContent>
        </Card>

        {pages.length > 0 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Existing Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedPage(page.id)}
                  >
                    <div>
                      <p className="text-sm font-medium">{page.title}</p>
                      <p className="text-xs text-muted-foreground">/{page.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        page.status === "published" ? "bg-emerald-500/10 text-emerald-500" :
                        page.status === "draft" ? "bg-amber-500/10 text-amber-500" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {page.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{selectedPage.title}</h2>
            <p className="text-sm text-muted-foreground">/{selectedPage.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSelectedPage(null)}>
            <Layers className="mr-2 h-4 w-4" />
            All Pages
          </Button>
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save Page
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Layout className="h-4 w-4" /> Sections
          </TabsTrigger>
          <TabsTrigger value="add">
            <Plus className="mr-2 h-4 w-4" /> Add Block
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-3">
          {selectedPage.sections.length === 0 ? (
            <Card className="glass">
              <CardContent className="py-12 text-center">
                <Layout className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-1">No sections yet</p>
                <p className="text-sm text-muted-foreground mb-4">Start building your page by adding sections</p>
                <Button onClick={() => setActiveTab("add")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Section
                </Button>
              </CardContent>
            </Card>
          ) : (
            selectedPage.sections.map((section, index) => (
              <Card key={section.id} className="glass group">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <div>
                      <p className="text-sm font-medium">{section.label}</p>
                      <p className="text-xs text-muted-foreground">{section.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => moveSection(index, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => moveSection(index, "down")}
                      disabled={index === selectedPage.sections.length - 1}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => toggleSection(section.id)}>
                      {section.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon-sm">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeSection(section.id)}
                      className="hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="add">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Add Section Block</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {sectionTypes.map(({ type, label }) => (
                  <button
                    key={type}
                    onClick={() => addSection(type)}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-accent/50 transition-colors text-center"
                  >
                    <Layout className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
