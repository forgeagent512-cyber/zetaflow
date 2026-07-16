"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Edit3,
  Eye,
  Calendar,
  Clock,
  Trash2,
  MoreHorizontal,
  FileText,
  Tag,
  FolderOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalTrigger } from "@/components/ui/modal";
import { toast } from "sonner";
import { useBlogStore } from "@/store/use-blog-store";
import type { BlogPost } from "@/types/cms";

export function BlogCMS() {
  const { posts, categories, tags, addPost, updatePost, deletePost, addCategory, addTag } = useBlogStore();
  const [activeTab, setActiveTab] = useState("posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createNewPost = () => {
    const newPost: BlogPost = {
      id: `post-${Date.now()}`,
      title: "New Blog Post",
      slug: `new-post-${Date.now()}`,
      excerpt: "",
      content: "",
      featuredImage: "",
      categories: [],
      tags: [],
      author: { id: "author-1", name: "Admin", avatar: "", bio: "" },
      status: "draft",
      seo: { title: "", description: "", keywords: [], noIndex: false },
      readTime: 5,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addPost(newPost);
    setEditingPost(newPost);
    setShowEditor(true);
    toast.success("New post created");
  };

  const savePost = () => {
    if (!editingPost) return;
    updatePost(editingPost.id, editingPost);
    setShowEditor(false);
    setEditingPost(null);
    toast.success("Post saved");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Blog CMS</h2>
          <p className="text-sm text-muted-foreground">Manage your blog content</p>
        </div>
        <Button size="sm" onClick={createNewPost}>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Posts ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" /> Categories
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <Tag className="h-4 w-4" /> Tags
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 max-w-sm"
            />
          </div>

          {filteredPosts.length === 0 ? (
            <Card className="glass">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-1">No posts yet</p>
                <p className="text-sm text-muted-foreground mb-4">Create your first blog post</p>
                <Button onClick={createNewPost}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="glass">
                  <div className="flex items-start gap-4 p-4">
                    {post.featuredImage && (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-20 h-20 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{post.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{post.excerpt}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon-sm" onClick={() => { setEditingPost(post); setShowEditor(true); }}>
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-sm">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => { deletePost(post.id); toast.success("Deleted"); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant={post.status === "published" ? "success" : post.status === "scheduled" ? "warning" : "secondary"}>
                          {post.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {post.readTime} min read
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No categories yet</p>
              ) : (
                categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{cat.postCount} posts</p>
                    </div>
                    <Button variant="ghost" size="icon-sm"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full" onClick={() => {
                const name = prompt("Category name:");
                if (name) addCategory({ id: `cat-${Date.now()}`, name, slug: name.toLowerCase().replace(/\s+/g, "-"), description: "", postCount: 0 });
              }}>
                <Plus className="mr-2 h-4 w-4" /> Add Category
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="gap-1">
                    {tag.name}
                    <button onClick={() => { useBlogStore.getState().deleteTag(tag.id); toast.success("Tag deleted"); }}>
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                const name = prompt("Tag name:");
                if (name) addTag({ id: `tag-${Date.now()}`, name, slug: name.toLowerCase().replace(/\s+/g, "-"), postCount: 0 });
              }}>
                <Plus className="mr-2 h-4 w-4" /> Add Tag
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Modal open={showEditor} onOpenChange={setShowEditor}>
        <ModalContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>{editingPost?.title || "New Post"}</ModalTitle>
          </ModalHeader>
          {editingPost && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={editingPost.slug}
                    onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                    value={editingPost.status}
                    onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as BlogPost["status"] })}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea
                  value={editingPost.excerpt}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Content (Markdown)</Label>
                <Textarea
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Featured Image URL</Label>
                  <Input
                    value={editingPost.featuredImage}
                    onChange={(e) => setEditingPost({ ...editingPost, featuredImage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Read Time (minutes)</Label>
                  <Input
                    type="number"
                    value={editingPost.readTime}
                    onChange={(e) => setEditingPost({ ...editingPost, readTime: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditor(false)}>Cancel</Button>
                <Button onClick={savePost}>Save Post</Button>
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
