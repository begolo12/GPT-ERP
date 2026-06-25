import { redirect } from "next/navigation";

export default function HomePage() {
  // Phase 3: cek session, kalau belum login ke /login
  redirect("/dashboard");
}