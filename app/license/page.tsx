import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "../../src/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "License",
  description: "Software license and usage terms for Formvity.",
  path: "/license",
});

export default function LicensePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-slate-700">
      <Link href="/" className="text-sm font-medium text-violet-600 hover:text-violet-700">
        ← Back to home
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-slate-900">License</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: July 2026</p>

      <div className="prose prose-slate mt-8 max-w-none space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Software license</h2>
          <p>
            Formvity grants you a limited, non-exclusive, non-transferable, revocable license to access and use the
            Formvity web application for your internal business or personal purposes, subject to these terms and
            our{" "}
            <Link href="/terms" className="font-medium text-violet-600 hover:text-violet-700">
              Terms of Service
            </Link>
            .
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Restrictions</h2>
          <p>Unless we give written permission, you may not:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Copy, modify, or create derivative works of the Formvity software.</li>
            <li>Resell, sublicense, or white-label the platform as your own product.</li>
            <li>Remove proprietary notices or circumvent access controls.</li>
            <li>Use automated means to scrape the application beyond normal API usage we provide.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Templates &amp; assets</h2>
          <p>
            Form templates included in Formvity are licensed for use within the platform to create and publish
            your own forms. Template structure and copy may be customized for your organization; redistribution
            of the template catalog itself is not permitted.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Open-source components</h2>
          <p>
            Formvity may incorporate open-source libraries governed by their respective licenses. Nothing in this
            page limits your rights under those third-party licenses.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Termination</h2>
          <p>
            This license ends if you violate these terms or close your account. Upon termination, your right to use
            the software ceases, subject to any data export or retention described in our{" "}
            <Link href="/privacy" className="font-medium text-violet-600 hover:text-violet-700">
              Privacy Policy
            </Link>
            .
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
          <p>
            Licensing questions:{" "}
            <a href="mailto:legal@formvity.in" className="font-medium text-violet-600 hover:text-violet-700">
              legal@formvity.in
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
