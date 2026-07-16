"use client";

import { useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Key,
  Globe,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TestTube,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const checklistItems = [
  { id: 1, label: "HTTPS enabled", done: true },
  { id: 2, label: "Rate limiting configured", done: true },
  { id: 3, label: "Input validation active", done: true },
  { id: 4, label: "SQL injection protection", done: true },
  { id: 5, label: "XSS protection enabled", done: false },
  { id: 6, label: "CORS properly configured", done: true },
  { id: 7, label: "Authentication required", done: true },
  { id: 8, label: "Session timeout configured", done: false },
  { id: 9, label: "API key rotation enforced", done: false },
  { id: 10, label: "Audit logging enabled", done: true },
];

const corsOrigins = [
  "https://app.buildagent.ai",
  "https://admin.buildagent.ai",
  "https://api.buildagent.ai",
  "http://localhost:3000",
];

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState("validation");
  const [testInput, setTestInput] = useState("");
  const [validationResult, setValidationResult] = useState<null | { valid: boolean; message: string }>(null);
  const [promptInput, setPromptInput] = useState("");
  const [injectionResult, setInjectionResult] = useState<null | { detected: boolean; risk: string; type: string }>(null);
  const [rateLimit, setRateLimit] = useState("100");
  const [rateWindow, setRateWindow] = useState("60");
  const [encryptInput, setEncryptInput] = useState("");
  const [encrypted, setEncrypted] = useState("");
  const [decrypted, setDecrypted] = useState("");
  const [showEncrypted, setShowEncrypted] = useState(false);
  const [checklist, setChecklist] = useState(checklistItems);

  const runValidationTest = () => {
    if (!testInput) return;
    const hasScript = /<script[^>]*>/i.test(testInput);
    const hasSql = /(\bSELECT\b|\bDROP\b|\bINSERT\b|\bDELETE\b|\bUNION\b)/i.test(testInput);
    setValidationResult({
      valid: !hasScript && !hasSql,
      message: hasScript ? "Script injection detected!" : hasSql ? "SQL injection pattern detected!" : "Input passed validation",
    });
  };

  const runInjectionTest = () => {
    if (!promptInput) return;
    const injectionPatterns = [
      { pattern: /ignore.*(previous|above|all)/i, type: "Prompt override" },
      { pattern: /forget.*(instructions|rules)/i, type: "Instruction leakage" },
      { pattern: /system.*(prompt|message)/i, type: "System prompt extraction" },
      { pattern: /act as.*(admin|root|sudo)/i, type: "Role escalation" },
    ];
    const found = injectionPatterns.find((p) => p.pattern.test(promptInput));
    setInjectionResult(found ? { detected: true, risk: "high", type: found.type } : { detected: false, risk: "low", type: "none" });
  };

  const runEncryption = () => {
    if (!encryptInput) return;
    const encoded = btoa(encryptInput);
    setEncrypted(encoded);
    setDecrypted(atob(encoded));
  };

  const toggleChecklist = (id: number) => {
    setChecklist(checklist.map((item) => item.id === id ? { ...item, done: !item.done } : item));
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Security Center"
          description="Platform security monitoring and configuration."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Security" }]}
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Security Score", value: "B+", icon: Shield },
            { label: "Passed Tests", value: `${checklist.filter((c) => c.done).length}/${checklist.length}`, icon: ShieldCheck },
            { label: "Active Threats", value: "0", icon: ShieldAlert },
            { label: "Encryption", value: "AES-256", icon: Lock },
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
            <TabsTrigger value="validation">Input Validation</TabsTrigger>
            <TabsTrigger value="injection">Injection Detection</TabsTrigger>
            <TabsTrigger value="rate-limit">Rate Limiting</TabsTrigger>
            <TabsTrigger value="cors">CORS Settings</TabsTrigger>
            <TabsTrigger value="encryption">Encryption</TabsTrigger>
            <TabsTrigger value="checklist">Security Checklist</TabsTrigger>
          </TabsList>

          <TabsContent value="validation">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Input Validation Tester</CardTitle>
                <CardDescription>Test inputs for injection patterns and validation rules.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea value={testInput} onChange={(e) => setTestInput(e.target.value)} placeholder="Enter input to test for validation..." rows={4} />
                <Button onClick={runValidationTest} className="gap-2">
                  <TestTube className="h-4 w-4" /> Run Validation Test
                </Button>
                {validationResult && (
                  <div className={`p-4 rounded-lg flex items-center gap-3 ${validationResult.valid ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                    {validationResult.valid ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                    <span className={`text-sm ${validationResult.valid ? "text-emerald-500" : "text-red-500"}`}>{validationResult.message}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="injection">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Prompt Injection Detection Tester</CardTitle>
                <CardDescription>Test prompts for injection patterns.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea value={promptInput} onChange={(e) => setPromptInput(e.target.value)} placeholder="Enter a prompt to test for injection patterns..." rows={4} />
                <Button onClick={runInjectionTest} className="gap-2">
                  <ShieldAlert className="h-4 w-4" /> Analyze Prompt
                </Button>
                {injectionResult && (
                  <div className={`p-4 rounded-lg ${injectionResult.detected ? "bg-red-500/10 border border-red-500/20" : "bg-emerald-500/10 border border-emerald-500/20"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {injectionResult.detected ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <ShieldCheck className="h-5 w-5 text-emerald-500" />}
                      <span className={`text-sm font-medium ${injectionResult.detected ? "text-red-500" : "text-emerald-500"}`}>
                        {injectionResult.detected ? "Injection Detected" : "No Injection Found"}
                      </span>
                    </div>
                    {injectionResult.detected && (
                      <div className="text-sm text-muted-foreground mt-1">
                        <p>Type: {injectionResult.type}</p>
                        <p>Risk: <Badge variant="destructive">{injectionResult.risk}</Badge></p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rate-limit">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Rate Limiting Configuration</CardTitle>
                <CardDescription>Configure API rate limiting parameters.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Requests</Label>
                    <Input type="number" value={rateLimit} onChange={(e) => setRateLimit(e.target.value)} placeholder="100" />
                  </div>
                  <div className="space-y-2">
                    <Label>Time Window (seconds)</Label>
                    <Input type="number" value={rateWindow} onChange={(e) => setRateWindow(e.target.value)} placeholder="60" />
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-sm text-muted-foreground">Current configuration: <strong>{rateLimit}</strong> requests per <strong>{rateWindow}</strong> seconds</p>
                  <p className="text-xs text-muted-foreground mt-1">Rate: {(parseInt(rateLimit) / parseInt(rateWindow)).toFixed(1)} req/s</p>
                </div>
                <Button variant="glass">Save Rate Limit Config</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cors">
            <Card className="glass">
              <CardHeader>
                <CardTitle>CORS Settings</CardTitle>
                <CardDescription>Allowed origins and CORS configuration.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Allowed Origins</Label>
                  <div className="space-y-2">
                    {corsOrigins.map((origin, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                        <Globe className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-mono">{origin}</span>
                        <Badge variant="success" className="ml-auto">Allowed</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Allow Credentials</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Allowed Methods</span>
                    <span className="text-sm text-muted-foreground font-mono">GET, POST, PUT, DELETE, PATCH</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="encryption">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Encryption/Decryption Test</CardTitle>
                <CardDescription>Test encryption and decryption functionality.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Text to Encrypt</Label>
                  <div className="flex gap-2">
                    <Input value={encryptInput} onChange={(e) => setEncryptInput(e.target.value)} placeholder="Enter text to encrypt..." className="flex-1" />
                    <Button onClick={runEncryption} className="gap-2">
                      <Lock className="h-4 w-4" /> Encrypt
                    </Button>
                  </div>
                </div>
                {encrypted && (
                  <>
                    <div className="space-y-2">
                      <Label>Encrypted (Base64)</Label>
                      <div className="flex gap-2">
                        <Input value={encrypted} readOnly className="flex-1 font-mono text-xs" type={showEncrypted ? "text" : "password"} />
                        <Button variant="ghost" size="icon" onClick={() => setShowEncrypted(!showEncrypted)}>
                          {showEncrypted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Decrypted</Label>
                      <Input value={decrypted} readOnly className="font-mono" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklist">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Security Checklist</CardTitle>
                <CardDescription>Verify your security posture.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <Switch checked={item.done} onCheckedChange={() => toggleChecklist(item.id)} />
                      <span className={`text-sm flex-1 ${item.done ? "line-through text-muted-foreground" : ""}`}>{item.label}</span>
                      {item.done ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 rounded-lg bg-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Security Score</span>
                    <Badge variant={checklist.filter((c) => c.done).length >= 8 ? "success" : checklist.filter((c) => c.done).length >= 5 ? "warning" : "destructive"}>
                      {checklist.filter((c) => c.done).length}/{checklist.length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
