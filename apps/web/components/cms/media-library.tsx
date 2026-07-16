"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Grid3X3,
  List,
  Search,
  Folder,
  FolderPlus,
  Image,
  File,
  Trash2,
  Download,
  Copy,
  MoreHorizontal,
  X,
  Check,
  Film,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useMediaLibrary } from "@/store/use-media-library";
import type { MediaItem, MediaType } from "@/types/cms";

const mediaTypeIcons: Record<MediaType, React.ElementType> = {
  image: Image,
  video: Film,
  pdf: FileText,
  svg: FileText,
  icon: Image,
  lottie: Film,
  spline: File,
  glb: File,
  hdr: Image,
  "3d": File,
  other: File,
};

export function MediaLibrary() {
  const {
    items,
    folders,
    selectedFolder,
    selectedItems,
    viewMode,
    searchQuery,
    addItem,
    deleteItems,
    setSelectedFolder,
    setViewMode,
    setSearchQuery,
    toggleItemSelection,
    clearSelection,
    getFilteredItems,
  } = useMediaLibrary();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const filteredItems = getFilteredItems();

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const type: MediaType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : file.type === "application/pdf"
        ? "pdf"
        : "other";

      const item: MediaItem = {
        id: `media-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        type,
        url: URL.createObjectURL(file),
        size: file.size,
        folder: selectedFolder || "root",
        tags: [],
        alt: file.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addItem(item);
    });
    toast.success(`${files.length} file(s) uploaded`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Media Library</h2>
          <p className="text-sm text-muted-foreground">Manage your media assets</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedItems.length > 0 && (
            <>
              <span className="text-sm text-muted-foreground">{selectedItems.length} selected</span>
              <Button variant="destructive" size="sm" onClick={() => { deleteItems(selectedItems); toast.success("Deleted"); }}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                <X className="mr-2 h-4 w-4" /> Clear
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
            {viewMode === "grid" ? <List className="mr-2 h-4 w-4" /> : <Grid3X3 className="mr-2 h-4 w-4" />}
            {viewMode === "grid" ? "List" : "Grid"}
          </Button>
          <Button size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,application/pdf,.svg,.glb,.hdr"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Card className="glass w-48 shrink-0">
          <CardContent className="p-3">
            <div className="space-y-1">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedFolder === null ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                }`}
              >
                <Folder className="h-4 w-4" />
                All Files
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedFolder === folder.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  }`}
                >
                  <Folder className="h-4 w-4" />
                  {folder.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div
            className={`min-h-[400px] rounded-xl border-2 border-dashed transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-border"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Image className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-1">No media yet</p>
                <p className="text-sm text-muted-foreground mb-4">Drop files here or click upload</p>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4">
                {filteredItems.map((item) => {
                  const Icon = mediaTypeIcons[item.type];
                  const isSelected = selectedItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItemSelection(item.id)}
                      className={`relative group rounded-xl border overflow-hidden cursor-pointer transition-all ${
                        isSelected ? "ring-2 ring-primary border-primary" : "hover:border-muted-foreground"
                      }`}
                    >
                      {item.type === "image" ? (
                        <div className="aspect-square bg-muted">
                          <img
                            src={item.url}
                            alt={item.alt}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square flex items-center justify-center bg-muted">
                          <Icon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-xs truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatSize(item.size)}</p>
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon-sm" className="text-white">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-white">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-white">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="divide-y">
                {filteredItems.map((item) => {
                  const Icon = mediaTypeIcons[item.type];
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItemSelection(item.id)}
                      className={`flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-muted/30 ${
                        selectedItems.includes(item.id) ? "bg-accent" : ""
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        {item.type === "image" ? (
                          <img src={item.url} alt={item.alt} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.type} · {formatSize(item.size)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon-sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
