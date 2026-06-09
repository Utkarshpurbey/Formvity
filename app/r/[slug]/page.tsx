import PublicFormPageClient from "./PublicFormPageClient";

/** Static export (GitHub Pages): pre-render a shell; any slug hydrates client-side. */
export async function generateStaticParams() {
  return [{ slug: "_" }];
}

export default function PublicFormPage() {
  return <PublicFormPageClient />;
}
