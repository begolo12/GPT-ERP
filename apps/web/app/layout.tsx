import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GPT-ERP \u2014 Daniswara Group",
  description: "Enterprise Resource Planning untuk Daniswara Group",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
