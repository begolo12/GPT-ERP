"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { transactionBaseSchema, type LineItem } from "@/lib/schemas/transaction";
import { formatIDR } from "@/lib/format";
import styles from "./TxForm.module.css";

export interface TxFormInitial {
  id?: string;
  code?: string;
  date?: string;
  description?: string;
  vendorCode?: string;
  vendorName?: string;
  projectCode?: string;
  projectName?: string;
  hasPPN?: boolean;
  notes?: string;
  items?: LineItem[];
  refType?: string;
  refId?: string;
  refCode?: string;
  approvalStatus?: string;
}

export interface RefOption {
  id: string;
  code: string;
  date: string;
  vendorName?: string;
  amount: number;
}

export interface TxFormProps {
  type: "PR" | "PO" | "DO" | "GR" | "FAKTUR" | "QUOTATION" | "SO" | "SURAT_JALAN";
  title: string;
  initial?: TxFormInitial;
  vendors: { code: string; name: string }[];
  projects: { code: string; name: string }[];
  products: { code: string; name: string; satuan?: string }[];
  refOptions?: RefOption[];
  refField?: { key: string; label: string; refType: string };
  extraFields?: { key: string; label: string; type: "text" | "date"; required?: boolean; defaultValue?: string }[];
  showVendor?: boolean;
  showProject?: boolean;
  showHasPPN?: boolean;
  chainHistory?: { type: string; code: string; href: string }[];
}

type FormData = {
  date: string;
  description: string;
  vendorCode: string;
  vendorName: string;
  projectCode: string;
  projectName: string;
  hasPPN: boolean;
  notes: string;
  items: LineItem[];
  [key: string]: any;
};

