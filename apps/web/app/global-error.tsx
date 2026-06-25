"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import styles from "./error.module.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log ke console (bisa integrate Sentry dll di production)
    console.error("Application error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <main className={styles.main}>
          <div className={styles.card}>
            <div className={styles.icon}>
              <Icons.AlertOctagon size={48} />
            </div>
            <h1 className={styles.title}>Terjadi Kesalahan</h1>
            <p className={styles.subtitle}>
              Aplikasi mengalami error tak terduga. Tim kami sudah otomatis menerima notifikasi.
            </p>
            {error.digest && (
              <p className={styles.digest}>Error ID: {error.digest}</p>
            )}
            <div className={styles.actions}>
              <button onClick={() => reset()} className={styles.primary}>
                <Icons.RefreshCw size={16} /> Coba Lagi
              </button>
              <Link href="/dashboard" className={styles.secondary}>
                <Icons.Home size={16} /> Dashboard
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}