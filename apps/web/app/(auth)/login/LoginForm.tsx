"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Icons from "lucide-react";
import { signIn } from "next-auth/react";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";
import { Button } from "@/components/ui/Button";
import styles from "./login.module.css";

interface LoginFormProps {
  callbackUrl?: string;
  initialError?: string;
}

export function LoginForm({ callbackUrl, initialError }: LoginFormProps) {
  const [serverError, setServerError] = useState<string | null>(
    initialError ? "Email atau password salah" : null,
  );
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!result || result.error) {
        setServerError("Email atau password salah");
        return;
      }

      // Force full reload to ensure session cookie is set
      window.location.href = callbackUrl || "/dashboard";
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      {serverError && (
        <div className={styles.error} role="alert">
          <Icons.AlertCircle size={16} />
          <span>{serverError}</span>
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <div className={styles.inputWrap}>
          <Icons.Mail size={16} className={styles.inputIcon} />
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nama@perusahaan.co.id"
            className={styles.input}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </div>
        {errors.email && <p className={styles.fieldError}>{errors.email.message}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <div className={styles.inputWrap}>
          <Icons.Lock size={16} className={styles.inputIcon} />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
            className={styles.input}
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className={styles.fieldError}>{errors.password.message}</p>}
      </div>

      <Button type="submit" fullWidth size="lg" disabled={isPending}>
        {isPending ? (
          <>
            <Icons.Loader2 size={16} className={styles.spin} />
            Memproses\u2026
          </>
        ) : (
          <>
            Masuk
            <Icons.ArrowRight size={16} />
          </>
        )}
      </Button>
    </form>
  );
}