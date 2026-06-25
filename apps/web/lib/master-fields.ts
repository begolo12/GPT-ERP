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
};

// Fields yang ditampilkan di DataTable (ringkasan)
export const MASTER_TABLE_COLUMNS: Record<string, string[]> = {
  Vendor: ["code", "name", "phone", "email", "status"],
  Pelanggan: ["code", "name", "contactPerson", "phone", "email", "status"],
  Produk: ["code", "name", "satuan", "kategori", "status"],
  Proyek: ["code", "name", "lokasi", "status"],
  Gudang: ["code", "name", "penanggungJawab", "alamat", "status"],
};

export const MASTER_TITLE: Record<string, { title: string; subtitle: string }> = {
  Vendor: { title: "Vendor", subtitle: "Daftar supplier & rekanan" },
  Pelanggan: { title: "Pelanggan", subtitle: "Daftar customer" },
  Produk: { title: "Produk", subtitle: "Daftar material & item" },
  Proyek: { title: "Proyek", subtitle: "Daftar proyek aktif" },
  Gudang: { title: "Gudang", subtitle: "Daftar lokasi penyimpanan" },
};