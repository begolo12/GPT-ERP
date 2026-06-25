"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatIDR, formatDate } from "@/lib/format";
import styles from "./TxList.module.css";

interface TxItem {
  id: string;
  code: string;
  date: string;
  description: string;
  amount: number;
  approvalStatus: string;
  vendorName: string | null;
  projectName: string | null;
  refCode: string | null;
}

interface TxListProps {
  type: "PR" | "PO" | "DO" | "GR" | "FAKTUR" | "QUOTATION" | "SO" | "SURAT_JALAN" | "PEMBAYARAN" | "JURNAL_MEMORIAL" | "HUTANG" | "PENGADAAN_GA" | "PERAWATAN_KENDARAAN" | "PENGGAJIAN";
  title: string;
  subtitle: string;
  createHref: string;
  detailHrefBase: string;
}

export function TxList({ type, title, subtitle, createHref, detailHrefBase }: TxListProps) {
  const router = useRouter();
  const [data, setData] = useState<TxItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pageSize = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/transactions/${type}?${params}`);
      const json = await res.json();
      setData(json.data);
      setTotal(json.total);
    } finally {
      setLoading(false);
    }
  }, [type, page, search, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <Button onClick={() => router.push(createHref)}>
          <Icons.Plus size={16} /> Buat {type}
        </Button>
      </header>

      <Card>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Icons.Search size={16} className={styles.searchIcon} />
            <input
              type="search"
              placeholder="Cari kode, deskripsi, vendor..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className={styles.search}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className={styles.filter}
          >
            <option value="">Semua Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="REVISED">Revised</option>
          </select>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Tanggal</th>
                <th>Deskripsi</th>
                <th>Vendor</th>
                <th>Proyek</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className={styles.empty}>Memuat\u2026</td></tr>}
              {!loading && data.length === 0 && <tr><td colSpan={7} className={styles.empty}>Belum ada data. Klik &ldquo;Buat {type}&rdquo; untuk membuat baru.</td></tr>}
              {!loading && data.map((item) => (
                <tr key={item.id} onClick={() => router.push(detailHrefBase + "/" + item.id)} className={styles.row}>
                  <td className={styles.codeCell}>
                    {item.code}
                    {item.refCode && <span className={styles.refBadge}><Icons.Link size={10} /> {item.refCode}</span>}
                  </td>
                  <td>{formatDate(item.date)}</td>
                  <td className={styles.descCell}>{item.description}</td>
                  <td>{item.vendorName ?? "-"}</td>
                  <td>{item.projectName ?? "-"}</td>
                  <td className={styles.amountCell}>{formatIDR(item.amount)}</td>
                  <td><Badge variant={item.approvalStatus.toLowerCase() as any}>{item.approvalStatus}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <div>Menampilkan {data.length} dari {total}</div>
          <div className={styles.pageNav}>
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              <Icons.ChevronLeft size={14} />
            </Button>
            <span className={styles.pageNum}>{page} / {totalPages || 1}</span>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <Icons.ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
