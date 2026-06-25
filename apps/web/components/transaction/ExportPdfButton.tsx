"use client";

import { useState, useTransition } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { generateDocumentPdf, type PdfCompany, type PdfParty, type PdfDoc } from "@/lib/pdf-generator";

interface ExportPdfButtonProps {
  company: PdfCompany;
  party: PdfParty;
  doc: PdfDoc;
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
}

export function ExportPdfButton({ company, party, doc, label = "Export PDF", variant = "secondary" }: ExportPdfButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      try {
        await generateDocumentPdf({
          company,
          party,
          doc,
          filename: `${doc.code}.pdf`,
        });
      } catch (e: any) {
        setError(e.message ?? "Gagal export PDF");
      }
    });
  };

  return (
    <>
      <Button variant={variant} onClick={handleClick} disabled={isPending}>
        {isPending ? <Loader2 size={16} className="spin" /> : <FileDown size={16} />}
        {isPending ? "Membuat PDF\u2026" : label}
      </Button>
      {error && (
        <div style={{ color: "var(--status-rejected)", fontSize: 12, marginTop: 4 }}>
          {error}
        </div>
      )}
    </>
  );
}