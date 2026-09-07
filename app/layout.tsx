import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "منصة الأميرة التعليمية | التأسيس والابتدائي",
  description: "منصة الأميرة التعليمية - مرحلتا التأسيس والابتدائي",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-[var(--font-cairo)]">
        {children}
      </body>
    </html>
  );
}
