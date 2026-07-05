import type {
  FormDef,
  RespondentIntakeField,
  RespondentIntakeSettings,
} from "../components/page-def/builder/pageDef";
import { allFormComponents } from "./formValidation";

export const DEFAULT_RESPONDENT_INTAKE: RespondentIntakeSettings = {
  title: "Before we begin",
  description: "Please provide your details so we can follow up if needed.",
  fields: [
    {
      id: "fullName",
      type: "text",
      label: "Full name",
      required: true,
      placeholder: "Enter your full name",
    },
    {
      id: "email",
      type: "email",
      label: "Email address",
      required: true,
      placeholder: "you@company.com",
    },
  ],
};

export function resolveRespondentIntake(formDef: FormDef): RespondentIntakeSettings {
  const configured = formDef.formSettings?.respondentIntake;
  if (configured?.fields?.length) {
    return {
      title: configured.title ?? DEFAULT_RESPONDENT_INTAKE.title,
      description: configured.description ?? DEFAULT_RESPONDENT_INTAKE.description,
      fields: configured.fields,
    };
  }
  return DEFAULT_RESPONDENT_INTAKE;
}

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone: string) => /^\d{10}$/.test(phone.replace(/\D/g, "").slice(-10));

export function validateRespondentIntake(
  fields: RespondentIntakeField[],
  values: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  fields.forEach((field) => {
    const val = (values[field.id] ?? "").trim();
    if (field.required && !val) {
      errors[field.id] = "This field is required";
      return;
    }
    if (field.type === "email" && val && !validateEmail(val)) {
      errors[field.id] = "Invalid email address";
    }
    if (field.type === "phone" && val && !validatePhone(val)) {
      errors[field.id] = "Invalid phone number";
    }
  });
  return errors;
}

export function isDefaultRespondentIntake(formDef: FormDef): boolean {
  const configured = formDef.formSettings?.respondentIntake;
  if (!configured?.fields?.length) return true;
  return JSON.stringify(configured) === JSON.stringify(DEFAULT_RESPONDENT_INTAKE);
}

export function splitSubmissionValues(
  formDef: FormDef,
  respondentValues: Record<string, string>,
  formValues: Record<string, string>,
): { respondent: Record<string, string>; answers: Record<string, string> } {
  const intake = resolveRespondentIntake(formDef);
  const intakeIds = new Set(intake.fields.map((f) => f.id));
  const componentIds = new Set(allFormComponents(formDef).map((c) => c.id));

  const respondent: Record<string, string> = {};
  intakeIds.forEach((id) => {
    if (respondentValues[id] !== undefined) respondent[id] = respondentValues[id]!;
  });

  const answers: Record<string, string> = {};
  Object.entries(formValues).forEach(([id, val]) => {
    if (componentIds.has(id)) answers[id] = val;
  });

  return { respondent, answers };
}
