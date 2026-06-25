"use client";

import { useState, useTransition } from "react";
import * as Icons from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface ProfilePageProps {
  user: { id: string; name: string; email: string; role: string; companyCode: string; divisionCode: string | null };
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleSubmit = () => {
    setMessage(null);
    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: "err", text: "Password baru tidak sama" });
      return;
    }
    startTransition(async () => {
      try {
        const body: any = { name };
        if (newPassword) {
          body.currentPassword = currentPassword;
          body.newPassword = newPassword;
        }
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Gagal");
        }
        setMessage({ type: "ok", text: "Profil berhasil diupdate" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (e: any) {
        setMessage({ type: "err", text: e.message });
      }
    });
  };

  const msgStyle = (type: "ok" | "err"): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: 12,
    background: type === "ok" ? "var(--status-approved-bg)" : "var(--status-rejected-bg)",
    color: type === "ok" ? "var(--status-approved)" : "var(--status-rejected)",
    borderRadius: 6,
    fontSize: 13,
    marginBottom: 12,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Profil Saya</h1>
        <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: 14 }}>Update informasi akun & password</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
        <Card>
          <CardHeader><CardTitle>Informasi Akun</CardTitle></CardHeader>
          <CardContent>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 64, height: 64, background: "var(--brand-amber)", color: "var(--brand-navy)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 24, flexShrink: 0 }}>{user.name.charAt(0).toUpperCase()}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{user.name}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2, fontFamily: "var(--font-mono)" }}>{user.email}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
                  <Badge variant="approved">{user.role}</Badge>
                  <span>{user.companyCode}</span>
                  {user.divisionCode && <span>\u00b7 {user.divisionCode}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Edit Profil</CardTitle></CardHeader>
          <CardContent>
            {message && (
              <div style={msgStyle(message.type)}>
                {message.type === "ok" ? <Icons.CheckCircle size={14} /> : <Icons.AlertCircle size={14} />}
                {message.text}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", textTransform: "uppercase", letterSpacing: 0.5 }}>Nama</label>
              <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: 6, fontSize: 13, color: "var(--text)" }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0", fontSize: 11, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span>Ganti Password (opsional)</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", textTransform: "uppercase", letterSpacing: 0.5 }}>Password Lama</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={{ padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: 6, fontSize: 13, color: "var(--text)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", textTransform: "uppercase", letterSpacing: 0.5 }}>Password Baru (min 8 karakter)</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: 6, fontSize: 13, color: "var(--text)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", textTransform: "uppercase", letterSpacing: 0.5 }}>Konfirmasi Password Baru</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: 6, fontSize: 13, color: "var(--text)" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Menyimpan\u2026" : "Simpan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}