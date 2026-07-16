"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Plus, FileText, Upload, Database,
  Trash2, Eye, Download, CheckCircle2, Clock,
  XCircle, AlertCircle, Book, Bookmark, Layers,
  Sparkles, ExternalLink, RefreshCw, Copy,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose,
} from "@/components/ui/modal";

const knowledgeBases = [
  { id: 1, name: "Real Estate Terms", type: "glossary", chunks: 245, embeddings: "completed", updated: "1h ago", status: "active" },
  { id: 2, name: "Sales Scripts", type: "document", chunks: 128, embeddings: "completed", updated: "3h ago", status: "active" },
  { id: 3, name: "Property Data", type: "dataset", chunks: 567, embeddings: "processing", updated: "5h ago", status: "processing" },
  { id: 4, name: "Market Reports", type: "pdf", chunks: 89, embeddings: "completed", updated: "1d ago", status: "active" },
  { id: 5, name: "Client FAQs", type: "markdown", chunks: 45, embeddings: "failed", updated: "2d ago", status: "error" },
  { id: 6, name: "Compliance Docs", type: "pdf", chunks: 312, embeddings: "completed", updated: "3d ago", status: "active" },
];

const documents = [
  { id: 1, name: "property_listings_2025.json", kb: "Property Data", chunks: 120, size: "4.2MB" },
  { id: 2, name: "sales_script_v3.md", kb: "Sales Scripts", chunks: 45, size: "156KB" },
  { id: 3, name: "client_faqs.md", kb: "Client FAQs", chunks: 30, size: "89KB" },
  { id: 4, name: "compliance_guide.pdf", kb: "Compliance Docs", chunks: 200, size: "8.1MB" },
];

export default function KnowledgeManagerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string | null>(null);

  const handleSearch = () => {
    if (!searchQuery) return;
    setTimeout(() => {
      setSearchResults(
        `Found 3 matches for "${searchQuery}":\n\n1. [KB: Real Estate Terms] Definition of "${searchQuery}" found in chunk #42\n   Score: 0.92\n\n2. [KB: Sales Scripts] Related concept in section "Advanced Strategies"\n   Score: 0.78\n\n3. [KB: Property Data] Mentioned in property type classification\n   Score: 0.65`
      );
    }, 1200);
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="Knowledge Manager"
          description="Manage knowledge bases, document chunks, and embeddings."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Knowledge Manager" }]}
          actions={<Button variant="glass" className="gap-2" onClick={() => setShowUpload(true)}><Upload className="h-4 w-4" />Upload Document</Button>}
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Knowledge Bases</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Database className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">6</p><p className="text-xs text-muted-foreground">4 active</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Chunks</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Layers className="h-8 w-8 text-violet-500" /><div><p className="text-2xl font-bold">1,386</p><p className="text-xs text-muted-foreground">Indexed</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Embeddings Ready</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><CheckCircle2 className="h-8 w-8 text-emerald-500" /><div><p className="text-2xl font-bold">4/6</p><p className="text-xs text-muted-foreground">1 processing</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Storage Used</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Database className="h-8 w-8 text-amber-500" /><div><p className="text-2xl font-bold">234MB</p><p className="text-xs text-muted-foreground">of 1GB</p></div></div></CardContent></Card></StaggerItem>
        </StaggerWrapper>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Knowledge Bases</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-8 w-48 rounded-lg border border-input bg-transparent pl-8 pr-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {knowledgeBases.filter(kb => !searchTerm || kb.name.toLowerCase().includes(searchTerm.toLowerCase())).map((kb) => (
                    <motion.div key={kb.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${kb.status === "active" ? "bg-emerald-500/10" : kb.status === "processing" ? "bg-amber-500/10" : "bg-red-500/10"}`}>
                          {kb.status === "active" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
                           kb.status === "processing" ? <AlertCircle className="h-4 w-4 text-amber-500" /> :
                           <XCircle className="h-4 w-4 text-red-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{kb.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px]">{kb.type}</Badge>
                            <span className="text-xs text-muted-foreground">{kb.chunks} chunks</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={kb.embeddings === "completed" ? "success" : kb.embeddings === "processing" ? "warning" : "destructive"} className="text-[10px]">{kb.embeddings}</Badge>
                        <span className="text-xs text-muted-foreground">{kb.updated}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader><CardTitle>Search Test</CardTitle><CardDescription>Test knowledge base retrieval</CardDescription></CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input placeholder="Search query..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1" />
                  <Button variant="glass" className="gap-2" onClick={handleSearch}><Search className="h-4 w-4" />Search</Button>
                </div>
                {searchResults && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
                    <pre className="text-xs whitespace-pre-wrap">{searchResults}</pre>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass">
              <CardHeader><CardTitle>Document Chunks</CardTitle><CardDescription>Recent document chunks</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-3 rounded-lg hover:bg-muted/30 transition-colors border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium truncate">{doc.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">{doc.kb}</Badge>
                        <span>{doc.chunks} chunks</span>
                        <span>{doc.size}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader><CardTitle>Embedding Status</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {knowledgeBases.map((kb) => (
                    <div key={kb.id} className="flex items-center gap-2 text-xs">
                      <div className={`h-2 w-2 rounded-full ${kb.embeddings === "completed" ? "bg-emerald-500" : kb.embeddings === "processing" ? "bg-amber-500 animate-pulse" : "bg-red-500"}`} />
                      <span className="flex-1">{kb.name}</span>
                      <Badge variant={kb.embeddings === "completed" ? "success" : kb.embeddings === "processing" ? "warning" : "destructive"} className="text-[10px]">{kb.embeddings}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Modal open={showUpload} onOpenChange={setShowUpload}>
          <ModalContent>
            <ModalHeader><ModalTitle>Upload Document</ModalTitle><ModalDescription>Add a document to a knowledge base</ModalDescription></ModalHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Knowledge Base</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select KB" /></SelectTrigger>
                  <SelectContent>{knowledgeBases.filter(kb => kb.status === "active").map(kb => (<SelectItem key={kb.id} value={kb.name}>{kb.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>File</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">Drop file here or click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, Markdown, TXT, CSV (max 10MB)</p>
                </div>
              </div>
              <div className="space-y-2"><Label>Chunk Size</Label>
                <Select defaultValue="medium"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="small">Small (256 tokens)</SelectItem><SelectItem value="medium">Medium (512 tokens)</SelectItem><SelectItem value="large">Large (1024 tokens)</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <ModalFooter>
              <ModalClose asChild><Button variant="outline">Cancel</Button></ModalClose>
              <Button variant="default" className="gap-2"><Upload className="h-4 w-4" />Upload & Process</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </PageTransition>
  );
}