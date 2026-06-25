"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { MASTER_FIELDS, MASTER_TABLE_COLUMNS, type MasterField, type MasterFieldGroup } from "@/lib/master-fields";
import { masterItemSchema, type MasterItemInput } from "@/lib/schemas/master";
import styles from "./MasterPage.module.css";

interface MasterData {
  id: string;
  companyId: string;
  category: string;
  code: string;
  name: string;
  status: "AKTIF" | "NONAKTIF";
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

interface MasterPageProps {
  category: keyof typeof MASTER_FIELDS;
  title: string;
  subtitle: string;
  fieldGroups: MasterFieldGroup[];
  tableColumns: string[];
}

export function MasterPage({ category, title, subtitle, fieldGroups, tableColumns }: MasterPageProps) {
  const [data, setData] = useState<MasterData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "AKTIF" | "NONAKTIF">("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/master/${category}?${params}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      const json = await res.json();
      setData(json.data);
      setTotal(json.total);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [category, page, pageSize, search, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNew = () => {
    setEditingId(null);
    setDrawerOpen(true);
  };

  const handleEdit = (item: MasterData) => {
    setEditingId(item.id);
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus item ini?")) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/master/${category}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Gagal menghapus");
        await fetchData();
      } catch (e: any) {
        alert(e.message);
      }
    });
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <Button onClick={handleNew}>
          <Icons.Plus size={16} />
          Tambah
        </Button>
      </header>

      <Card>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Icons.Search size={16} className={styles.searchIcon} />
            <input
              type="search"
              placeholder="Cari nama atau kode..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className={styles.search}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className={styles.statusSelect}
          >
            <option value="">Semua Status</option>
            <option value="AKTIF">Aktif</option>
            <option value="NONAKTIF">Non-Aktif</option>
          </select>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {tableColumns.map((col) => (
                  <th key={col}>{col === "status" ? "Status" : col.charAt(0).toUpperCase() + col.slice(1)}</th>
                ))}
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={tableColumns.length + 1} className={styles.empty}>
                    Memuat\u2026
                  </td>
                </tr>
              )}
              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan={tableColumns.length + 1} className={styles.empty}>
                    Belum ada data. Klik &ldquo;Tambah&rdquo; untuk membuat baru.
                  </td>
                </tr>
              )}
              {!loading && data.map((item) => (
                <tr key={item.id}>
                  {tableColumns.map((col) => {
                    const value = col === "status" ? (
                      <Badge variant={item.status === "AKTIF" ? "approved" : "neutral"}>
                        {item.status === "AKTIF" ? "Aktif" : "Non-Aktif"}
                      </Badge>
                    ) : col === "code" || col === "name" ? (
                      <span className={styles.codeName}>{String(item[col as keyof MasterData] ?? "-")}</span>
                    ) : (
                      String((item.metadata ?? {})[col] ?? item[col as keyof MasterData] ?? "-")
                    );
                    return <td key={col}>{value}</td>;
                  })}
                  <td>
                    <div className={styles.actions}>
                      <button type="button" onClick={() => handleEdit(item)} className={styles.iconBtn} aria-label="Edit">
                        <Icons.Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => handleDelete(item.id)} className={cn(styles.iconBtn, styles.iconBtnDanger)} aria-label="Hapus">
                        <Icons.Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            Menampilkan {data.length} dari {total} data
          </div>
          <div className={styles.pageNav}>
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              <Icons.ChevronLeft size={14} />
            </Button>
            <span className={styles.pageNum}>
              {page} / {totalPages || 1}
            </span>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <Icons.ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </Card>

      {error && <div className={styles.error}>{error}</div>}

      {drawerOpen && (
        <MasterDrawer
          category={category}
          fieldGroups={fieldGroups}
          editingId={editingId}
          onClose={() => setDrawerOpen(false)}
          onSaved={() => {
            setDrawerOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function MasterDrawer({
  category,
  fieldGroups,
  editingId,
  onClose,
  onSaved,
}: {
  category: string;
  fieldGroups: MasterFieldGroup[];
  editingId: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<any>({
    defaultValues: { name: "", code: "", status: "AKTIF" },
  });

  useEffect(() => {
    if (!editingId) return;
    setLoading(true);
    fetch(`/api/master/${category}/${editingId}`)
      .then((r) => r.json())
      .then((data) => {
        setInitialData(data);
        // Set values from data + metadata
        setValue("name", data.name);
        setValue("code", data.code);
        setValue("status", data.status);
        const meta = data.metadata ?? {};
        for (const group of fieldGroups) {
          for (const field of group.fields) {
            if (field.key === "name" || field.key === "code" || field.key === "status") continue;
            setValue(field.key, meta[field.key] ?? "");
          }
        }
      })
      .finally(() => setLoading(false));
  }, [editingId, category, fieldGroups, setValue]);

  const onSubmit = (data: any) => {
    startTransition(async () => {
      try {
        // Extract name/code/status ke top level, sisanya ke metadata
        const { name, code, status, ...rest } = data;
        const metadata: any = {};
        for (const group of fieldGroups) {
          for (const field of group.fields) {
            if (field.key === "name" || field.key === "code" || field.key === "status") continue;
            if (rest[field.key]) metadata[field.key] = rest[field.key];
          }
        }

        const payload = { name, code, status: status || "AKTIF", metadata };
        const url = editingId ? `/api/master/${category}/${editingId}` : `/api/master/${category}`;
        const method = editingId ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Gagal menyimpan");
        }

        onSaved();
      } catch (e: any) {
        alert(e.message);
      }
    });
  };

  return (
    <div className={styles.drawerBackdrop} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>
            {editingId ? "Edit" : "Tambah"} {category}
          </h2>
          <button onClick={onClose} className={styles.iconBtn} aria-label="Close">
            <Icons.X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.drawerBody}>
          {loading ? (
            <div className={styles.empty}>Memuat\u2026</div>
          ) : (
            <>
              {fieldGroups.map((group) => (
                <fieldset key={group.title} className={styles.fieldset}>
                  <legend className={styles.legend}>{group.title}</legend>
                  {group.fields.map((field) => (
                    <div key={field.key} className={styles.field}>
                      <label htmlFor={field.key} className={styles.label}>
                        {field.label}
                        {field.required && <span className={styles.required}>*</span>}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          id={field.key}
                          rows={field.rows ?? 3}
                          placeholder={field.placeholder}
                          className={styles.textarea}
                          {...register(field.key, { required: field.required })}
                        />
                      ) : field.type === "select" ? (
                        <select id={field.key} className={styles.input} {...register(field.key, { required: field.required })}>
                          <option value="">-- Pilih --</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={field.key}
                          type={field.type}
                          placeholder={field.placeholder}
                          className={styles.input}
                          {...register(field.key, { required: field.required })}
                        />
                      )}
                    </div>
                  ))}
                </fieldset>
              ))}
              {editingId && (
                <div className={styles.field}>
                  <label className={styles.label}>Status</label>
                  <select {...register("status")} className={styles.input}>
                    <option value="AKTIF">Aktif</option>
                    <option value="NONAKTIF">Non-Aktif</option>
                  </select>
                </div>
              )}
            </>
          )}
          <div className={styles.drawerFooter}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan\u2026" : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}