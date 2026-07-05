import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next"
import { Plus_Jakarta_Sans } from "next/font/google";
import { ClientProviders } from "../src/components/ClientProviders";
import "../src/index.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const GA_MEASUREMENT_ID = "G-H5233755B3";

export const metadata: Metadata = {
  title: "Formvity",
  description: "Form builder UI",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <ClientProviders>{children}</ClientProviders>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
