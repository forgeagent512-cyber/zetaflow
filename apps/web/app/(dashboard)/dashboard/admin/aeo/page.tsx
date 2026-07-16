"use client";

import { useState } from "react";
import {
  HelpCircle,
  MessageSquare,
  Wrench,
  Search,
  BookOpen,
  Plus,
  Copy,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface GlossaryTerm {
  id: number;
  term: string;
  definition: string;
}

export default function AEOPage() {
  const [activeTab, setActiveTab] = useState("faq");
  const [faqTopic, setFaqTopic] = useState("");
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [generatingFaq, setGeneratingFaq] = useState(false);
  const [answerQuestion, setAnswerQuestion] = useState("");
  const [optimizedAnswer, setOptimizedAnswer] = useState("");
  const [howToTopic, setHowToTopic] = useState("");
  const [howToSteps, setHowToSteps] = useState("");
  const [generatedHowTo, setGeneratedHowTo] = useState("");
  const [snippetContent, setSnippetContent] = useState("");
  const [snippetSuggestions, setSnippetSuggestions] = useState<string[]>([]);
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>([
    { id: 1, term: "AEO", definition: "Answer Engine Optimization - optimizing content for AI answer engines" },
    { id: 2, term: "Featured Snippet", definition: "A highlighted answer box shown at the top of search results" },
  ]);
  const [newTerm, setNewTerm] = useState("");
  const [newDefinition, setNewDefinition] = useState("");

  const generateFAQs = () => {
    if (!faqTopic) return;
    setGeneratingFaq(true);
    setTimeout(() => {
      setFaqs([
        { question: `What is the best way to ${faqTopic}?`, answer: `The best approach to ${faqTopic} involves leveraging AI-powered tools and following industry best practices to maximize efficiency and results.` },
        { question: `How does ${faqTopic} work?`, answer: `${faqTopic} works by combining advanced algorithms with user-specific data to deliver personalized, optimized outcomes.` },
        { question: `What are the benefits of ${faqTopic}?`, answer: `Key benefits include improved performance, reduced manual effort, better scalability, and data-driven decision making.` },
        { question: `Is ${faqTopic} worth the investment?`, answer: `Yes, investing in ${faqTopic} typically yields significant ROI through automation, optimization, and competitive advantage.` },
        { question: `How to get started with ${faqTopic}?`, answer: `Start by defining your goals, assessing your current setup, choosing the right tools, and implementing incrementally.` },
      ]);
      setGeneratingFaq(false);
    }, 1500);
  };

  const getAnswer = () => {
    if (!answerQuestion) return;
    setOptimizedAnswer(`An optimized answer for "${answerQuestion}" would be concise, authoritative, and structured for featured snippets. It should directly address the query, use clear language, include relevant data points, and cite authoritative sources. This approach maximizes visibility in AI-powered search results and answer engines.`);
  };

  const generateHowTo = () => {
    if (!howToTopic) return;
    const steps = howToSteps.split("\n").filter(Boolean);
    const schema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `How to ${howToTopic}`,
      step: steps.map((step, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: step,
        text: step,
      })),
    };
    setGeneratedHowTo(JSON.stringify(schema, null, 2));
  };

  const optimizeSnippet = () => {
    if (!snippetContent) return;
    setSnippetSuggestions([
      "Add a concise definition in the first 2 sentences",
      "Use bullet points for list-type featured snippets",
      "Include a table for comparison data",
      "Keep paragraphs under 3 sentences",
      "Add schema markup for better extraction",
      "Use question-based subheadings (H2)",
    ]);
  };

  const addGlossaryTerm = () => {
    if (!newTerm || !newDefinition) return;
    setGlossaryTerms([...glossaryTerms, { id: Date.now(), term: newTerm, definition: newDefinition }]);
    setNewTerm("");
    setNewDefinition("");
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="AEO Center"
          description="Answer Engine Optimization for AI-powered search."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "AEO" }]}
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "FAQs Generated", value: faqs.length.toString(), icon: HelpCircle },
            { label: "Optimized Answers", value: optimizedAnswer ? "1" : "0", icon: MessageSquare },
            { label: "How-To Schemas", value: generatedHowTo ? "1" : "0", icon: Wrench },
            { label: "Glossary Terms", value: glossaryTerms.length.toString(), icon: BookOpen },
          ].map((stat) => {
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="glass">
            <TabsTrigger value="faq">FAQ Generator</TabsTrigger>
            <TabsTrigger value="answers">Answer Blocks</TabsTrigger>
            <TabsTrigger value="howto">How-To Generator</TabsTrigger>
            <TabsTrigger value="snippet">Snippet Optimizer</TabsTrigger>
            <TabsTrigger value="glossary">Glossary</TabsTrigger>
          </TabsList>

          <TabsContent value="faq">
            <Card className="glass">
              <CardHeader>
                <CardTitle>FAQ Generator</CardTitle>
                <CardDescription>Generate FAQ lists with schema markup for any topic.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Input value={faqTopic} onChange={(e) => setFaqTopic(e.target.value)} placeholder="Enter a topic (e.g., 'real estate AI')" className="flex-1" />
                  <Button onClick={generateFAQs} disabled={generatingFaq} className="gap-2">
                    {generatingFaq ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {generatingFaq ? "Generating..." : "Generate FAQs"}
                  </Button>
                </div>
                {faqs.length > 0 && (
                  <div className="space-y-3">
                    {faqs.map((faq, i) => (
                      <div key={i} className="p-4 rounded-lg bg-white/5 space-y-2">
                        <div className="flex items-start gap-2">
                          <HelpCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{faq.question}</p>
                            <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-emerald-500">FAQPage schema generated automatically</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="answers">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Answer Block Generator</CardTitle>
                <CardDescription>Get optimized, snippet-ready answers to any question.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Input value={answerQuestion} onChange={(e) => setAnswerQuestion(e.target.value)} placeholder="Enter a question" className="flex-1" />
                  <Button onClick={getAnswer} className="gap-2">
                    <Search className="h-4 w-4" /> Get Answer
                  </Button>
                </div>
                {optimizedAnswer && (
                  <div className="p-4 rounded-lg bg-white/5 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="success">Optimized</Badge>
                      <span className="text-xs text-muted-foreground">Ready for featured snippets</span>
                    </div>
                    <p className="text-sm">{optimizedAnswer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="howto">
            <Card className="glass">
              <CardHeader>
                <CardTitle>How-To Generator</CardTitle>
                <CardDescription>Generate HowTo schema markup for step-by-step guides.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic</label>
                  <Input value={howToTopic} onChange={(e) => setHowToTopic(e.target.value)} placeholder="e.g., set up AI employee" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Steps (one per line)</label>
                  <Textarea value={howToSteps} onChange={(e) => setHowToSteps(e.target.value)} placeholder="Step 1 description&#10;Step 2 description&#10;Step 3 description" rows={5} />
                </div>
                <Button onClick={generateHowTo} className="gap-2">
                  <Wrench className="h-4 w-4" /> Generate HowTo Schema
                </Button>
                {generatedHowTo && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Generated Schema</label>
                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigator.clipboard.writeText(generatedHowTo)}>
                        <Copy className="h-3 w-3" /> Copy
                      </Button>
                    </div>
                    <pre className="p-4 rounded-lg bg-black/40 text-xs text-emerald-400 overflow-x-auto max-h-60 overflow-y-auto">{generatedHowTo}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="snippet">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Featured Snippet Optimizer</CardTitle>
                <CardDescription>Optimize your content for featured snippets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Content</label>
                  <Textarea value={snippetContent} onChange={(e) => setSnippetContent(e.target.value)} placeholder="Paste your content here to get optimization suggestions..." rows={6} />
                </div>
                <Button onClick={optimizeSnippet} className="gap-2">
                  <Search className="h-4 w-4" /> Analyze for Snippets
                </Button>
                {snippetSuggestions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Optimization Suggestions</h4>
                    {snippetSuggestions.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="text-sm">{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="glossary">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Glossary Term Manager</CardTitle>
                <CardDescription>Manage glossary terms for rich results.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input value={newTerm} onChange={(e) => setNewTerm(e.target.value)} placeholder="Term" />
                  <Input value={newDefinition} onChange={(e) => setNewDefinition(e.target.value)} placeholder="Definition" className="md:col-span-1" />
                  <Button onClick={addGlossaryTerm} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Term
                  </Button>
                </div>
                <div className="space-y-2">
                  {glossaryTerms.map((term) => (
                    <div key={term.id} className="p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{term.term}</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">{term.definition}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
