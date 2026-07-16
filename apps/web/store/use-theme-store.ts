import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeConfig } from "@/types/cms";

const defaultTheme: ThemeConfig = {
  brand: {
    name: "BUILDAGENT",
    logo: "/logo.svg",
    favicon: "/favicon.ico",
    tagline: "Enterprise AI Workforce Operating System",
  },
  colors: {
    primary: "#ffffff",
    secondary: "#1a1a1a",
    accent: "#6366f1",
    background: "#000000",
    foreground: "#fafafa",
    muted: "#a1a1aa",
    border: "#27272a",
    ring: "#ffffff",
    gradientPrimary: "linear-gradient(135deg, #ffffff 0%, #6366f1 100%)",
    gradientSecondary: "linear-gradient(135deg, #1a1a1a 0%, #000000 100%)",
  },
  typography: {
    headingFont: "Inter, sans-serif",
    bodyFont: "Inter, sans-serif",
    monoFont: "JetBrains Mono, monospace",
    baseSize: 16,
    scale: 1.25,
    headingWeight: 700,
    bodyWeight: 400,
    letterSpacing: "-0.02em",
    lineHeight: 1.6,
  },
  buttons: {
    borderRadius: "0.75rem",
    paddingX: "1.5rem",
    paddingY: "0.75rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    transitionDuration: "200ms",
    variant: "glass",
  },
  effects: {
    glassBlur: "24px",
    glassOpacity: "0.03",
    shadowSize: "0 0 40px",
    shadowOpacity: "0.05",
    borderRadius: "0.75rem",
    blurStrength: "24px",
  },
  layout: {
    maxWidth: "1280px",
    containerPadding: "2rem",
    sectionGap: "6rem",
    gridGap: "1.5rem",
  },
  darkMode: {
    enabled: true,
    defaultMode: "dark",
    primary: "#ffffff",
    background: "#000000",
    foreground: "#fafafa",
    muted: "#a1a1aa",
    border: "#27272a",
  },
  animations: {
    enablePageTransitions: true,
    enableScrollAnimations: true,
    enableHoverEffects: true,
    duration: "400ms",
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    staggerDelay: 0.1,
  },
  cursor: {
    customCursor: false,
    color: "#ffffff",
    size: 20,
    trail: false,
  },
};

interface ThemeStoreState {
  theme: ThemeConfig;
  activeTheme: "light" | "dark";
  setTheme: (theme: ThemeConfig) => void;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  updateBrand: (updates: Partial<ThemeConfig["brand"]>) => void;
  updateColors: (updates: Partial<ThemeConfig["colors"]>) => void;
  updateTypography: (updates: Partial<ThemeConfig["typography"]>) => void;
  updateButtons: (updates: Partial<ThemeConfig["buttons"]>) => void;
  updateEffects: (updates: Partial<ThemeConfig["effects"]>) => void;
  updateLayout: (updates: Partial<ThemeConfig["layout"]>) => void;
  updateDarkMode: (updates: Partial<ThemeConfig["darkMode"]>) => void;
  updateAnimations: (updates: Partial<ThemeConfig["animations"]>) => void;
  toggleTheme: () => void;
  resetTheme: () => void;
  applyTheme: () => void;
}

export const useThemeStore = create<ThemeStoreState>()(
  persist(
    (set, get) => ({
      theme: defaultTheme,
      activeTheme: "dark",

      setTheme: (theme) => set({ theme }),
      updateTheme: (updates) =>
        set((state) => ({ theme: { ...state.theme, ...updates } })),

      updateBrand: (updates) =>
        set((state) => ({
          theme: { ...state.theme, brand: { ...state.theme.brand, ...updates } },
        })),

      updateColors: (updates) =>
        set((state) => ({
          theme: { ...state.theme, colors: { ...state.theme.colors, ...updates } },
        })),

      updateTypography: (updates) =>
        set((state) => ({
          theme: { ...state.theme, typography: { ...state.theme.typography, ...updates } },
        })),

      updateButtons: (updates) =>
        set((state) => ({
          theme: { ...state.theme, buttons: { ...state.theme.buttons, ...updates } },
        })),

      updateEffects: (updates) =>
        set((state) => ({
          theme: { ...state.theme, effects: { ...state.theme.effects, ...updates } },
        })),

      updateLayout: (updates) =>
        set((state) => ({
          theme: { ...state.theme, layout: { ...state.theme.layout, ...updates } },
        })),

      updateDarkMode: (updates) =>
        set((state) => ({
          theme: { ...state.theme, darkMode: { ...state.theme.darkMode, ...updates } },
        })),

      updateAnimations: (updates) =>
        set((state) => ({
          theme: { ...state.theme, animations: { ...state.theme.animations, ...updates } },
        })),

      toggleTheme: () =>
        set((state) => ({
          activeTheme: state.activeTheme === "dark" ? "light" : "dark",
        })),

      resetTheme: () => set({ theme: defaultTheme }),

      applyTheme: () => {
        const { theme } = get();
        const root = document.documentElement;
        const c = theme.colors;
        const e = theme.effects;
        const t = theme.typography;

        root.style.setProperty("--primary", c.primary);
        root.style.setProperty("--secondary", c.secondary);
        root.style.setProperty("--accent", c.accent);
        root.style.setProperty("--background", c.background);
        root.style.setProperty("--foreground", c.foreground);
        root.style.setProperty("--muted", c.muted);
        root.style.setProperty("--border-color", c.border);
        root.style.setProperty("--radius", e.borderRadius);
        root.style.setProperty("--glass-blur", e.glassBlur);
        root.style.setProperty("--glass-opacity", e.glassOpacity);
        root.style.setProperty("--shadow-size", e.shadowSize);
        root.style.setProperty("--shadow-opacity", e.shadowOpacity);
        root.style.setProperty("--font-heading", t.headingFont);
        root.style.setProperty("--font-body", t.bodyFont);
        root.style.setProperty("--font-mono", t.monoFont);
        root.style.setProperty("--font-size-base", `${t.baseSize}px`);
        root.style.setProperty("--font-scale", String(t.scale));
        root.style.setProperty("--letter-spacing", t.letterSpacing);
        root.style.setProperty("--line-height", String(t.lineHeight));
        root.style.setProperty("--btn-radius", theme.buttons.borderRadius);
        root.style.setProperty("--btn-padding-x", theme.buttons.paddingX);
        root.style.setProperty("--btn-padding-y", theme.buttons.paddingY);
        root.style.setProperty("--btn-font-size", theme.buttons.fontSize);
        root.style.setProperty("--max-width", theme.layout.maxWidth);
        root.style.setProperty("--container-padding", theme.layout.containerPadding);
        root.style.setProperty("--section-gap", theme.layout.sectionGap);
        root.style.setProperty("--grid-gap", theme.layout.gridGap);
      },
    }),
    { name: "buildagent-theme-config" }
  )
);
