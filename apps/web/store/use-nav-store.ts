import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NavItem, FooterConfig } from "@/types/cms";

const defaultFooter: FooterConfig = {
  columns: [
    {
      id: "product",
      title: "Product",
      links: [
        { label: "Features", href: "#" },
        { label: "Pricing", href: "/pricing" },
        { label: "Automation Store", href: "/automation-store" },
        { label: "Integrations", href: "#" },
      ],
    },
    {
      id: "company",
      title: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "/contact" },
      ],
    },
  ],
  bottomText: "All rights reserved.",
  showSocialIcons: true,
  socialLinks: [
    { platform: "Twitter", url: "#", icon: "twitter" },
    { platform: "GitHub", url: "#", icon: "github" },
    { platform: "LinkedIn", url: "#", icon: "linkedin" },
  ],
  showNewsletter: true,
};

interface NavStoreState {
  navItems: NavItem[];
  footer: FooterConfig;
  setNavItems: (items: NavItem[]) => void;
  addNavItem: (item: NavItem) => void;
  updateNavItem: (id: string, updates: Partial<NavItem>) => void;
  deleteNavItem: (id: string) => void;
  reorderNavItems: (items: NavItem[]) => void;
  updateFooter: (updates: Partial<FooterConfig>) => void;
  resetFooter: () => void;
}

export const useNavStore = create<NavStoreState>()(
  persist(
    (set) => ({
      navItems: [
        {
          id: "home",
          label: "Home",
          href: "/",
          order: 0,
          visible: true,
          roles: ["public"],
          children: [],
          megaMenu: false,
        },
        {
          id: "pricing",
          label: "Pricing",
          href: "/pricing",
          order: 1,
          visible: true,
          roles: ["public"],
          children: [],
          megaMenu: false,
        },
        {
          id: "docs",
          label: "Documentation",
          href: "/documentation",
          order: 2,
          visible: true,
          roles: ["public"],
          children: [],
          megaMenu: false,
        },
        {
          id: "contact",
          label: "Contact",
          href: "/contact",
          order: 3,
          visible: true,
          roles: ["public"],
          children: [],
          megaMenu: false,
        },
      ],
      footer: defaultFooter,

      setNavItems: (items) => set({ navItems: items }),
      addNavItem: (item) =>
        set((state) => ({ navItems: [...state.navItems, item] })),
      updateNavItem: (id, updates) =>
        set((state) => ({
          navItems: updateNestedNavItem(state.navItems, id, updates),
        })),
      deleteNavItem: (id) =>
        set((state) => ({
          navItems: removeNestedNavItem(state.navItems, id),
        })),
      reorderNavItems: (items) => set({ navItems: items }),
      updateFooter: (updates) =>
        set((state) => ({
          footer: { ...state.footer, ...updates },
        })),
      resetFooter: () => set({ footer: defaultFooter }),
    }),
    { name: "buildagent-nav-config" }
  )
);

function updateNestedNavItem(
  items: NavItem[],
  id: string,
  updates: Partial<NavItem>
): NavItem[] {
  return items.map((item) => {
    if (item.id === id) return { ...item, ...updates };
    if (item.children.length > 0)
      return { ...item, children: updateNestedNavItem(item.children, id, updates) };
    return item;
  });
}

function removeNestedNavItem(items: NavItem[], id: string): NavItem[] {
  return items
    .filter((item) => item.id !== id)
    .map((item) => ({
      ...item,
      children: removeNestedNavItem(item.children, id),
    }));
}
