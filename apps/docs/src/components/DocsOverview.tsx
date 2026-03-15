import { docsNavItems } from "../lib/docs-nav";

export function DocsOverview() {
  return (
    <section aria-labelledby="docs-overview-title">
      <h1 id="docs-overview-title">Documentation</h1>
      <p>
        Follow the path from motivation to implementation details. Every guide
        is short, practical, and designed to help you move from setup to
        confident usage.
      </p>
      <div className="docs-grid">
        {docsNavItems.map((item) => (
          <article className="docs-card">
            <h2>
              <a href={item.href}>{item.title}</a>
            </h2>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
