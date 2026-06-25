import Link from "next/link";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main id="main-content" className={styles.main}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.logo}>GPT</div>
          <div>
            <h1 className={styles.title}>GPT-ERP</h1>
            <p className={styles.subtitle}>Daniswara Group Enterprise System</p>
          </div>
        </div>

        <p className={styles.lead}>
          Sistem ERP multi-company untuk PT. Ganendra Arsyila Semesta &
          PT. Daniswara Jaya Perkasa. Dibangun dari nol dengan Next.js 15,
          Prisma, dan PostgreSQL.
        </p>

        <div className={styles.status}>
          <div className={styles.statusDot} data-status="ok" />
          <span>Phase 0 \u2014 Repo &amp; Infrastructure</span>
        </div>

        <div className={styles.ctas}>
          <Link href="/login" className={styles.ctaPrimary}>
            Masuk
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className={styles.ctaSecondary}
          >
            Repository
          </a>
        </div>

        <div className={styles.stack}>
          <h2 className={styles.stackTitle}>Stack</h2>
          <ul className={styles.stackList}>
            <li>Next.js 15 (App Router) + React 19</li>
            <li>Prisma 6 + PostgreSQL (Neon)</li>
            <li>Auth.js v5 + Argon2id</li>
            <li>TanStack Query + Zustand + RHF + Zod</li>
            <li>Vercel Blob + Vercel Deploy</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
