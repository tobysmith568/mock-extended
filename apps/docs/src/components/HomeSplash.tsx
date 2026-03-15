const highlights = [
  "Framework-agnostic mock functions",
  "Deep recursive object mocking",
  "Typed ergonomics without runtime clutter",
];

export function HomeSplash() {
  return (
    <section className="splash" aria-labelledby="hero-title">
      <p className="splash-kicker">mock-extended</p>
      <h1 id="hero-title">Type-safe mocks without the framework lock-in.</h1>
      <p className="splash-summary">
        Build resilient test doubles for interfaces and classes using your
        preferred test runner, while keeping strict TypeScript behavior across
        the entire suite.
      </p>
      <div className="splash-actions">
        <a className="button button-primary" href="/docs/getting-started">
          Start in 2 minutes
        </a>
        <a className="button button-secondary" href="/docs">
          Read the docs
        </a>
      </div>
      <ul className="splash-highlights">
        {highlights.map((item) => (
          <li>{item}</li>
        ))}
      </ul>
    </section>
  );
}
