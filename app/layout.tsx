import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ClientProviders } from "../src/components/ClientProviders";
import "../src/index.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Formvity",
  description: "Form builder UI",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
