import Link from "next/link";
import * as Icons from "lucide-react";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main id="main-content" className={styles.main}>
      <div className={styles.card}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Halaman Tidak Ditemukan</h1>
        <p className={styles.subtitle}>
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <div className={styles.actions}>
          <Link href="/dashboard" className={styles.primary}>
            <Icons.Home size={16} /> Kembali ke Dashboard
          </Link>
          <Link href="/login" className={styles.secondary}>
            <Icons.LogIn size={16} /> Login
          </Link>
        </div>
      </div>
    </main>
  );
}