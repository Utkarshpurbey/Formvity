import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "../../src/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Terms of Service",
  description: "Terms and conditions for using Formvity.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-slate-700">
      <Link href="/" className="text-sm font-medium text-violet-600 hover:text-violet-700">
        ← Back to home
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-slate-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: July 2026</p>

      <div className="prose prose-slate mt-8 max-w-none space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Agreement</h2>
          <p>
            By accessing or using Formvity at formvity.in, you agree to these Terms. If you do not agree, do not
            use the service.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">The service</h2>
          <p>
            Formvity provides an online form builder, publishing tools, and analytics. Features may change as we
            improve the product. We may suspend access for maintenance, abuse, or legal reasons.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Your account</h2>
          <p>
            You are responsible for your account credentials and for activity under your account. Provide accurate
            registration information and notify us of unauthorized use.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Acceptable use</h2>
          <p>You agree not to use Formvity to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Collect data without appropriate consent or legal basis.</li>
            <li>Distribute malware, spam, or deceptive content.</li>
            <li>Harass others or violate applicable laws.</li>
            <li>Attempt to disrupt or reverse-engineer the platform.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Your content</h2>
          <p>
            You retain ownership of forms and data you create. You grant us a limited license to host, process, and
            display that content solely to operate the service. You are responsible for the forms you publish and
            responses you collect.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Disclaimer</h2>
          <p>
            Formvity is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for indirect,
            incidental, or consequential damages arising from use of the service to the fullest extent permitted by
            law.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
          <p>
            Questions about these terms:{" "}
            <a href="mailto:legal@formvity.in" className="font-medium text-violet-600 hover:text-violet-700">
              legal@formvity.in
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
