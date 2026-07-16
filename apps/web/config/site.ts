export const siteConfig = {
  name: "BUILDAGENT",
  description: "Enterprise AI Workforce Operating System",
  tagline: "Build. Deploy. Scale. Intelligence.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.jpg",
  links: {
    twitter: "https://twitter.com/buildagent",
    github: "https://github.com/buildagent",
    docs: "/documentation",
  },
};

export type SiteConfig = typeof siteConfig;