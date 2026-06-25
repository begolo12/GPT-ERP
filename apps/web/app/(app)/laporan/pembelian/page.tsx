"use client";

import { useState, useEffect, useCallback } from "react";
import * as Icons from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatIDR, formatDate } from "@/lib/format";
import styles from "./laporan.module.css";

interface ReportData {
  data: any[];
  total: number;
  count: number;
  byVendor: { code: string; name: string; total: number; count: number }[];
  byProject: { code: string; name: string; total: number; count: number }[];
}

export default function LaporanPembelianPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    vendorCode: "",
    projectCode: "",
    status: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.vendorCode) params.set("vendorCode", filters.vendorCode);
      if (filters.projectCode) params.set("projectCode", filters.projectCode);
      if (filters.status) params.set("status", filters.status);
      const res = await fetch(`/api/report/pembelian?${params}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportExcel = async () => {
    if (!data) return;
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Laporan Pembelian");
    ws.columns = [
      { header: "Kode", key: "code", width: 16 },
      { header: "Type", key: "type", width: 10 },
      { header: "Tanggal", key: "date", width: 12 },
      { header: "Deskripsi", key: "description", width: 30 },
      { header: "Vendor", key: "vendorName", width: 24 },
      { header: "Proyek", key: "projectName", width: 20 },
      { header: "Amount", key: "amount", width: 16, style: { numFmt: "#,##0" } },
      { header: "Status", key: "status", width: 12 },
    ];
    data.data.forEach((row) => {
      ws.addRow(row);
    });
    ws.addRow({});
    const totalRow = ws.addRow({ description: "TOTAL", amount: data.total });
    totalRow.font = { bold: true };
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-pembelian-${filters.startDate}-${filters.endDate}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Laporan Pembelian</h1>
          <p className={styles.subtitle}>
            {data ? `${data.count} transaksi \u00b7 Total ${formatIDR(data.total)}` : "Memuat..."}
          </p>
        </div>
        <Button onClick={handleExportExcel} disabled={!data || data.data.length === 0}>
          <Icons.Download size={16} /> Export Excel
        </Button>
      </header>

      <Card>
        <div className={styles.filters}>
          <div className={styles.filterField}>
            <label>Dari</label>
            <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
          </div>
          <div className={styles.filterField}>
            <label>Sampai</label>
            <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          </div>
          <div className={styles.filterField}>
            <label>Vendor Code</label>
            <input type="text" placeholder="VND-xxx" value={filters.vendorCode} onChange={(e) => setFilters({ ...filters, vendorCode: e.target.value })} />
          </div>
          <div className={styles.filterField}>
            <label>Proyek Code</label>
            <input type="text" placeholder="PRY-xxx" value={filters.projectCode} onChange={(e) => setFilters({ ...filters, projectCode: e.target.value })} />
          </div>
          <div className={styles.filterField}>
            <label>Status</label>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">Semua</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <Button onClick={fetchData} disabled={loading}>
            <Icons.Filter size={14} /> Terapkan
          </Button>
        </div>
      </Card>

      {data && (
        <>
          <div className={styles.summary}>
            <Card>
              <CardHeader><CardTitle>Per Vendor</CardTitle></CardHeader>
              <CardContent>
                {data.byVendor.length === 0 ? <p className={styles.empty}>Tidak ada data</p> : (
                  <table className={styles.table}>
                    <thead><tr><th>Vendor</th><th style={{ textAlign: "right" }}>Transaksi</th><th style={{ textAlign: "right" }}>Total</th></tr></thead>
                    <tbody>
                      {data.byVendor.slice(0, 10).map((v) => (
                        <tr key={v.code}>
                          <td>{v.name}</td>
                          <td style={{ textAlign: "right" }}>{v.count}</td>
                          <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{formatIDR(v.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Per Proyek</CardTitle></CardHeader>
              <CardContent>
                {data.byProject.length === 0 ? <p className={styles.empty}>Tidak ada data</p> : (
                  <table className={styles.table}>
                    <thead><tr><th>Proyek</th><th style={{ textAlign: "right" }}>Transaksi</th><th style={{ textAlign: "right" }}>Total</th></tr></thead>
                    <tbody>
                      {data.byProject.slice(0, 10).map((p) => (
                        <tr key={p.code}>
                          <td>{p.name}</td>
                          <td style={{ textAlign: "right" }}>{p.count}</td>
                          <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{formatIDR(p.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Detail Transaksi</CardTitle></CardHeader>
            <CardContent>
              {data.data.length === 0 ? (
                <p className={styles.empty}>Tidak ada transaksi dalam periode ini</p>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Kode</th>
                        <th>Type</th>
                        <th>Tanggal</th>
                        <th>Vendor</th>
                        <th>Proyek</th>
                        <th style={{ textAlign: "right" }}>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.data.map((d) => (
                        <tr key={d.id}>
                          <td style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600 }}>{d.code}</td>
                          <td><Badge variant="neutral">{d.type}</Badge></td>
                          <td>{formatDate(d.date)}</td>
                          <td>{d.vendorName ?? "-"}</td>
                          <td>{d.projectName ?? "-"}</td>
                          <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{formatIDR(d.amount)}</td>
                          <td><Badge variant={d.status.toLowerCase() as any}>{d.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}