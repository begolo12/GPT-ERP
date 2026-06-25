"use client";

// jsPDF generator untuk dokumen ERP
// Loaded dynamically untuk avoid SSR issues

import type { jsPDF } from "jspdf";

export interface PdfCompany {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface PdfParty {
  label: string; // "Vendor" | "Pelanggan" | "Kepada"
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
}

export interface PdfItem {
  productCode: string;
  productName?: string;
  qty: number;
  satuan?: string;
  harga: number;
  diskon?: number;
  notes?: string;
}

export interface PdfDoc {
  title: string; // "PENGAJUAN PEMBELIAN" | "FAKTUR PENJUALAN" dll
  code: string;
  date: string;
  description: string;
  status: string;
  notes?: string;
  items: PdfItem[];
  hasPPN: boolean;
  subtotal: number;
  ppn: number;
  total: number;
  projectName?: string;
  refCode?: string;
}

interface GenerateOpts {
  company: PdfCompany;
  party: PdfParty;
  doc: PdfDoc;
  filename?: string;
}

const NAVY: [number, number, number] = [15, 23, 42];
const AMBER: [number, number, number] = [217, 119, 6];
const GRAY: [number, number, number] = [100, 116, 139];
const LIGHT: [number, number, number] = [241, 245, 249];

export async function generateDocumentPdf({ company, party, doc, filename }: GenerateOpts): Promise<void> {
  // Dynamic import untuk avoid SSR
  const { jsPDF } = await import("jspdf");
  const autoTableMod = await import("jspdf-autotable");
  const autoTable = (autoTableMod as any).default ?? autoTableMod;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  // ===== HEADER =====
  // Logo box (placeholder, branded)
  pdf.setFillColor(...NAVY);
  pdf.rect(margin, y, 18, 18, "F");
  pdf.setTextColor(...AMBER);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("GPT", margin + 9, y + 11.5, { align: "center" });

  // Company name + tagline
  pdf.setTextColor(...NAVY);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text(company.name, margin + 22, y + 7);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...GRAY);
  pdf.text("ERP System \u00b7 Daniswara Group", margin + 22, y + 12);
  if (company.address) {
    pdf.text(company.address.substring(0, 60), margin + 22, y + 16);
  }

  // Right: doc title + code
  pdf.setTextColor(...AMBER);
  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.text(doc.title, pageW - margin, y + 7, { align: "right" });
  pdf.setTextColor(...NAVY);
  pdf.setFontSize(10);
  pdf.setFont("courier", "bold");
  pdf.text(doc.code, pageW - margin, y + 13, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...GRAY);
  pdf.text(`Tanggal: ${doc.date}`, pageW - margin, y + 18, { align: "right" });

  y += 22;

  // Divider
  pdf.setDrawColor(...AMBER);
  pdf.setLineWidth(0.6);
  pdf.line(margin, y, pageW - margin, y);
  y += 4;

  // ===== META + PARTY (2 columns) =====
  const colW = (pageW - margin * 2) / 2;
  const leftX = margin;
  const rightX = margin + colW;

