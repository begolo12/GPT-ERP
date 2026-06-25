"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/Button";
import styles from "./ApprovalActions.module.css";

interface ApprovalActionsProps {
  transactionId: string;
  status: string;
  currentRole: string | null;
  isOwner: boolean;
  userRole: string;
  amount: number;
  type: string;
}

export function ApprovalActions({
  transactionId,
  status,
  currentRole,
  isOwner,
  userRole,
  amount,
  type,
}: ApprovalActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showReviseForm, setShowReviseForm] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = (status === "DRAFT" || status === "REVISED") && isOwner;
  const canApprove =
    (status === "SUBMITTED" || status === "REVIEWED") &&
    (userRole === currentRole || userRole === "ADMIN");
  const canReject = canApprove;
  const canRevise = canApprove || status === "REJECTED";

  if (!canSubmit && !canApprove && !canReject && !canRevise) return null;

  const call = (action: string, noteVal?: string) => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/approval/${transactionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, note: noteVal }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Gagal");
        }
        router.refresh();
        setShowRejectForm(false);
        setShowReviseForm(false);
        setNote("");
      } catch (e: any) {
        setError(e.message);
      }
    });
  };

  return (
    <div className={styles.wrap}>
      {error && <div className={styles.error}>{error}</div>}

      {showRejectForm && (
        <div className={styles.formBox}>
          <label>Alasan reject *</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Jelaskan alasan penolakan..."
            rows={3}
            className={styles.textarea}
          />
          <div className={styles.formActions}>
            <Button variant="secondary" size="sm" onClick={() => setShowRejectForm(false)}>
              Batal
            </Button>
            <Button variant="danger" size="sm" disabled={!note.trim() || isPending} onClick={() => call("reject", note)}>
              <Icons.X size={14} /> Konfirmasi Reject
            </Button>
          </div>
        </div>
      )}

      {showReviseForm && (
        <div className={styles.formBox}>
          <label>Alasan revisi *</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Jelaskan apa yang perlu direvisi..."
            rows={3}
            className={styles.textarea}
          />
          <div className={styles.formActions}>
            <Button variant="secondary" size="sm" onClick={() => setShowReviseForm(false)}>
              Batal
            </Button>
            <Button variant="secondary" size="sm" disabled={!note.trim() || isPending} onClick={() => call("revise", note)}>
              <Icons.Edit size={14} /> Konfirmasi Revisi
            </Button>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        {canSubmit && (
          <Button onClick={() => call("submit")} disabled={isPending}>
            <Icons.Send size={16} /> Kirim untuk Approval
          </Button>
        )}
        {canApprove && !showRejectForm && !showReviseForm && (
          <Button onClick={() => call("approve")} disabled={isPending}>
            <Icons.Check size={16} /> Setujui
          </Button>
        )}
        {canReject && !showRejectForm && !showReviseForm && (
          <Button variant="danger" onClick={() => setShowRejectForm(true)} disabled={isPending}>
            <Icons.X size={16} /> Tolak
          </Button>
        )}
        {canRevise && !showRejectForm && !showReviseForm && (
          <Button variant="secondary" onClick={() => setShowReviseForm(true)} disabled={isPending}>
            <Icons.Edit size={16} /> Revisi
          </Button>
        )}
      </div>
    </div>
  );
}