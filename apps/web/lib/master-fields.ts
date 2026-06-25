// Field definitions per master data category
// type: text | number | email | tel | url | textarea | select
// required, lookup, options

export interface MasterField {
  key: string;
  label: string;
  type: "text" | "number" | "email" | "tel" | "url" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number; // for textarea
}

export interface MasterFieldGroup {
  title: string;
  fields: MasterField[];
}

export const MASTER_FIELDS: Record<string, MasterFieldGroup[]> = {
  Vendor: [
    {
      title: "Informasi Utama",
      fields: [
        { key: "name", label: "Nama Vendor", type: "text", required: true, placeholder: "PT. Contoh Jaya" },
        { key: "code", label: "Kode", type: "text", required: true, placeholder: "VND-001" },
      ],
    },
    {
      title: "Kontak",
      fields: [
        { key: "phone", label: "Telepon", type: "tel", placeholder: "+62 21 1234567" },
        { key: "email", label: "Email", type: "email", placeholder: "vendor@example.com" },
        { key: "address", label: "Alamat", type: "textarea", rows: 3, placeholder: "Jl. ..." },
      ],
    },
  ],
  Pelanggan: [
    {
      title: "Informasi Utama",
      fields: [
        { key: "name", label: "Nama Pelanggan", type: "text", required: true, placeholder: "PT. Pelanggan Maju" },
        { key: "code", label: "Kode", type: "text", required: true, placeholder: "PLG-001" },
      ],
    },
    {
      title: "Kontak",
      fields: [
        { key: "contactPerson", label: "Contact Person", type: "text", placeholder: "Budi" },
        { key: "phone", label: "Telepon", type: "tel", placeholder: "+62 21 1234567" },
        { key: "email", label: "Email", type: "email", placeholder: "pic@example.com" },
        { key: "address", label: "Alamat", type: "textarea", rows: 3, placeholder: "Jl. ..." },
      ],
    },
  ],
  Produk: [
    {
      title: "Informasi Produk",
      fields: [
        { key: "name", label: "Nama Produk", type: "text", required: true, placeholder: "Semen Portland 50kg" },
        { key: "code", label: "Kode/SKU", type: "text", required: true, placeholder: "PRD-001" },
        { key: "satuan", label: "Satuan", type: "text", placeholder: "sak, kg, m3" },
        { key: "kategori", label: "Kategori", type: "text", placeholder: "Material, Jasa, dll" },
      ],
    },
  ],
  Proyek: [
    {
      title: "Informasi Proyek",
      fields: [
        { key: "name", label: "Nama Proyek", type: "text", required: true, placeholder: "Pembangunan Dermaga X" },
        { key: "code", label: "Kode", type: "text", required: true, placeholder: "PRY-001" },
        { key: "lokasi", label: "Lokasi", type: "text", placeholder: "Surabaya" },
        { key: "nilaiKontrak", label: "Nilai Kontrak (Rp)", type: "number", placeholder: "1000000000" },
        { key: "tanggalMulai", label: "Tanggal Mulai", type: "text", placeholder: "YYYY-MM-DD" },
        { key: "tanggalSelesai", label: "Tanggal Selesai", type: "text", placeholder: "YYYY-MM-DD" },
        { key: "keterangan", label: "Keterangan", type: "textarea", rows: 2 },
      ],
    },
  ],
  Gudang: [
    {
      title: "Informasi Gudang",
      fields: [
        { key: "name", label: "Nama Gudang", type: "text", required: true, placeholder: "Gudang Utama" },
        { key: "code", label: "Kode", type: "text", required: true, placeholder: "GDG-001" },
        { key: "alamat", label: "Alamat", type: "textarea", rows: 2, placeholder: "Jl. ..." },
        { key: "penanggungJawab", label: "Penanggung Jawab", type: "text", placeholder: "Nama staff" },
      ],
    },
  ],

  // ===== Settings (Umum) =====
  Satuan: [
    {
      title: 'Satuan',
      fields: [
        { key: 'name', label: 'Nama Satuan', type: 'text', required: true, placeholder: 'sak, kg, m3, unit' },
        { key: 'code', label: 'Kode', type: 'text', required: true, placeholder: 'STN-001' },
      ],
    },
  ],
  'Kategori Produk': [
    {
      title: 'Kategori Produk',
      fields: [
        { key: 'name', label: 'Nama Kategori', type: 'text', required: true, placeholder: 'Material, Jasa, Sewa' },
        { key: 'code', label: 'Kode', type: 'text', required: true, placeholder: 'KAT-001' },
      ],
    },
  ],
  'Metode Pembayaran': [
    {
      title: 'Metode Pembayaran',
      fields: [
        { key: 'name', label: 'Metode', type: 'text', required: true, placeholder: 'Transfer Bank, Tunai, Cek' },
        { key: 'code', label: 'Kode', type: 'text', required: true, placeholder: 'PAY-001' },
      ],
    },
  ],
  'Pengaturan Pajak': [
    {
      title: 'Pengaturan Pajak',
      fields: [
        { key: 'name', label: 'Nama Pajak', type: 'text', required: true, placeholder: 'PPN 11%' },
        { key: 'code', label: 'Kode', type: 'text', required: true, placeholder: 'TAX-001' },
        { key: 'persen', label: 'Tarif (%)', type: 'text', placeholder: '11' },
        { key: 'keterangan', label: 'Keterangan', type: 'textarea', rows: 2 },
      ],
    },
  ],
  'Kategori Anggaran': [
    {
      title: 'Kategori Anggaran',
      fields: [
        { key: 'name', label: 'Nama Kategori', type: 'text', required: true, placeholder: 'Operasional, Modal' },
        { key: 'code', label: 'Kode', type: 'text', required: true, placeholder: 'ANG-001' },
      ],
    },
  ],
  'Pusat Biaya': [
    {
      title: 'Pusat Biaya',
      fields: [
        { key: 'name', label: 'Nama Pusat', type: 'text', required: true, placeholder: 'Pusat Jakarta' },
        { key: 'code', label: 'Kode', type: 'text', required: true, placeholder: 'CB-001' },
      ],
    },
  ],

  // ===== Settings (Organisasi) =====
  Jabatan: [
    {
      title: 'Jabatan',
      fields: [
        { key: 'name', label: 'Nama Jabatan', type: 'text', required: true, placeholder: 'Manager, Staff' },
        { key: 'code', label: 'Kode', type: 'text', required: true, placeholder: 'JBT-001' },
        { key: 'level', label: 'Level', type: 'text', placeholder: '1, 2, 3' },
      ],
    },
  ],
  'Tahap Wawancara': [
    {
      title: 'Tahap Wawancara',
      fields: [
        { key: 'name', label: 'Nama Tahap', type: 'text', required: true, placeholder: 'HR Interview' },
        { key: 'code', label: 'Kode', type: 'text', required: true, placeholder: 'INT-001' },
        { key: 'urutan', label: 'Urutan', type: 'text', placeholder: '1, 2, 3' },
      ],
    },
  ],
  'Sumber Kandidat': [
    {
      title: 'Sumber Kandidat',
      fields: [
        { key: 'name', label: 'Sumber', type: 'text', required: true, placeholder: 'LinkedIn, JobStreet' },
        { key: 'code', label: 'Kode', type: 'text', required: true, placeholder: 'SRC-001' },
      ],
    },
  ],
  Keahlian: [
    {
      title: 'Keahlian',
      fields: [
        { key: 'name', label: 'Nama Keahlian', type: 'text', required: true, placeholder: 'AutoCAD, Welding' },
        { key: 'code', label: 'Kode', type: 'text', required: true, placeholder: 'SKL-001' },
      ],
    },
  ],
  'Lokasi Aset': [
    {
      title: 'Lokasi Aset',
      fields: [
        { key: 'name', label: 'Nama Lokasi', type: 'text', required: true, placeholder: 'Kantor Pusat' },
        { key: 'code', label: 'Kode', type: 'text', required: true, placeholder: 'LOC-001' },
        { key: 'alamat', label: 'Alamat', type: 'textarea', rows: 2 },
      ],
    },
  ],
  'Kategori Perawatan': [
    {
      title: 'Kategori Perawatan',
      fields: [
        { key: 'name', label: 'Kategori', type: 'text', required: true, placeholder: 'Rutin, Berkala' },
        { key: 'code', label: 'Kode', type: 'text', required: true, placeholder: 'MNT-001' },
      ],
    },
  ],
};

