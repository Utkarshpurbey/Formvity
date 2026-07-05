import type { Metadata } from "next";
import PublicFormPageClient from "./PublicFormPageClient";
import { getCachedPublicFormDef } from "../../../src/lib/formDefFromApi";
import { resolveRespondentIntake } from "../../../src/lib/respondentIntake";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { formDef } = await getCachedPublicFormDef(params.slug);
  if (!formDef) {
    return { title: "Form unavailable", robots: { index: false, follow: false } };
  }

  const intake = resolveRespondentIntake(formDef);
  const title = formDef.title?.trim() || intake.title?.trim() || "Form";
  const description = formDef.description?.trim() || intake.description?.trim();

  return {
    title,
    ...(description ? { description } : {}),
    robots: { index: true, follow: true },
  };
}

export default async function PublicFormPage({ params }: Props) {
  const { formDef, error } = await getCachedPublicFormDef(params.slug);

  return (
    <PublicFormPageClient slug={params.slug} initialFormDef={formDef} initialError={error} />
  );
}
