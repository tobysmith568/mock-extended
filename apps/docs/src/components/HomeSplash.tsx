import styles from "./HomeSplash.module.css";

const compatibilityItems = [
  {
    name: "Jest, Vitest, Bun, node:test, Sinon, and more",
    detail: "Plug in your own mock function style while keeping one typed API.",
  },
  {
    name: "Zero runtime dependencies",
    detail: "Keep your dependency tree lean with no framework lock-in baggage.",
  },
  {
    name: "Built for migrations",
    detail:
      "Switch runners and runtimes without rewriting your typed mocks from scratch.",
  },
];

export function HomeSplash() {
  return (
    <section className={styles.splash} aria-labelledby="hero-title">
      <p className={styles.splashKicker}>mock-extended</p>
      <h1 id="hero-title" className={styles.splashTitle}>
        Type-safe mocks without the framework lock-in.
      </h1>
      <p className={styles.splashSummary}>
        Build resilient test doubles for interfaces and classes using your
        preferred test runner, while keeping strict TypeScript behavior across
        the entire suite.
      </p>
      <div className={styles.splashActions}>
        <a
          className={`${styles.button} ${styles.buttonPrimary}`}
          href="/docs/getting-started"
        >
          Get started
        </a>
        <a
          className={`${styles.button} ${styles.buttonSecondary}`}
          href="/docs/examples"
        >
          Browse examples
        </a>
      </div>
      <section
        className={styles.compatibility}
        aria-label="Why teams choose mock-extended"
      >
        <ul className={styles.compatibilityList}>
          {compatibilityItems.map((item) => (
            <li className={styles.compatibilityItem}>
              <p className={styles.compatibilityName}>{item.name}</p>
              <p className={styles.compatibilityDetail}>{item.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
