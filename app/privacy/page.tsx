import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "../../src/components/seo/JsonLd";
import { createPageMetadata, marketingPageJsonLd } from "../../src/lib/seo";

const PRIVACY_DESCRIPTION = "How Formvity collects, uses, and protects your data.";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description: PRIVACY_DESCRIPTION,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={marketingPageJsonLd({
          title: "Privacy Policy",
          description: PRIVACY_DESCRIPTION,
          path: "/privacy",
        })}
      />
      <main className="mx-auto max-w-3xl px-4 py-16 text-slate-700">
      <Link href="/" className="text-sm font-medium text-violet-600 hover:text-violet-700">
        ← Back to home
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: July 2026</p>

      <div className="prose prose-slate mt-8 max-w-none space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
          <p>
            Formvity (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates formvity.in. This policy explains what
            information we collect when you use our form builder, publish forms, or submit responses, and how we
            use it.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Information we collect</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Account details you provide (name, email) when you register.</li>
            <li>Form definitions, workspace data, and responses you create or collect through the platform.</li>
            <li>Usage metadata such as device type, browser, and submission timestamps on public forms.</li>
            <li>Technical logs needed to operate and secure the service.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">How we use information</h2>
          <p>We use collected data to provide the service, improve reliability, show analytics to form owners, prevent abuse, and communicate about your account. We do not sell personal information.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Form responses</h2>
          <p>
            If you submit a response to a form published by another user, that data is controlled by the form owner.
            Contact them directly for questions about how your response is used.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Data retention &amp; security</h2>
          <p>
            We retain account and form data while your account is active or as needed to provide the service. We
            apply reasonable technical and organizational measures to protect data, but no online service can
            guarantee absolute security.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Your rights</h2>
          <p>
            You may request access, correction, or deletion of your account data by contacting us. Applicable
            privacy laws may provide additional rights depending on your location.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
          <p>
            Questions about this policy:{" "}
            <a href="mailto:privacy@formvity.in" className="font-medium text-violet-600 hover:text-violet-700">
              privacy@formvity.in
            </a>
          </p>
        </section>
      </div>
    </main>
    </>
  );
}
