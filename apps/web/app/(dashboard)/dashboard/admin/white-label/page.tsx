"use client";

import { useState } from "react";
import {
  Palette,
  Image,
  Type,
  Globe,
  Code,
  Eye,
  Save,
  CheckCircle2,
  ToggleLeft,
  Monitor,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const fontOptions = [
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat",
  "Poppins", "Playfair Display", "Source Sans Pro", "Nunito", "Raleway",
];

export default function WhiteLabelPage() {
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#8b5cf6");
  const [accentColor, setAccentColor] = useState("#10b981");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [customDomain, setCustomDomain] = useState("");
  const [domainVerified, setDomainVerified] = useState(false);
  const [customCss, setCustomCss] = useState("");
  const [customJs, setCustomJs] = useState("");
  const [hideBranding, setHideBranding] = useState(false);
  const [saved, setSaved] = useState(false);

  const verifyDomain = () => {
    if (!customDomain) return;
    setTimeout(() => setDomainVerified(true), 1000);
  };

  const saveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="White Label"
          description="Customize branding and appearance."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "White Label" }]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Branding Settings</CardTitle>
                <CardDescription>Customize your platform's appearance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <div className="flex gap-2">
                    <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" className="flex-1" icon={<Image className="h-4 w-4" />} />
                  </div>
                  {logoUrl && (
                    <div className="p-3 rounded-lg bg-white/5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xs overflow-hidden">
                        <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                      <span className="text-xs text-muted-foreground truncate">{logoUrl}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Color Scheme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Primary</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-border" />
                        <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="font-mono text-xs" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Secondary</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-border" />
                        <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="font-mono text-xs" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Accent</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-border" />
                        <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="font-mono text-xs" />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font} value={font}>{font}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Custom Domain</Label>
                  <div className="flex gap-2">
                    <Input value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="app.yourdomain.com" className="flex-1" icon={<Globe className="h-4 w-4" />} />
                    <Button variant="outline" onClick={verifyDomain} disabled={domainVerified}>
                      {domainVerified ? "Verified" : "Verify"}
                    </Button>
                  </div>
                  {domainVerified && (
                    <div className="flex items-center gap-2 text-xs text-emerald-500">
                      <CheckCircle2 className="h-3 w-3" /> Domain verified successfully
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Hide Platform Branding</Label>
                      <p className="text-xs text-muted-foreground">Remove "Powered by BuildAgent"</p>
                    </div>
                    <Switch checked={hideBranding} onCheckedChange={setHideBranding} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Custom Code</CardTitle>
                <CardDescription>Inject custom CSS and JavaScript.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Custom CSS</Label>
                  <Textarea value={customCss} onChange={(e) => setCustomCss(e.target.value)} placeholder="/* Your custom CSS */" rows={4} className="font-mono text-xs" />
                </div>
                <div className="space-y-2">
                  <Label>Custom JavaScript</Label>
                  <Textarea value={customJs} onChange={(e) => setCustomJs(e.target.value)} placeholder="// Your custom JavaScript" rows={4} className="font-mono text-xs" />
                </div>
              </CardContent>
            </Card>

            <Button onClick={saveSettings} className="w-full gap-2" size="lg">
              {saved ? <CheckCircle2 className="h-5 w-5" /> : <Save className="h-5 w-5" />}
              {saved ? "Settings Saved!" : "Save Settings"}
            </Button>
          </div>

          <div className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Branding Preview</CardTitle>
                <CardDescription>See how your branding looks.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: primaryColor }} />
                    <span className="text-sm font-semibold" style={{ fontFamily }}>Your Brand</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 rounded-full w-3/4" style={{ backgroundColor: primaryColor, opacity: 0.3 }} />
                    <div className="h-3 rounded-full w-1/2" style={{ backgroundColor: secondaryColor, opacity: 0.3 }} />
                    <div className="h-3 rounded-full w-2/3" style={{ backgroundColor: accentColor, opacity: 0.3 }} />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: primaryColor }}>Primary Button</div>
                    <div className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: secondaryColor }}>Secondary</div>
                    <div className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: accentColor }}>Accent</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4" style={{ fontFamily }}>
                    Preview text in {fontFamily} font.
                    {hideBranding && <Badge variant="outline" className="ml-2">Branding Hidden</Badge>}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
