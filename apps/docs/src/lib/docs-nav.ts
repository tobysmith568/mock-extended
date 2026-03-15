export type DocNavItem = {
  href: string;
  title: string;
  description: string;
};

export const docsNavItems: DocNavItem[] = [
  {
    href: "/docs/why-mock-extended",
    title: "Why mock-extended",
    description:
      "Understand where mock-extended fits and what problems it removes.",
  },
  {
    href: "/docs/getting-started",
    title: "Getting Started",
    description: "Install quickly and build your first typed mock in minutes.",
  },
  {
    href: "/docs/features",
    title: "Features",
    description:
      "Explore deep mocks, strict typing, and framework-agnostic patterns.",
  },
  {
    href: "/docs/examples",
    title: "Examples",
    description:
      "Copy practical snippets for Jest, Vitest, Bun, and Node tests.",
  },
];

export function isActiveLink(currentPath: string, href: string): boolean {
  return currentPath === href;
}
