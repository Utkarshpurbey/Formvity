/**
 * Reference data for PageDef components.
 * Used by `page-def/builder` (palette, defaults, config panel).
 */

export interface ComponentSpec {
  type: string;
  description: string;
  valueFormat: string;
  /** Default label shown in Formvity when this component is added. */
  defaultLabel: string;
  specificProps: { name: string; type: string; required: boolean; description: string }[];
  exampleJson: object;
}

export const COMPONENT_SPECS: ComponentSpec[] = [
  {
    type: "text",
    description: "Single-line text input.",
    valueFormat: "string",
    defaultLabel: "Short text",
    specificProps: [
      { name: "placeholder", type: "string", required: false, description: "Placeholder text when empty." },
    ],
    exampleJson: { id: "name", type: "text", label: "Full Name", required: true, placeholder: "Enter your name" },
  },
  {
    type: "number",
    description: "Numeric input with optional min/max/step.",
    valueFormat: "string (numeric)",
    defaultLabel: "Number",
    specificProps: [
      { name: "placeholder", type: "string", required: false, description: "Placeholder when empty." },
      { name: "min", type: "number", required: false, description: "Minimum value." },
      { name: "max", type: "number", required: false, description: "Maximum value." },
      { name: "step", type: "number", required: false, description: "Step increment." },
    ],
    exampleJson: { id: "age", type: "number", label: "Age", min: 0, max: 120 },
  },
  {
    type: "email",
    description: "Email input with validation.",
    valueFormat: "string (valid email)",
    defaultLabel: "Email address",
    specificProps: [
      { name: "placeholder", type: "string", required: false, description: "Placeholder when empty." },
    ],
    exampleJson: { id: "email", type: "email", label: "Email", required: true },
  },
  {
    type: "phone",
    description: "Phone number input (validated as 10 digits by default).",
    valueFormat: "string",
    defaultLabel: "Phone number",
    specificProps: [
      { name: "placeholder", type: "string", required: false, description: "Placeholder when empty." },
    ],
    exampleJson: { id: "phone", type: "phone", label: "Phone Number", required: true },
  },
  {
    type: "url",
    description: "URL input with validation.",
    valueFormat: "string (valid URL)",
    defaultLabel: "Website URL",
    specificProps: [
      { name: "placeholder", type: "string", required: false, description: "e.g. https://example.com" },
    ],
    exampleJson: { id: "website", type: "url", label: "Website", placeholder: "https://" },
  },
  {
    type: "textarea",
    description: "Multi-line text input.",
    valueFormat: "string",
    defaultLabel: "Long text / description",
    specificProps: [
      { name: "placeholder", type: "string", required: false, description: "Placeholder when empty." },
      { name: "rows", type: "number", required: false, description: "Visible rows (default 4)." },
    ],
    exampleJson: { id: "about", type: "textarea", label: "About you", rows: 4 },
  },
  {
    type: "select",
    description: "Dropdown single-select from options.",
    valueFormat: "string (selected option)",
    defaultLabel: "Choose one",
    specificProps: [
      { name: "options", type: "string[]", required: true, description: "List of options." },
      { name: "placeholder", type: "string", required: false, description: "Placeholder for empty state." },
    ],
    exampleJson: { id: "country", type: "select", label: "Country", required: true, options: ["India", "USA", "UK"] },
  },
  {
    type: "radio",
    description: "Single choice from options (radio buttons).",
    valueFormat: "string (selected option)",
    defaultLabel: "Single choice",
    specificProps: [
      { name: "options", type: "string[]", required: true, description: "List of options." },
    ],
    exampleJson: { id: "contact", type: "radio", label: "Contact method", options: ["Email", "Phone", "Post"] },
  },
  {
    type: "multiselect",
    description: "Multiple choice from options (checkboxes). Value is comma-separated.",
    valueFormat: "string (comma-separated selected options, e.g. \"A,B,C\")",
    defaultLabel: "Select all that apply",
    specificProps: [
      { name: "options", type: "string[]", required: true, description: "List of options." },
    ],
    exampleJson: { id: "prefs", type: "multiselect", label: "Preferences", options: ["News", "Updates", "Marketing"] },
  },
  {
    type: "checkbox",
    description: "Single checkbox (yes/no). Value is \"true\" or \"false\".",
    valueFormat: "\"true\" | \"false\"",
    defaultLabel: "Checkbox",
    specificProps: [
      { name: "checkboxLabel", type: "string", required: false, description: "Label next to checkbox (default \"Yes\")." },
    ],
    exampleJson: { id: "agreed", type: "checkbox", label: "I agree to terms", checkboxLabel: "Yes, I agree" },
  },
  {
    type: "date",
    description: "Date picker. Value is YYYY-MM-DD.",
    valueFormat: "string (YYYY-MM-DD)",
    defaultLabel: "Date",
    specificProps: [
      { name: "min", type: "string", required: false, description: "Min date (YYYY-MM-DD)." },
      { name: "max", type: "string", required: false, description: "Max date (YYYY-MM-DD)." },
    ],
    exampleJson: { id: "dob", type: "date", label: "Date of birth", min: "1900-01-01", max: "2025-12-31" },
  },
  {
    type: "time",
    description: "Time picker. Value is HH:mm or HH:mm:ss.",
    valueFormat: "string (HH:mm)",
    defaultLabel: "Time",
    specificProps: [
      { name: "min", type: "string", required: false, description: "Min time (HH:mm)." },
      { name: "max", type: "string", required: false, description: "Max time (HH:mm)." },
    ],
    exampleJson: { id: "appointment", type: "time", label: "Preferred time" },
  },
  {
    type: "rating",
    description: "Star rating (1–5 by default).",
    valueFormat: "string (number)",
    defaultLabel: "Rating",
    specificProps: [
      { name: "maxStars", type: "number", required: false, description: "Max stars (default 5)." },
    ],
    exampleJson: { id: "rating1", type: "rating", label: "How was your experience?", required: true, maxStars: 5 },
  },
  {
    type: "scale",
    description: "Linear scale (0–10 NPS-style).",
    valueFormat: "string (number)",
    defaultLabel: "Likelihood to recommend",
    specificProps: [
      { name: "min", type: "number", required: false, description: "Min value (default 0)." },
      { name: "max", type: "number", required: false, description: "Max value (default 10)." },
      { name: "minLabel", type: "string", required: false, description: "Label for min end." },
      { name: "maxLabel", type: "string", required: false, description: "Label for max end." },
    ],
    exampleJson: { id: "nps", type: "scale", label: "How likely are you to recommend us?", required: true, min: 0, max: 10 },
  },
  {
    type: "section",
    description: "Section header and body copy (no answer stored).",
    valueFormat: "none",
    defaultLabel: "Section",
    specificProps: [
      { name: "body", type: "string", required: false, description: "Paragraph text below the title." },
    ],
    exampleJson: { id: "section1", type: "section", label: "About this section", body: "Use sections to group questions or add instructions." },
  },
  {
    type: "file",
    description: "File upload (UI stub until backend presign).",
    valueFormat: "string (filename)",
    defaultLabel: "Upload file",
    specificProps: [
      { name: "accept", type: "string", required: false, description: "Accepted MIME types, e.g. image/*" },
    ],
    exampleJson: { id: "resume", type: "file", label: "Upload resume", accept: ".pdf,.doc,.docx" },
  },
  {
    type: "signature",
    description: "Drawn signature captured as base64 PNG.",
    valueFormat: "string (base64 data URL)",
    defaultLabel: "Signature",
    specificProps: [],
    exampleJson: { id: "signature1", type: "signature", label: "Sign here", required: true },
  },
];