// Fields yang ditampilkan di DataTable (ringkasan)
export const MASTER_TABLE_COLUMNS: Record<string, string[]> = {
  Vendor: ['code', 'name', 'phone', 'email', 'status'],
  Pelanggan: ['code', 'name', 'contactPerson', 'phone', 'email', 'status'],
  Produk: ['code', 'name', 'satuan', 'kategori', 'status'],
  Proyek: ['code', 'name', 'lokasi', 'status'],
  Gudang: ['code', 'name', 'penanggungJawab', 'alamat', 'status'],
  // Settings
  Satuan: ['code', 'name', 'status'],
  'Kategori Produk': ['code', 'name', 'status'],
  'Metode Pembayaran': ['code', 'name', 'status'],
  'Pengaturan Pajak': ['code', 'name', 'persen', 'status'],
  'Kategori Anggaran': ['code', 'name', 'status'],
  'Pusat Biaya': ['code', 'name', 'status'],
  Jabatan: ['code', 'name', 'level', 'status'],
  'Tahap Wawancara': ['code', 'name', 'urutan', 'status'],
  'Sumber Kandidat': ['code', 'name', 'status'],
  Keahlian: ['code', 'name', 'status'],
  'Lokasi Aset': ['code', 'name', 'alamat', 'status'],
  'Kategori Perawatan': ['code', 'name', 'status'],
};

