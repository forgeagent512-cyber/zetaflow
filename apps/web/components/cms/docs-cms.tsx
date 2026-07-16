"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  BookOpen,
  Edit3,
  Trash2,
  Save,
  Eye,
  History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useDocsStore } from "@/store/use-docs-store";
import type { DocPage } from "@/types/cms";

export function DocsCMS() {
  const { pages, categories, addPage, updatePage, deletePage, selectedPageId, setSelectedPage, addCategory, addVersion } = useDocsStore();
  const selectedPage = pages.find((p) => p.id === selectedPageId);
  const [activeTab, setActiveTab] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [content, setContent] = useState("");

  const filteredPages = pages.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createPage = () => {
    const newPage: DocPage = {
      id: `doc-${Date.now()}`,
      title: "New Documentation Page",
      slug: `new-doc-${Date.now()}`,
      content: "",
      category: "general",
      order: pages.length,
      status: "draft",
      version: 1,
      versionHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addPage(newPage);
    setSelectedPage(newPage.id);
    setActiveTab("editor");
    setContent("");
    toast.success("Doc page created");
  };

  const savePage = () => {
    if (!selectedPage) return;
    const updated = { ...selectedPage, content, version: selectedPage.version + 1 };
    addVersion(selectedPage.id, {
      id: `ver-${Date.now()}`,
      version: selectedPage.version + 1,
      content,
      notes: "",
      createdAt: new Date().toISOString(),
      author: "Admin",
    });
    updatePage(selectedPage.id, updated);
    toast.success("Saved version " + (selectedPage.version + 1));
  };

  if (!selectedPage || activeTab === "list") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Documentation CMS</h2>
            <p className="text-sm text-muted-foreground">Manage documentation and help articles</p>
          </div>
          <Button size="sm" onClick={createPage}>
            <Plus className="mr-2 h-4 w-4" /> New Page
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search docs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 max-w-sm" />
        </div>

        {filteredPages.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-1">No documentation yet</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first doc page</p>
              <Button onClick={createPage}><Plus className="mr-2 h-4 w-4" /> Create Page</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredPages.map((page) => (
              <Card key={page.id} className="glass cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => { setSelectedPage(page.id); setContent(page.content); setActiveTab("editor"); }}>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{page.title}</p>
                    <p className="text-xs text-muted-foreground">/{page.slug} · v{page.version} · {page.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={page.status === "published" ? "success" : "secondary"}>{page.status}</Badge>
                    <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); deletePage(page.id); toast.success("Deleted"); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{selectedPage.title}</h2>
          <p className="text-sm text-muted-foreground">Version {selectedPage.version} · {selectedPage.status}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setActiveTab("list")}>All Docs</Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedPage(null)}>
            <History className="mr-2 h-4 w-4" /> History
          </Button>
          <Button size="sm" onClick={savePage}>
            <Save className="mr-2 h-4 w-4" /> Save Version
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="glass lg:col-span-3">
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={30}
              className="font-mono text-sm w-full"
              placeholder="Write documentation content in markdown..."
            />
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Page Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={selectedPage.title} onChange={(e) => updatePage(selectedPage.id, { title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={selectedPage.slug} onChange={(e) => updatePage(selectedPage.id, { slug: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm" value={selectedPage.status}
                onChange={(e) => updatePage(selectedPage.id, { status: e.target.value as DocPage["status"] })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            {selectedPage.versionHistory.length > 0 && (
              <div className="pt-4 border-t">
                <Label className="text-sm">Version History</Label>
                <div className="space-y-2 mt-2">
                  {selectedPage.versionHistory.slice(-5).reverse().map((v) => (
                    <div key={v.id} className="text-xs text-muted-foreground">
                      v{v.version} · {new Date(v.createdAt).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
