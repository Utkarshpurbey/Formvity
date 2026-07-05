import type { PageDef } from "./pageDef";

const titleClassStatic = "m-0 text-[1.75rem] font-semibold leading-[1.18] tracking-[-0.022em] text-[color:var(--fb-text)] sm:text-[2rem] sm:leading-[1.15]";

const titleClassCompact = "m-0 text-[1.35rem] font-semibold leading-snug tracking-[-0.02em] text-[color:var(--fb-text)] sm:text-[1.65rem] sm:leading-tight";

const descClassStatic =
  "m-0 max-w-[42rem] text-[0.9375rem] leading-[1.65] text-[color:var(--fb-muted)] sm:text-base sm:leading-[1.7]";

interface FormHeaderStaticProps {
  variant: "static";
  pageDef: Pick<PageDef, "title" | "description">;
  /** Slightly smaller title (e.g. template modal). */
  compact?: boolean;
  /** Badge text; set to `false` to hide (e.g. section headers). */
  badge?: string | false;
  /** Lighter header without gradient hero (section blocks). */
  section?: boolean;
  /** Render title block (default true). Use false when only page description differs. */
  showTitle?: boolean;
  /** Render description block (default true). */
  showDescription?: boolean;
}

interface FormHeaderEditableProps {
  variant: "editable";
  pageDef: Pick<PageDef, "title" | "description">;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string | undefined) => void;
}

export type FormHeaderProps = FormHeaderStaticProps | FormHeaderEditableProps;

/**
 * Form title + description region — structured like a strong form product header
 * (clear hierarchy, hero tint, optional description callout) rather than a plain card title.
 */
export function FormHeader(props: FormHeaderProps) {
  const isStatic = props.variant === "static";
  const compact = isStatic && props.compact;
  const section = isStatic && props.section;
  const badge = isStatic && props.badge !== false ? (props.badge ?? "Form") : null;
  const showTitle = !isStatic || props.showTitle !== false;
  const showDescription = !isStatic || props.showDescription !== false;
  const titleText = isStatic ? props.pageDef.title?.trim() : props.pageDef.title;
  const descText = isStatic ? props.pageDef.description?.trim() : props.pageDef.description;

  const titleTypography = compact || section ? titleClassCompact : titleClassStatic;
  const TitleTag = section ? "h2" : "h1";

  return (
    <header
      className={`shrink-0 ${section ? "border-b border-[color:color-mix(in_srgb,var(--fb-text)_6%,var(--fb-surface))]" : "border-b border-[color:color-mix(in_srgb,var(--fb-text)_9%,var(--fb-surface))]"}`}
    >
      <div
        className={`relative ${section ? "px-5 py-4 sm:px-8 sm:py-5" : "px-5 py-6 sm:px-8 sm:py-8"}`}
        style={
          section
            ? { background: "var(--fb-surface)" }
            : {
                background: `linear-gradient(
            168deg,
            color-mix(in srgb, var(--fb-primary) 16%, var(--fb-surface)) 0%,
            color-mix(in srgb, var(--fb-primary) 5%, var(--fb-surface)) 42%,
            var(--fb-surface) 72%
          )`,
              }
        }
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            background: `radial-gradient(ellipse 85% 100% at 100% -35%, color-mix(in srgb, var(--fb-primary) 38%, transparent), transparent 50%)`,
          }}
        />
        <div className="relative">
          {badge ? (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.18em] text-[color:var(--fb-primary)] ring-1 ring-[color:color-mix(in_srgb,var(--fb-primary)_35%,transparent)]"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--fb-primary) 10%, var(--fb-surface))",
                }}
              >
                {badge}
              </span>
              <span className="hidden h-px min-w-[2rem] flex-1 bg-[color:color-mix(in_srgb,var(--fb-text)_10%,var(--fb-surface))] sm:block" aria-hidden />
            </div>
          ) : null}

          {props.variant === "static" ? (
            <>
              {showTitle && titleText ? (
                <TitleTag className={titleTypography}>{titleText}</TitleTag>
              ) : null}
              {showDescription && descText ? (
                <div
                  className={`${showTitle && titleText ? "mt-4" : ""} rounded-r-[calc(var(--fb-radius)*0.85)] border-l-[3px] border-[color:var(--fb-primary)] bg-[color:color-mix(in_srgb,var(--fb-text)_3%,var(--fb-surface))] py-2.5 pl-4 pr-3 sm:py-3 sm:pl-5`}
                >
                  <p className={`${descClassStatic} whitespace-pre-wrap`}>{descText}</p>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <label className="sr-only" htmlFor="formvity-form-title">
                Form title
              </label>
              <input
                id="formvity-form-title"
                type="text"
                value={props.pageDef.title}
                onChange={(e) => props.onTitleChange(e.target.value)}
                placeholder="Form title"
                className={`w-full border-0 bg-transparent p-0 shadow-none placeholder:text-[color:var(--fb-muted)] placeholder:opacity-75 focus:outline-none focus:ring-0 ${titleTypography}`}
              />
              <label className="sr-only" htmlFor="formvity-form-description">
                Form description
              </label>
              <div className="mt-4 rounded-r-[calc(var(--fb-radius)*0.85)] border-l-[3px] border-[color:var(--fb-primary)] bg-[color:color-mix(in_srgb,var(--fb-text)_3%,var(--fb-surface))] py-2.5 pl-4 pr-3 sm:py-3 sm:pl-5">
                <textarea
                  id="formvity-form-description"
                  rows={2}
                  value={props.pageDef.description ?? ""}
                  onChange={(e) => props.onDescriptionChange(e.target.value || undefined)}
                  placeholder="Add a description for respondents (optional)"
                  className="min-h-[4.25rem] w-full resize-y border-0 bg-transparent p-0 text-[0.9375rem] leading-[1.65] text-[color:var(--fb-muted)] shadow-none placeholder:text-[color:var(--fb-muted)] placeholder:opacity-65 focus:outline-none focus:ring-0 sm:min-h-[4.5rem] sm:text-base sm:leading-[1.7]"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