export const MASTER_TITLE: Record<string, { title: string; subtitle: string }> = {
  Vendor: { title: 'Vendor', subtitle: 'Daftar supplier & rekanan' },
  Pelanggan: { title: 'Pelanggan', subtitle: 'Daftar customer' },
  Produk: { title: 'Produk', subtitle: 'Daftar material & item' },
  Proyek: { title: 'Proyek', subtitle: 'Daftar proyek aktif' },
  Gudang: { title: 'Gudang', subtitle: 'Daftar lokasi penyimpanan' },
  // Settings
  Satuan: { title: 'Satuan', subtitle: 'Satuan ukuran (sak, kg, m3, dll)' },
  'Kategori Produk': { title: 'Kategori Produk', subtitle: 'Pengelompokan produk' },
  'Metode Pembayaran': { title: 'Metode Pembayaran', subtitle: 'Cara pembayaran' },
  'Pengaturan Pajak': { title: 'Pengaturan Pajak', subtitle: 'Tarif & konfigurasi pajak' },
  'Kategori Anggaran': { title: 'Kategori Anggaran', subtitle: 'Kategori untuk budget' },
  'Pusat Biaya': { title: 'Pusat Biaya', subtitle: 'Cost center' },
  Jabatan: { title: 'Jabatan', subtitle: 'Daftar jabatan' },
  'Tahap Wawancara': { title: 'Tahap Wawancara', subtitle: 'Tahapan proses rekrutmen' },
  'Sumber Kandidat': { title: 'Sumber Kandidat', subtitle: 'Asal kandidat' },
  Keahlian: { title: 'Keahlian', subtitle: 'Skill/kompetensi' },
  'Lokasi Aset': { title: 'Lokasi Aset', subtitle: 'Lokasi penempatan aset' },
  'Kategori Perawatan': { title: 'Kategori Perawatan', subtitle: 'Kategori maintenance' },
};