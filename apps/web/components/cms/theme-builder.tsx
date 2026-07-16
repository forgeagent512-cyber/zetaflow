"use client";

import { useState, useEffect } from "react";
import { useThemeStore } from "@/store/use-theme-store";
import {
  Palette,
  Type,
  Layout,
  Sparkles,
  MousePointer2,
  Monitor,
  Sun,
  Moon,
  RefreshCw,
  Eye,
  Save,
  Undo2,
  Image,
  RectangleHorizontal as ButtonIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const colorFields = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
  { key: "background", label: "Background" },
  { key: "foreground", label: "Foreground" },
  { key: "muted", label: "Muted" },
  { key: "border", label: "Border" },
  { key: "ring", label: "Ring" },
] as const;

const typographyFields = [
  { key: "headingFont", label: "Heading Font" },
  { key: "bodyFont", label: "Body Font" },
  { key: "monoFont", label: "Monospace Font" },
] as const;

export function ThemeBuilder() {
  const { theme, activeTheme, updateColors, updateTypography, updateButtons, updateEffects, updateLayout, updateDarkMode, updateAnimations, updateBrand, toggleTheme, resetTheme, applyTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState("colors");

  useEffect(() => {
    applyTheme();
  }, [theme, applyTheme]);

  const handleColorChange = (key: string, value: string) => {
    updateColors({ [key]: value });
  };

  const handleSave = () => {
    applyTheme();
    toast.success("Theme saved successfully");
  };

  const handleReset = () => {
    resetTheme();
    toast.success("Theme reset to defaults");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Theme Builder</h2>
          <p className="text-sm text-muted-foreground">Customize your platform appearance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <Undo2 className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            {activeTheme === "dark" ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            {activeTheme === "dark" ? "Light" : "Dark"} Preview
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Theme
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" /> Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="h-4 w-4" /> Typography
          </TabsTrigger>
          <TabsTrigger value="buttons" className="flex items-center gap-2">
            <ButtonIcon className="h-4 w-4" /> Buttons
          </TabsTrigger>
          <TabsTrigger value="effects" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Effects
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="h-4 w-4" /> Layout
          </TabsTrigger>
          <TabsTrigger value="animations" className="flex items-center gap-2">
            <MousePointer2 className="h-4 w-4" /> Animations
          </TabsTrigger>
          <TabsTrigger value="brand" className="flex items-center gap-2">
            <Image className="h-4 w-4" /> Brand
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {colorFields.map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <div className="flex gap-2">
                      <div
                        className="h-10 w-10 rounded-lg border shrink-0"
                        style={{ backgroundColor: (theme.colors as unknown as Record<string, string>)[key] }}
                      />
                      <Input
                        value={(theme.colors as unknown as Record<string, string>)[key]}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <Label>Gradients</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Primary Gradient</Label>
                    <Input
                      value={theme.colors.gradientPrimary}
                      onChange={(e) => handleColorChange("gradientPrimary", e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Secondary Gradient</Label>
                    <Input
                      value={theme.colors.gradientSecondary}
                      onChange={(e) => handleColorChange("gradientSecondary", e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Typography Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {typographyFields.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Input
                    value={(theme.typography as unknown as Record<string, string | number>)[key] as string}
                    onChange={(e) => updateTypography({ [key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Base Size (px)</Label>
                  <Input
                    type="number"
                    value={theme.typography.baseSize}
                    onChange={(e) => updateTypography({ baseSize: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Scale</Label>
                  <Input
                    type="number"
                    step="0.05"
                    value={theme.typography.scale}
                    onChange={(e) => updateTypography({ scale: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Line Height</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={theme.typography.lineHeight}
                    onChange={(e) => updateTypography({ lineHeight: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Heading Weight</Label>
                  <Input
                    type="number"
                    value={theme.typography.headingWeight}
                    onChange={(e) => updateTypography({ headingWeight: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Letter Spacing</Label>
                  <Input
                    value={theme.typography.letterSpacing}
                    onChange={(e) => updateTypography({ letterSpacing: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buttons" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Button Styles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Border Radius</Label>
                  <Input
                    value={theme.buttons.borderRadius}
                    onChange={(e) => updateButtons({ borderRadius: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Input
                    value={theme.buttons.fontSize}
                    onChange={(e) => updateButtons({ fontSize: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Font Weight</Label>
                  <Input
                    type="number"
                    value={theme.buttons.fontWeight}
                    onChange={(e) => updateButtons({ fontWeight: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Padding X</Label>
                  <Input
                    value={theme.buttons.paddingX}
                    onChange={(e) => updateButtons({ paddingX: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Padding Y</Label>
                  <Input
                    value={theme.buttons.paddingY}
                    onChange={(e) => updateButtons({ paddingY: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Variant</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                  value={theme.buttons.variant}
                  onChange={(e) => updateButtons({ variant: e.target.value as "filled" | "outline" | "ghost" | "glass" })}
                >
                  <option value="filled">Filled</option>
                  <option value="outline">Outline</option>
                  <option value="ghost">Ghost</option>
                  <option value="glass">Glass</option>
                </select>
              </div>
              <div className="pt-4">
                <Button>Preview Button</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="effects" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Visual Effects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Glass Blur</Label>
                  <Input
                    value={theme.effects.glassBlur}
                    onChange={(e) => updateEffects({ glassBlur: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Glass Opacity</Label>
                  <Input
                    value={theme.effects.glassOpacity}
                    onChange={(e) => updateEffects({ glassOpacity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Border Radius</Label>
                  <Input
                    value={theme.effects.borderRadius}
                    onChange={(e) => updateEffects({ borderRadius: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Blur Strength</Label>
                  <Input
                    value={theme.effects.blurStrength}
                    onChange={(e) => updateEffects({ blurStrength: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Layout Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Width</Label>
                  <Input
                    value={theme.layout.maxWidth}
                    onChange={(e) => updateLayout({ maxWidth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Container Padding</Label>
                  <Input
                    value={theme.layout.containerPadding}
                    onChange={(e) => updateLayout({ containerPadding: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Section Gap</Label>
                  <Input
                    value={theme.layout.sectionGap}
                    onChange={(e) => updateLayout({ sectionGap: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grid Gap</Label>
                  <Input
                    value={theme.layout.gridGap}
                    onChange={(e) => updateLayout({ gridGap: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="animations" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Animation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">Page Transitions</p>
                    <p className="text-xs text-muted-foreground">Enable smooth page transitions</p>
                  </div>
                  <Switch
                    checked={theme.animations.enablePageTransitions}
                    onCheckedChange={(v) => updateAnimations({ enablePageTransitions: v })}
                  />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">Scroll Animations</p>
                    <p className="text-xs text-muted-foreground">Animate elements on scroll</p>
                  </div>
                  <Switch
                    checked={theme.animations.enableScrollAnimations}
                    onCheckedChange={(v) => updateAnimations({ enableScrollAnimations: v })}
                  />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">Hover Effects</p>
                    <p className="text-xs text-muted-foreground">Enable hover micro-interactions</p>
                  </div>
                  <Switch
                    checked={theme.animations.enableHoverEffects}
                    onCheckedChange={(v) => updateAnimations({ enableHoverEffects: v })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    value={theme.animations.duration}
                    onChange={(e) => updateAnimations({ duration: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stagger Delay (s)</Label>
                  <Input
                    type="number"
                    step="0.05"
                    value={theme.animations.staggerDelay}
                    onChange={(e) => updateAnimations({ staggerDelay: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brand" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Brand Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Brand Name</Label>
                  <Input
                    value={theme.brand.name}
                    onChange={(e) => updateBrand({ name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input
                    value={theme.brand.tagline}
                    onChange={(e) => updateBrand({ tagline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <Input
                    value={theme.brand.logo}
                    onChange={(e) => updateBrand({ logo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Favicon URL</Label>
                  <Input
                    value={theme.brand.favicon}
                    onChange={(e) => updateBrand({ favicon: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