/** Shown in the docs as a shape guide (not exhaustive). */
export const PAGEDEF_STRUCTURE = {
  id: "string",
  title: "string — main heading in the form header",
  description: "string (optional) — subtitle / instructions; multi-line in the visual builder",
  formSettings: {
    appearance: {
      primaryColor: "hex — accent, focus rings, primary button",
      backgroundColor: "hex — page behind the form card",
      surfaceColor: "hex — form card background",
      textColor: "hex — title and field text",
      borderRadius: '"sm" | "md" | "lg"',
      submitStyle: '"solid" | "soft" | "outline"',
      inputStyle: '"outline" | "filled"',
    },
  },
  components: "PageComponentDef[]",
  actions: "Record<string, string> (optional) — actionId → JS body; used with onChange @actionDef.* refs",
};

/** Palette groups for Formvity. Drag one of these; concrete type is chosen in Config. */
export interface PaletteSpec {
  id: string;
  label: string;
  description: string;
  /** Default component type when dropped (e.g. "text" for TextField). */
  defaultType: string;
  /** If set, Config panel shows a Type dropdown with these options. */
  subTypes?: string[];
}

export const PALETTE_SPECS: PaletteSpec[] = [
  { id: "TextField", label: "Text field", description: "Single-line text: plain, email, phone, or URL.", defaultType: "text", subTypes: ["text", "email", "phone", "url"] },
  { id: "Number", label: "Number", description: "Numeric input with optional min/max/step.", defaultType: "number" },
  { id: "TextArea", label: "Long text", description: "Multi-line text input.", defaultType: "textarea" },
  { id: "Select", label: "Select", description: "Dropdown single-select from options.", defaultType: "select" },
  { id: "Choice", label: "Choice", description: "Single or multiple choice (radio or checkboxes). Set multi in Config.", defaultType: "radio", subTypes: ["radio", "multiselect"] },
  { id: "Checkbox", label: "Checkbox", description: "Single checkbox (yes/no).", defaultType: "checkbox" },
  { id: "DateAndTime", label: "Date & time", description: "Date or time picker.", defaultType: "date", subTypes: ["date", "time"] },
];

export const V2_PALETTE_SPECS: PaletteSpec[] = [
  ...PALETTE_SPECS,
  { id: "Rating", label: "Rating", description: "1–5 star rating.", defaultType: "rating" },
  { id: "Scale", label: "Scale", description: "0–10 linear scale (NPS-style).", defaultType: "scale" },
  { id: "Section", label: "Section", description: "Title and body text block.", defaultType: "section" },
  { id: "FileUpload", label: "File upload", description: "File picker (preview stub).", defaultType: "file" },
  { id: "Signature", label: "Signature", description: "Draw a signature.", defaultType: "signature" },
];

export function getPaletteSpecs(): PaletteSpec[] {
  return V2_PALETTE_SPECS;
}

/** For Config panel: which types show a Type dropdown and what options they get. */
export const TYPE_GROUPS: Record<string, string[]> = {
  text: ["text", "email", "phone", "url"],
  email: ["text", "email", "phone", "url"],
  phone: ["text", "email", "phone", "url"],
  url: ["text", "email", "phone", "url"],
  radio: ["radio", "multiselect"],
  multiselect: ["radio", "multiselect"],
  date: ["date", "time"],
  time: ["date", "time"],
};

/** Returns the Type dropdown options for a component type, or null if not in a group. */
export function getTypeGroup(type: string): string[] | null {
  const group = TYPE_GROUPS[type];
  return group ?? null;
}
