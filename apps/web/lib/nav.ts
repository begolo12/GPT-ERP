import type { DivisionCode } from "@shared/enums";

export interface NavItem {
  key: string;
  label: string;
  href?: string; // optional: parent tanpa href
  icon: string;
  division?: DivisionCode;
  children?: NavItem[];
  badge?: string;
}

export interface NavSection {
  key: string;
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    key: "dashboard",
    label: "DASHBOARD",
    items: [
      { key: "overview", label: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
      { key: "company", label: "Perusahaan", href: "/dashboard/company", icon: "Building2" },
      { key: "division", label: "Divisi", href: "/dashboard/division", icon: "Users" },
    ],
  },
  {
    key: "operasi",
    label: "OPERASI",
    items: [
      {
        key: "op-master",
        label: "Data Master",
        icon: "Database",
        division: "OP",
        children: [
          { key: "vendor", label: "Vendor", href: "/operasi/master/vendor", icon: "Truck", division: "OP" },
          { key: "pelanggan", label: "Pelanggan", href: "/operasi/master/pelanggan", icon: "UserCircle", division: "OP" },
          { key: "produk", label: "Produk", href: "/operasi/master/produk", icon: "Package", division: "OP" },
          { key: "proyek", label: "Proyek", href: "/operasi/master/proyek", icon: "FolderKanban", division: "OP" },
          { key: "gudang", label: "Gudang", href: "/operasi/master/gudang", icon: "Warehouse", division: "OP" },
        ],
      },
      {
        key: "op-pembelian",
        label: "Pembelian",
        icon: "ShoppingCart",
        division: "OP",
        children: [
          { key: "pr", label: "Permintaan Pembelian", href: "/operasi/pembelian/pr", icon: "FileText", division: "OP" },
          { key: "po", label: "Pesanan Pembelian", href: "/operasi/pembelian/po", icon: "FileSpreadsheet", division: "OP" },
          { key: "do", label: "Pengiriman", href: "/operasi/pembelian/do", icon: "Truck", division: "OP" },
          { key: "gr", label: "Penerimaan Barang", href: "/operasi/pembelian/gr", icon: "PackageCheck", division: "OP" },
        ],
      },
      {
        key: "op-penjualan",
        label: "Penjualan",
        icon: "TrendingUp",
        division: "OP",
        children: [
          { key: "quotation", label: "Penawaran Harga", href: "/operasi/penjualan/quotation", icon: "Receipt", division: "OP" },
          { key: "so", label: "Pesanan Penjualan", href: "/operasi/penjualan/so", icon: "ShoppingBag", division: "OP" },
          { key: "surat-jalan", label: "Surat Jalan", href: "/operasi/penjualan/surat-jalan", icon: "FileText", division: "OP" },
          { key: "faktur-penjualan", label: "Faktur Penjualan", href: "/operasi/penjualan/faktur", icon: "FileText", division: "OP" },
        ],
      },
      { key: "op-laporan", label: "Laporan", href: "/operasi/laporan", icon: "BarChart3", division: "OP" },
      { key: "op-history", label: "History", href: "/operasi/history", icon: "History", division: "OP" },
    ],
  },
  {
    key: "keuangan",
    label: "KEUANGAN",
    items: [
      { key: "fn-coa", label: "COA", href: "/keuangan/master/coa", icon: "BookOpen", division: "FN" },
      { key: "fn-faktur", label: "Faktur", href: "/keuangan/transaksi/faktur", icon: "FileText", division: "FN" },
      { key: "fn-pembayaran", label: "Pembayaran", href: "/keuangan/transaksi/pembayaran", icon: "CreditCard", division: "FN" },
      { key: "fn-piutang", label: "Piutang", href: "/keuangan/transaksi/piutang", icon: "Receipt", division: "FN" },
      { key: "fn-hutang", label: "Hutang", href: "/keuangan/transaksi/hutang", icon: "Receipt", division: "FN" },
      { key: "fn-laporan", label: "Laporan", href: "/keuangan/laporan", icon: "BarChart3", division: "FN" },
      { key: "fn-konsolidasi", label: "Konsolidasi Group", href: "/keuangan/konsolidasi", icon: "Layers", division: "FN" },
      { key: "fn-history", label: "History", href: "/keuangan/history", icon: "History", division: "FN" },
    ],
  },
  {
    key: "ga",
    label: "GA",
    items: [
      { key: "ga-aset", label: "Aset Kantor", href: "/ga/master/aset", icon: "Building", division: "GA" },
      { key: "ga-kendaraan", label: "Kendaraan", href: "/ga/master/kendaraan", icon: "Car", division: "GA" },
      { key: "ga-pengadaan", label: "Pengadaan GA", href: "/ga/transaksi/pengadaan", icon: "ShoppingCart", division: "GA" },
      { key: "ga-perawatan", label: "Perawatan", href: "/ga/transaksi/perawatan", icon: "Wrench", division: "GA" },
      { key: "ga-laporan", label: "Laporan", href: "/ga/laporan", icon: "BarChart3", division: "GA" },
    ],
  },
  {
    key: "hr",
    label: "HR",
    items: [
      { key: "hr-karyawan", label: "Karyawan", href: "/hr/master/karyawan", icon: "UserCog", division: "HR" },
      { key: "hr-rekrutmen", label: "Rekrutmen", href: "/hr/transaksi/rekrutmen", icon: "UserPlus", division: "HR" },
      { key: "hr-penggajian", label: "Penggajian", href: "/hr/transaksi/penggajian", icon: "Wallet", division: "HR" },
      { key: "hr-absensi", label: "Absensi", href: "/hr/transaksi/absensi", icon: "Calendar", division: "HR" },
      { key: "hr-laporan", label: "Laporan", href: "/hr/laporan", icon: "BarChart3", division: "HR" },
    ],
  },
];

export const SECTION_COLORS: Record<string, string> = {
  dashboard: "var(--text)",
  operasi: "var(--div-op)",
  keuangan: "var(--div-fn)",
  ga: "var(--div-ga)",
  hr: "var(--div-hr)",
};