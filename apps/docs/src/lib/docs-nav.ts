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
      "Understand the design goals, tradeoffs, and where a framework-agnostic mock builder fits best.",
  },
  {
    href: "/docs/getting-started",
    title: "Getting Started",
    description:
      "Install the package, create a builder from your mock factory, and seed your first mocks.",
  },
  {
    href: "/docs/features",
    title: "Features",
    description:
      "See how lazy creation, partial values, deep mode, and ignored properties behave in practice.",
  },
  {
    href: "/docs/examples",
    title: "Examples",
    description:
      "Copy accurate examples for Jest, Vitest, Bun, Sinon, node:test, and deep mock scenarios.",
  },
];

export function isActiveLink(currentPath: string, href: string): boolean {
  return currentPath === href;
}
