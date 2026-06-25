import { LoginForm } from "./LoginForm";
import styles from "./login.module.css";

export const metadata = {
  title: "Masuk \u2014 GPT-ERP",
};

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  return (
    <main id="main-content" className={styles.main}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logo}>GPT</div>
          <h1 className={styles.title}>GPT-ERP</h1>
          <p className={styles.subtitle}>Daniswara Group Enterprise System</p>
        </div>

        <LoginForm callbackUrl={params.callbackUrl} initialError={params.error} />

        <div className={styles.hint}>
          <strong>Demo credentials:</strong>
          <code>admin@gpt-erp.local</code> / <code>Admin@2026!</code>
        </div>
      </div>
    </main>
  );
}