  // Left: Description + Project
  pdf.setFontSize(8);
  pdf.setTextColor(...GRAY);
  pdf.setFont("helvetica", "bold");
  pdf.text("DESKRIPSI", leftX, y);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...NAVY);
  pdf.setFontSize(10);
  const descLines = pdf.splitTextToSize(doc.description, colW - 5);
  pdf.text(descLines, leftX, y + 4);

  if (doc.projectName) {
    pdf.setFontSize(8);
    pdf.setTextColor(...GRAY);
    pdf.setFont("helvetica", "bold");
    pdf.text("PROYEK", leftX, y + 4 + descLines.length * 4 + 2);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...NAVY);
    pdf.setFontSize(10);
    pdf.text(doc.projectName, leftX, y + 4 + descLines.length * 4 + 7);
  }

  if (doc.refCode) {
    pdf.setFontSize(8);
    pdf.setTextColor(...GRAY);
    pdf.setFont("helvetica", "bold");
    pdf.text("REFERENSI", leftX, y + 4 + descLines.length * 4 + 14);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...NAVY);
    pdf.setFontSize(10);
    pdf.text(doc.refCode, leftX, y + 4 + descLines.length * 4 + 19);
  }

  // Right: Party info
  pdf.setFontSize(8);
  pdf.setTextColor(...GRAY);
  pdf.setFont("helvetica", "bold");
  pdf.text(party.label.toUpperCase(), rightX, y);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...NAVY);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text(party.name, rightX, y + 4);
  pdf.setFont("helvetica", "normal");

  let partyY = y + 9;
  if (party.code) {
    pdf.setFontSize(8);
    pdf.setTextColor(...GRAY);
    pdf.text(`Kode: ${party.code}`, rightX, partyY);
    partyY += 4;
  }
  if (party.contactPerson) {
    pdf.setTextColor(...NAVY);
    pdf.setFontSize(9);
    pdf.text(`Up: ${party.contactPerson}`, rightX, partyY);
    partyY += 4;
  }
  if (party.phone) {
    pdf.setTextColor(...GRAY);
    pdf.setFontSize(8);
    pdf.text(party.phone, rightX, partyY);
    partyY += 4;
  }
  if (party.email) {
    pdf.setTextColor(...GRAY);
    pdf.setFontSize(8);
    pdf.text(party.email, rightX, partyY);
    partyY += 4;
  }
  if (party.address) {
    pdf.setTextColor(...NAVY);
    pdf.setFontSize(8);
    const addrLines = pdf.splitTextToSize(party.address, colW - 5);
    pdf.text(addrLines, rightX, partyY);
    partyY += addrLines.length * 3.5;
  }

  // Position cursor after the meta block
  y = Math.max(y + 4 + descLines.length * 4 + 25, partyY + 4);
  if (doc.refCode || doc.projectName) y += 4;

  // ===== ITEMS TABLE =====
  const tableData = doc.items.map((it, idx) => [
    String(idx + 1),
    it.productCode + (it.productName ? `\n${it.productName}` : ""),
    `${formatNumber(it.qty)}${it.satuan ? " " + it.satuan : ""}`,
    formatIDR(it.harga),
    formatIDR(it.diskon ?? 0),
    formatIDR(it.qty * it.harga - (it.diskon ?? 0)),
  ]);

  autoTable(pdf, {
    startY: y,
    head: [["#", "Produk", "Qty", "Harga", "Diskon", "Subtotal"]],
    body: tableData,
    theme: "grid",
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: NAVY,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: NAVY,
      lineColor: [226, 232, 240],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { cellWidth: "auto" },
      2: { halign: "right", cellWidth: 22 },
      3: { halign: "right", cellWidth: 30 },
      4: { halign: "right", cellWidth: 25 },
      5: { halign: "right", cellWidth: 32, fontStyle: "bold" },
    },
    didParseCell: (data: any) => {
      if (data.section === "body" && data.column.index === 5) {
        data.cell.styles.fillColor = LIGHT;
      }
    },
  });

  // Get final y after table
  const finalY = (pdf as any).lastAutoTable.finalY + 6;

  // ===== TOTALS (right-aligned) =====
  const totalsX = pageW - margin - 70;
  const totalsValX = pageW - margin;

  let totY = finalY;
  pdf.setFontSize(9);
  pdf.setTextColor(...GRAY);
  pdf.text("Subtotal", totalsX, totY);
  pdf.setTextColor(...NAVY);
  pdf.text(formatIDR(doc.subtotal), totalsValX, totY, { align: "right" });
  totY += 5;

  if (doc.hasPPN) {
    pdf.setTextColor(...GRAY);
    pdf.text("PPN 11%", totalsX, totY);
    pdf.setTextColor(...NAVY);
    pdf.text(formatIDR(doc.ppn), totalsValX, totY, { align: "right" });
    totY += 5;
  }

  // Grand total box
  pdf.setFillColor(...NAVY);
  pdf.rect(totalsX - 3, totY - 1, totalsValX - totalsX + 3, 9, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("TOTAL", totalsX, totY + 5);
  pdf.text(formatIDR(doc.total), totalsValX, totY + 5, { align: "right" });

  // ===== NOTES =====
  if (doc.notes) {
    let notesY = finalY;
    pdf.setFontSize(8);
    pdf.setTextColor(...GRAY);
    pdf.setFont("helvetica", "bold");
    pdf.text("CATATAN", margin, notesY);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...NAVY);
    pdf.setFontSize(9);
    const notesLines = pdf.splitTextToSize(doc.notes, pageW - margin * 2 - totalsX + margin - 5);
    pdf.text(notesLines, margin, notesY + 4);
  }

  // ===== FOOTER =====
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setTextColor(...GRAY);

    // Footer line
    pdf.setDrawColor(...LIGHT);
    pdf.setLineWidth(0.3);
    pdf.line(margin, pageH - 12, pageW - margin, pageH - 12);

    pdf.text(`Status: ${doc.status}`, margin, pageH - 7);
    pdf.text(`Halaman ${i} dari ${pageCount}`, pageW - margin, pageH - 7, { align: "right" });
    pdf.text(`Generated by GPT-ERP \u00b7 ${new Date().toLocaleString("id-ID")}`, pageW / 2, pageH - 7, { align: "center" });
  }

  pdf.save(filename ?? `${doc.code}.pdf`);
}

// Local formatters (IDR)
function formatIDR(n: number): string {
  return "Rp " + new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);
}
function formatNumber(n: number): string {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(n);
}