export function TxForm({
  type,
  title,
  initial,
  vendors,
  projects,
  products,
  refOptions = [],
  refField,
  extraFields = [],
  showVendor = true,
  showProject = true,
  showHasPPN = true,
  chainHistory = [],
}: TxFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register: _r,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(transactionBaseSchema) as any,
    defaultValues: {
      date: initial?.date ?? new Date().toISOString().slice(0, 10),
      description: initial?.description ?? "",
      vendorCode: initial?.vendorCode ?? "",
      vendorName: initial?.vendorName ?? "",
      projectCode: initial?.projectCode ?? "",
      projectName: initial?.projectName ?? "",
      hasPPN: initial?.hasPPN ?? false,
      notes: initial?.notes ?? "",
      items: initial?.items?.length ? initial.items : [{ productCode: "", qty: 1, harga: 0, diskon: 0 }],
    } as any,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const register = _r as any;
  const watchItems = watch("items");
  const watchHasPPN = watch("hasPPN");

  const subtotal = (watchItems ?? []).reduce((s: number, it: any) => {
    return s + (Number(it?.qty) || 0) * (Number(it?.harga) || 0) - (Number(it?.diskon) || 0);
  }, 0);
  const ppn = watchHasPPN ? subtotal * 0.11 : 0;
  const total = subtotal + ppn;

  const onSubmit = (data: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        const payload: any = {
          date: data.date,
          description: data.description,
          vendorCode: data.vendorCode || undefined,
          vendorName: data.vendorName || undefined,
          projectCode: data.projectCode || undefined,
          projectName: data.projectName || undefined,
          hasPPN: data.hasPPN,
          notes: data.notes,
          items: data.items,
        };

        if (refField && data[refField.key]) {
          const refOpt = refOptions.find((o) => o.id === data[refField.key]);
          if (refOpt) {
            payload.refType = refField.refType;
            payload.refId = refOpt.id;
            payload.refCode = refOpt.code;
            payload.parentId = refOpt.id;
          }
        }
        if (extraFields.length > 0) {
          payload.extraMetadata = {};
          for (const f of extraFields) {
            if (data[f.key]) payload.extraMetadata[f.key] = data[f.key];
          }
        }

        let res;
        if (initial?.id) {
          res = await fetch(`/api/transactions/${type}/${initial.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else {
          res = await fetch(`/api/transactions/${type}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Gagal menyimpan");
        }
        const saved = await res.json();
        router.push(`/operasi/pembelian/${type.toLowerCase()}/${saved.id}`);
        router.refresh();
      } catch (e: any) {
        setError(e.message);
      }
    });
  };

  const isReadOnly = initial?.approvalStatus && initial.approvalStatus !== "DRAFT" && initial.approvalStatus !== "REVISED";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {chainHistory.length > 0 && (
        <div className={styles.chain}>
          <Icons.Link size={14} />
          <span>Chain:</span>
          {chainHistory.map((c, i) => (
            <span key={i}>
              <a href={c.href}>{c.type} {c.code}</a>
              {i < chainHistory.length - 1 && <Icons.ChevronRight size={12} />}
            </span>
          ))}
          <Icons.ChevronRight size={12} />
          <strong>{type} {initial?.code ?? "Baru"}</strong>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      <Card>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Tanggal *</label>
            <input type="date" {...register("date")} disabled={isReadOnly} />
            {errors.date && <p className={styles.fieldError}>{String(errors.date.message ?? "")}</p>}
          </div>

          {refField && (
            <div className={styles.field}>
              <label>{refField.label} *</label>
              <select {...register(refField.key, { required: true })} disabled={isReadOnly}>
                <option value="">-- Pilih {refField.label} --</option>
                {refOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.code} \u00b7 {opt.vendorName ?? ""} ({formatIDR(opt.amount, false)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {extraFields.map((f) => (
            <div key={f.key} className={styles.field}>
              <label>{f.label}{f.required && " *"}</label>
              <input
                type={f.type}
                {...register(f.key, { required: f.required })}
                defaultValue={f.defaultValue}
                disabled={isReadOnly}
              />
            </div>
          ))}
        </div>

        <div className={styles.field}>
          <label>Deskripsi *</label>
          <input
            type="text"
            placeholder="Deskripsi singkat dokumen"
            {...register("description")}
            disabled={isReadOnly}
          />
          {errors.description && <p className={styles.fieldError}>{String(errors.description.message ?? "")}</p>}
        </div>

        {(showVendor || showProject) && (
          <div className={styles.grid}>
            {showVendor && (
              <div className={styles.field}>
                <label>Vendor</label>
                <select
                  {...register("vendorCode")}
                  onChange={(e) => {
                    const code = e.target.value;
                    const v = vendors.find((x) => x.code === code);
                    setValue("vendorCode", code);
                    setValue("vendorName", v?.name ?? "");
                  }}
                  disabled={isReadOnly}
                >
                  <option value="">-- Pilih Vendor --</option>
                  {vendors.map((v) => (
                    <option key={v.code} value={v.code}>{v.code} \u00b7 {v.name}</option>
                  ))}
                </select>
              </div>
            )}

            {showProject && (
              <div className={styles.field}>
                <label>Proyek</label>
                <select
                  {...register("projectCode")}
                  onChange={(e) => {
                    const code = e.target.value;
                    const p = projects.find((x) => x.code === code);
                    setValue("projectCode", code);
                    setValue("projectName", p?.name ?? "");
                  }}
                  disabled={isReadOnly}
                >
                  <option value="">-- Pilih Proyek --</option>
                  {projects.map((p) => (
                    <option key={p.code} value={p.code}>{p.code} \u00b7 {p.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {showHasPPN && (
          <label className={styles.checkbox}>
            <input type="checkbox" {...register("hasPPN")} disabled={isReadOnly} />
            <span>Termasuk PPN 11%</span>
          </label>
        )}
      </Card>

      <Card>
        <div className={styles.itemsHeader}>
          <h3>Line Items</h3>
          {!isReadOnly && (
            <Button type="button" variant="secondary" size="sm" onClick={() => append({ productCode: "", qty: 1, harga: 0, diskon: 0 } as any)}>
              <Icons.Plus size={14} /> Tambah Item
            </Button>
          )}
        </div>

        <div className={styles.itemsTable}>
          <div className={styles.itemHeader}>
            <div>Produk</div>
            <div style={{ width: 80 }}>Qty</div>
            <div style={{ width: 100 }}>Satuan</div>
            <div style={{ width: 130 }}>Harga</div>
            <div style={{ width: 100 }}>Diskon</div>
            <div style={{ width: 130, textAlign: "right" }}>Subtotal</div>
            {!isReadOnly && <div style={{ width: 30 }}></div>}
          </div>

          {fields.map((field, idx) => {
            const item: any = watchItems?.[idx];
            const itemSubtotal = ((Number(item?.qty) || 0) * (Number(item?.harga) || 0)) - (Number(item?.diskon) || 0);
            return (
              <div key={field.id} className={styles.itemRow}>
                <div>
                  <select
                    {...register(`items.${idx}.productCode` as const, { required: true })}
                    onChange={(e) => {
                      const p = products.find((x) => x.code === e.target.value);
                      setValue(`items.${idx}.productCode`, e.target.value);
                      if (p) {
                        setValue(`items.${idx}.productName`, p.name);
                        setValue(`items.${idx}.satuan`, p.satuan ?? "");
                      }
                    }}
                    disabled={isReadOnly}
                  >
                    <option value="">-- Pilih Produk --</option>
                    {products.map((p) => (
                      <option key={p.code} value={p.code}>{p.code} \u00b7 {p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    step="any"
                    {...register(`items.${idx}.qty` as const, { valueAsNumber: true })}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <input type="text" {...register(`items.${idx}.satuan` as const)} disabled={isReadOnly} placeholder="sak, kg" />
                </div>
                <div>
                  <input
                    type="number"
                    step="any"
                    {...register(`items.${idx}.harga` as const, { valueAsNumber: true })}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="any"
                    {...register(`items.${idx}.diskon` as const, { valueAsNumber: true })}
                    disabled={isReadOnly}
                  />
                </div>
                <div className={styles.itemSubtotal}>{formatIDR(itemSubtotal, false)}</div>
                {!isReadOnly && (
                  <div>
                    <button type="button" onClick={() => remove(idx)} className={styles.removeBtn} disabled={fields.length === 1}>
                      <Icons.Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.totals}>
          <div><span>Subtotal</span><span>{formatIDR(subtotal)}</span></div>
          {watchHasPPN && <div><span>PPN 11%</span><span>{formatIDR(ppn)}</span></div>}
          <div className={styles.totalGrand}><span>Total</span><span>{formatIDR(total)}</span></div>
        </div>
      </Card>

      {!isReadOnly && (
        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan\u2026" : initial?.id ? "Update" : "Simpan Draft"}
          </Button>
        </div>
      )}

      {isReadOnly && (
        <div className={styles.readonlyNotice}>
          <Icons.Info size={14} />
          <span>Dokumen berstatus <strong>{initial?.approvalStatus}</strong> \u2014 hanya bisa dilihat</span>
        </div>
      )}
    </form>
  );
}