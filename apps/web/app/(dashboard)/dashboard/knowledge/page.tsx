"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Book, Search, FileText, Database, CheckCircle2,
  Clock, Eye, Download, ExternalLink, Layers,
  AlertCircle, BookOpen,
} from "lucide-react";
import { PageTransition } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const knowledgeBases = [
  { id: 1, name: "Real Estate Terms", type: "Glossary", chunks: 245, status: "active", updated: "1h ago" },
  { id: 2, name: "Sales Scripts", type: "Document", chunks: 128, status: "active", updated: "3h ago" },
  { id: 3, name: "Market Reports", type: "Reports", chunks: 89, status: "active", updated: "1d ago" },
  { id: 4, name: "Client FAQs", type: "FAQ", chunks: 45, status: "active", updated: "2d ago" },
];

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string | null>(null);

  const handleSearch = () => {
    if (!searchQuery) return;
    setTimeout(() => {
      setSearchResults(`Found 2 results for "${searchQuery}":\n\n1. Real Estate Terms → Definition of "${searchQuery}"\n   Relevance: 0.92\n\n2. Sales Scripts → Mentioned in "Objection Handling"\n   Relevance: 0.78`);
    }, 1000);
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="Knowledge Base"
          description="Search and browse your knowledge bases."
          breadcrumbs={[{ label: "Knowledge" }]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass">
              <CardHeader><CardTitle>Search Knowledge</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" placeholder="Search your knowledge bases..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-transparent pl-9 pr-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>
                  <Button variant="glass" className="gap-2" onClick={handleSearch}><Search className="h-4 w-4" />Search</Button>
                </div>
                {searchResults && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
                    <pre className="text-xs whitespace-pre-wrap">{searchResults}</pre>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader><CardTitle>All Knowledge Bases</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {knowledgeBases.map((kb) => (
                    <div key={kb.id} className="p-4 rounded-lg border border-border hover:bg-muted/20 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{kb.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">{kb.type}</Badge>
                        <span>{kb.chunks} chunks</span>
                        <span>{kb.updated}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass">
              <CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Database className="h-8 w-8 text-primary" />
                  <div><p className="text-lg font-bold">4</p><p className="text-xs text-muted-foreground">Knowledge Bases</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <Layers className="h-8 w-8 text-violet-500" />
                  <div><p className="text-lg font-bold">507</p><p className="text-xs text-muted-foreground">Total Chunks</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div><p className="text-lg font-bold">12</p><p className="text-xs text-muted-foreground">Documents</p></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}