import * as Icons from "lucide-react";
import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.wrap}>
      <div className={styles.spinner}>
        <Icons.Loader2 size={32} />
      </div>
      <p className={styles.text}>Memuat\u2026</p>
    </div>
  );
}