"use client";

import { useState, useEffect, useCallback } from "react";
import * as Icons from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  company: { code: string; name: string };
  division: { code: string; name: string } | null;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editing, setEditing] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      const res = await fetch(`/api/users?${params}`);
      const json = await res.json();
      setUsers(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSave = async (id: string, changes: { role?: string; isActive?: boolean }) => {
    setError(null);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal");
      }
      setEditing(null);
      fetchUsers();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>User Management</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: 14 }}>{users.length} user \u00b7 Admin only</p>
        </div>
      </header>

      {error && <div style={{ padding: 12, background: "var(--status-rejected-bg)", color: "var(--status-rejected)", borderRadius: 6, fontSize: 13 }}>{error}</div>}

      <Card>
        <div style={{ display: "flex", gap: 8, padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
            <Icons.Search size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input type="search" placeholder="Cari nama atau email..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: "8px 10px 8px 34px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 13, color: "var(--text)" }} />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: "8px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 13 }}>
            <option value="">Semua Role</option>
            <option value="ADMIN">Admin</option>
            <option value="DIREKTUR">Direktur</option>
            <option value="MANAGER">Manager</option>
            <option value="SPV">SPV</option>
            <option value="FINANCE">Finance</option>
            <option value="OP">OP</option>
            <option value="GA">GA</option>
            <option value="HR">HR</option>
          </select>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "12px 16px", background: "var(--surface-2)", color: "var(--text-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid var(--border)" }}>Nama</th>
              <th style={{ textAlign: "left", padding: "12px 16px", background: "var(--surface-2)", color: "var(--text-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid var(--border)" }}>Email</th>
              <th style={{ textAlign: "left", padding: "12px 16px", background: "var(--surface-2)", color: "var(--text-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid var(--border)" }}>Role</th>
              <th style={{ textAlign: "left", padding: "12px 16px", background: "var(--surface-2)", color: "var(--text-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid var(--border)" }}>Divisi</th>
              <th style={{ textAlign: "left", padding: "12px 16px", background: "var(--surface-2)", color: "var(--text-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid var(--border)" }}>Status</th>
              <th style={{ textAlign: "left", padding: "12px 16px", background: "var(--surface-2)", color: "var(--text-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid var(--border)" }}></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>Memuat\u2026</td></tr>}
            {!loading && users.length === 0 && <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>Tidak ada user</td></tr>}
            {!loading && users.map((u) => (
              <tr key={u.id}>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}><strong>{u.name}</strong></td>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>{u.email}</td>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}><Badge variant={u.role === "ADMIN" ? "approved" : "neutral"}>{u.role}</Badge></td>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>{u.division?.name ?? "-"}</td>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>{u.isActive ? <Badge variant="approved">Aktif</Badge> : <Badge variant="rejected">Non-Aktif</Badge>}</td>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                  <Button variant="secondary" size="sm" onClick={() => setEditing(u)}>
                    <Icons.Pencil size={12} /> Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", justifyContent: "flex-end" }} onClick={() => setEditing(null)}>
          <div style={{ width: "100%", maxWidth: 400, background: "var(--surface)", height: "100vh", display: "flex", flexDirection: "column", boxShadow: "var(--shadow-lg)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Edit User</h2>
              <button onClick={() => setEditing(null)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", borderRadius: 6 }}>
                <Icons.X size={18} />
              </button>
            </div>
            <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", textTransform: "uppercase", letterSpacing: 0.5 }}>Nama</label>
                <div style={{ padding: "8px 12px", background: "var(--surface-2)", borderRadius: 6, fontSize: 13, color: "var(--text-muted)" }}>{editing.name}</div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", textTransform: "uppercase", letterSpacing: 0.5 }}>Email</label>
                <div style={{ padding: "8px 12px", background: "var(--surface-2)", borderRadius: 6, fontSize: 13, color: "var(--text-muted)" }}>{editing.email}</div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", textTransform: "uppercase", letterSpacing: 0.5 }}>Role</label>
                <select id="role-select" defaultValue={editing.role} style={{ padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: 6, fontSize: 13, color: "var(--text)", width: "100%" }}>
                  <option value="ADMIN">ADMIN</option>
                  <option value="DIREKTUR">DIREKTUR</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="SPV">SPV</option>
                  <option value="FINANCE">FINANCE</option>
                  <option value="OP">OP</option>
                  <option value="GA">GA</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", textTransform: "uppercase", letterSpacing: 0.5 }}>Status</label>
                <select id="active-select" defaultValue={editing.isActive ? "true" : "false"} style={{ padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: 6, fontSize: 13, color: "var(--text)", width: "100%" }}>
                  <option value="true">Aktif</option>
                  <option value="false">Non-Aktif</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                <Button variant="secondary" onClick={() => setEditing(null)}>Batal</Button>
                <Button onClick={() => {
                  const role = (document.getElementById("role-select") as HTMLSelectElement).value;
                  const isActive = (document.getElementById("active-select") as HTMLSelectElement).value === "true";
                  handleSave(editing.id, { role, isActive });
                }}>Simpan</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}