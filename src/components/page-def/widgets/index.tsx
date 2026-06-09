"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { PageComponentType } from "../builder/pageDef";

interface BaseProps {
  value: string;
  error?: string;
  label?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  containerClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  helperTextClassName?: string;
}

/** Shared aesthetic styles for all form controls */
const inputStyles = {
  container: "space-y-2",
  label:
    "block text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--fb-label,#475569)]",
  required: "text-[color:var(--fb-primary,#4f46e5)] ml-0.5 font-bold",
  helper: "text-[0.8125rem] leading-relaxed text-[color:var(--fb-muted,#64748b)]",
  inputBase:
    "w-full rounded-[var(--fb-radius,0.75rem)] px-4 py-3 text-[0.9375rem] text-[color:var(--fb-text,#0f172a)] placeholder:text-[color:var(--fb-muted,#94a3b8)] placeholder:opacity-90 transition-[border-color,box-shadow,background-color] duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-55",
  inputError:
    "!border-rose-400 focus:!border-rose-500 focus:!ring-rose-500/20",
  errorText: "text-sm text-rose-600 mt-1.5 flex items-center gap-1.5",
} as const;

type TextFieldVariant = "text" | "email" | "phone" | "url";

const PLACEHOLDERS: Record<TextFieldVariant, string> = {
  text: "Enter your answer",
  email: "Enter your email",
  phone: "Enter your phone number",
  url: "https://example.com",
};

const INPUT_TYPES: Record<TextFieldVariant, string> = {
  text: "text",
  email: "email",
  phone: "tel",
  url: "url",
};

interface TextFieldProps extends BaseProps {
  variant?: TextFieldVariant;
  placeholder?: string;
}

const TextField = ({
  value,
  error,
  label,
  helperText,
  required,
  disabled,
  onChange,
  onBlur,
  variant = "text",
  placeholder,
  containerClassName,
  inputClassName,
  errorClassName,
  helperTextClassName,
}: TextFieldProps) => {
  const inputType = INPUT_TYPES[variant];
  const place = placeholder ?? PLACEHOLDERS[variant];

  return (
    <div className={containerClassName ?? inputStyles.container}>
      {label && (
        <label className={inputStyles.label}>
          {label}
          {required && <span className={inputStyles.required} aria-hidden>*</span>}
        </label>
      )}
      {helperText && (
        <p className={helperTextClassName ?? inputStyles.helper}>{helperText}</p>
      )}
      <input
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur?.(e.target.value)}
        placeholder={place}
        disabled={disabled}
        className={`${inputStyles.inputBase} ${error ? inputStyles.inputError : ""} ${inputClassName ?? ""}`}
        aria-invalid={!!error}
      />
      {error && (
        <p role="alert" className={errorClassName ?? inputStyles.errorText}>
          <span className="size-1.5 rounded-full bg-rose-500 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
};

interface NumberProps extends BaseProps {
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

const NumberInput = ({
  value,
  error,
  label,
  helperText,
  required,
  disabled,
  onChange,
  onBlur,
  placeholder = "Enter a number",
  min,
  max,
  step,
  containerClassName,
  inputClassName,
  errorClassName,
  helperTextClassName,
}: NumberProps) => (
  <div className={containerClassName ?? inputStyles.container}>
    {label && (
      <label className={inputStyles.label}>
        {label}
        {required && <span className={inputStyles.required} aria-hidden>*</span>}
      </label>
    )}
    {helperText && (
      <p className={helperTextClassName ?? inputStyles.helper}>{helperText}</p>
    )}
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => onBlur?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      className={`${inputStyles.inputBase} ${error ? inputStyles.inputError : ""} ${inputClassName ?? ""}`}
      aria-invalid={!!error}
    />
    {error && (
      <p role="alert" className={errorClassName ?? inputStyles.errorText}>
        <span className="size-1.5 rounded-full bg-rose-500 shrink-0" aria-hidden />
        {error}
      </p>
    )}
  </div>
);

interface TextAreaProps extends BaseProps {
  placeholder?: string;
  rows?: number;
}

const TextArea = ({
  value,
  error,
  label,
  helperText,
  required,
  disabled,
  onChange,
  onBlur,
  placeholder = "Enter a description",
  rows = 4,
  containerClassName,
  inputClassName,
  errorClassName,
  helperTextClassName,
}: TextAreaProps) => (
  <div className={containerClassName ?? inputStyles.container}>
    {label && (
      <label className={inputStyles.label}>
        {label}
        {required && <span className={inputStyles.required} aria-hidden>*</span>}
      </label>
    )}
    {helperText && (
      <p className={helperTextClassName ?? inputStyles.helper}>{helperText}</p>
    )}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => onBlur?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className={`${inputStyles.inputBase} resize-y min-h-[6rem] ${error ? inputStyles.inputError : ""} ${inputClassName ?? ""}`}
      aria-invalid={!!error}
    />
    {error && (
      <p role="alert" className={errorClassName ?? inputStyles.errorText}>
        <span className="size-1.5 rounded-full bg-rose-500 shrink-0" aria-hidden />
        {error}
      </p>
    )}
  </div>
);

interface SelectProps extends BaseProps {
  options: string[];
  placeholder?: string;
}

const selectAppearance =
  "appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5rem] bg-[right_0.75rem_center] bg-no-repeat pr-10";

const Select = ({
  value,
  error,
  label,
  helperText,
  required,
  disabled,
  onChange,
  onBlur,
  options,
  placeholder = "Select an option",
  containerClassName,
  inputClassName,
  errorClassName,
  helperTextClassName,
}: SelectProps) => (
  <div className={containerClassName ?? inputStyles.container}>
    {label && (
      <label className={inputStyles.label}>
        {label}
        {required && <span className={inputStyles.required} aria-hidden>*</span>}
      </label>
    )}
    {helperText && (
      <p className={helperTextClassName ?? inputStyles.helper}>{helperText}</p>
    )}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => onBlur?.(e.target.value)}
      disabled={disabled}
      className={`${inputStyles.inputBase} ${selectAppearance} ${error ? inputStyles.inputError : ""} ${inputClassName ?? ""}`}
      aria-invalid={!!error}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    {error && (
      <p role="alert" className={errorClassName ?? inputStyles.errorText}>
        <span className="size-1.5 rounded-full bg-rose-500 shrink-0" aria-hidden />
        {error}
      </p>
    )}
  </div>
);

interface CheckboxProps extends BaseProps {
  /** Optional label shown next to the checkbox (in addition to main label). */
  checkboxLabel?: string;
}

/** Value is "true" or "false" (string) for form compatibility. */
const Checkbox = ({
  value,
  error,
  label,
  helperText,
  required,
  disabled,
  onChange,
  checkboxLabel = "Yes",
  containerClassName,
  errorClassName,
  helperTextClassName,
}: CheckboxProps) => {
  const checked = value === "true";

  return (
    <div className={containerClassName ?? inputStyles.container}>
      {label && (
        <span className={inputStyles.label}>
          {label}
          {required && <span className={inputStyles.required} aria-hidden>*</span>}
        </span>
      )}
      {helperText && (
        <p className={helperTextClassName ?? inputStyles.helper}>{helperText}</p>
      )}
      <label className="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
          disabled={disabled}
          className="size-5 rounded border-2 border-[color:var(--fb-input-border,#cbd5e1)] text-[color:var(--fb-primary,#4f46e5)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fb-ring)] focus:ring-offset-2 focus:ring-offset-[color:var(--fb-surface,white)] disabled:opacity-60"
          aria-invalid={!!error}
        />
        <span className="text-[0.9375rem] text-[color:var(--fb-text,#0f172a)] select-none opacity-90 group-hover:opacity-100">
          {checkboxLabel}
        </span>
      </label>
      {error && (
        <p role="alert" className={errorClassName ?? inputStyles.errorText}>
          <span className="size-1.5 rounded-full bg-rose-500 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
};

type DateTimeVariant = "date" | "time";

interface DateTimeProps extends BaseProps {
  variant: DateTimeVariant;
  min?: string;
  max?: string;
  placeholder?: string;
}

const DateTime = ({
  value,
  error,
  label,
  helperText,
  required,
  disabled,
  onChange,
  onBlur,
  variant,
  min,
  max,
  containerClassName,
  inputClassName,
  errorClassName,
  helperTextClassName,
}: DateTimeProps) => {
  const inputType = variant === "date" ? "date" : "time";

  return (
    <div className={containerClassName ?? inputStyles.container}>
      {label && (
        <label className={inputStyles.label}>
          {label}
          {required && <span className={inputStyles.required} aria-hidden>*</span>}
        </label>
      )}
      {helperText && (
        <p className={helperTextClassName ?? inputStyles.helper}>{helperText}</p>
      )}
      <input
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur?.(e.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        className={`${inputStyles.inputBase} ${error ? inputStyles.inputError : ""} ${inputClassName ?? ""}`}
        aria-invalid={!!error}
      />
      {error && (
        <p role="alert" className={errorClassName ?? inputStyles.errorText}>
          <span className="size-1.5 rounded-full bg-rose-500 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
};

type ChoiceVariant = "radio" | "multiselect";

/** Separator for storing multiple values in a single string (e.g. "A,B,C"). */
const MULTI_SELECT_SEP = ",";

function parseMultiValues(value: string): string[] {
  if (!value.trim()) return [];
  return value.split(MULTI_SELECT_SEP).map((s) => s.trim()).filter(Boolean);
}

function serializeMultiValues(values: string[]): string {
  return values.join(MULTI_SELECT_SEP);
}

interface ChoiceProps extends BaseProps {
  variant: ChoiceVariant;
  options: string[];
  name?: string;
  id?: string;
}

const Choice = ({
  value,
  error,
  label,
  helperText,
  required,
  disabled,
  onChange,
  onBlur,
  variant,
  options,
  name,
  id,
  containerClassName,
  errorClassName,
  helperTextClassName,
}: ChoiceProps) => {
  if (variant === "radio") {
    const groupName = name ?? id ?? label ?? "radio";
    return (
      <div className={containerClassName ?? inputStyles.container}>
        {label && (
          <span className={inputStyles.label}>
            {label}
            {required && <span className={inputStyles.required} aria-hidden>*</span>}
          </span>
        )}
        {helperText && (
          <p className={helperTextClassName ?? inputStyles.helper}>{helperText}</p>
        )}
        <fieldset className="space-y-2" aria-invalid={!!error}>
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name={groupName}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                onBlur={() => onBlur?.(value)}
                disabled={disabled}
                className="size-4 border-2 border-[color:var(--fb-input-border,#cbd5e1)] text-[color:var(--fb-primary,#4f46e5)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fb-ring)] focus:ring-offset-2 focus:ring-offset-[color:var(--fb-surface,white)] disabled:opacity-60"
              />
              <span className="text-[0.9375rem] text-[color:var(--fb-text,#0f172a)] select-none opacity-90 group-hover:opacity-100">
                {opt}
              </span>
            </label>
          ))}
        </fieldset>
        {error && (
          <p role="alert" className={errorClassName ?? inputStyles.errorText}>
            <span className="size-1.5 rounded-full bg-rose-500 shrink-0" aria-hidden />
            {error}
          </p>
        )}
      </div>
    );
  }

  // multiselect
  const selected = parseMultiValues(value);
  const toggle = (opt: string) => {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt];
    onChange(serializeMultiValues(next));
  };

  return (
    <div className={containerClassName ?? inputStyles.container}>
      {label && (
        <span className={inputStyles.label}>
          {label}
          {required && <span className={inputStyles.required} aria-hidden>*</span>}
        </span>
      )}
      {helperText && (
        <p className={helperTextClassName ?? inputStyles.helper}>{helperText}</p>
      )}
      <fieldset className="space-y-2" aria-invalid={!!error}>
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
              disabled={disabled}
              className="size-4 rounded border-2 border-[color:var(--fb-input-border,#cbd5e1)] text-[color:var(--fb-primary,#4f46e5)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fb-ring)] focus:ring-offset-2 focus:ring-offset-[color:var(--fb-surface,white)] disabled:opacity-60"
            />
            <span className="text-[0.9375rem] text-[color:var(--fb-text,#0f172a)] select-none opacity-90 group-hover:opacity-100">
              {opt}
            </span>
          </label>
        ))}
      </fieldset>
      {error && (
        <p role="alert" className={errorClassName ?? inputStyles.errorText}>
          <span className="size-1.5 rounded-full bg-rose-500 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
};

// — v2 widgets —

interface RatingProps extends BaseProps {
  maxStars?: number;
}

const RatingWidget = ({
  value,
  onChange,
  label,
  helperText,
  required,
  disabled,
  error,
  maxStars = 5,
  containerClassName,
  errorClassName,
  helperTextClassName,
}: RatingProps) => {
  const stars = Math.min(Math.max(maxStars, 1), 10);
  const current = parseInt(value, 10) || 0;
  return (
    <div className={containerClassName ?? inputStyles.container}>
      {label ? (
        <label className={inputStyles.label}>
          {label}
          {required ? <span className={inputStyles.required}>*</span> : null}
        </label>
      ) : null}
      {helperText ? <p className={helperTextClassName ?? inputStyles.helper}>{helperText}</p> : null}
      <div className="flex gap-1" role="group" aria-label={label ?? "Rating"}>
        {Array.from({ length: stars }, (_, i) => {
          const star = i + 1;
          const filled = star <= current;
          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              onClick={() => onChange(String(star))}
              className={`text-2xl transition ${filled ? "text-amber-400" : "text-slate-300 hover:text-amber-300"} disabled:opacity-50`}
            >
              ★
            </button>
          );
        })}
      </div>
      {error ? (
        <p role="alert" className={errorClassName ?? inputStyles.errorText}>
          <span className="size-1.5 rounded-full bg-rose-500 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
};

interface ScaleProps extends BaseProps {
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
}

const ScaleWidget = ({
  value,
  onChange,
  label,
  helperText,
  required,
  disabled,
  error,
  min = 0,
  max = 10,
  minLabel,
  maxLabel,
  containerClassName,
  errorClassName,
  helperTextClassName,
}: ScaleProps) => {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const points = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  return (
    <div className={containerClassName ?? inputStyles.container}>
      {label ? (
        <label className={inputStyles.label}>
          {label}
          {required ? <span className={inputStyles.required}>*</span> : null}
        </label>
      ) : null}
      {helperText ? <p className={helperTextClassName ?? inputStyles.helper}>{helperText}</p> : null}
      <div className="flex flex-wrap gap-1.5" role="group">
        {points.map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(String(n))}
            className={`min-w-[2.25rem] rounded-lg border px-2 py-1.5 text-sm font-semibold transition ${
              value === String(n)
                ? "border-[color:var(--fb-primary,#4f46e5)] bg-[color:var(--fb-primary,#4f46e5)] text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"
            } disabled:opacity-50`}
          >
            {n}
          </button>
        ))}
      </div>
      {(minLabel || maxLabel) ? (
        <div className="mt-1 flex justify-between text-xs text-[color:var(--fb-muted,#64748b)]">
          <span>{minLabel ?? lo}</span>
          <span>{maxLabel ?? hi}</span>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className={errorClassName ?? inputStyles.errorText}>
          <span className="size-1.5 rounded-full bg-rose-500 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
};

interface SectionProps {
  label?: string;
  body?: string;
  containerClassName?: string;
}

const SectionBlock = ({ label, body, containerClassName }: SectionProps) => (
  <div className={containerClassName ?? "space-y-2 pt-2"}>
    {label ? <h3 className="text-lg font-semibold text-[color:var(--fb-text,#0f172a)]">{label}</h3> : null}
    {body ? <p className="text-sm leading-relaxed text-[color:var(--fb-muted,#64748b)] whitespace-pre-wrap">{body}</p> : null}
  </div>
);

interface FileUploadProps extends BaseProps {
  accept?: string;
}

const FileUploadWidget = ({
  value,
  onChange,
  label,
  helperText,
  required,
  disabled,
  error,
  accept,
  containerClassName,
  inputClassName,
  errorClassName,
  helperTextClassName,
}: FileUploadProps) => (
  <div className={containerClassName ?? inputStyles.container}>
    {label ? (
      <label className={inputStyles.label}>
        {label}
        {required ? <span className={inputStyles.required}>*</span> : null}
      </label>
    ) : null}
    {helperText ? <p className={helperTextClassName ?? inputStyles.helper}>{helperText}</p> : null}
    <input
      type="file"
      accept={accept}
      disabled={disabled}
      className={`${inputStyles.inputBase} ${inputClassName ?? ""} file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-sm file:font-medium file:text-indigo-700`}
      onChange={(e) => {
        const file = e.target.files?.[0];
        onChange(file ? file.name : "");
      }}
    />
    {value ? <p className="text-xs text-[color:var(--fb-muted,#64748b)]">Selected: {value}</p> : null}
    <p className="text-xs text-amber-600">File upload storage coming soon — filename captured for preview.</p>
    {error ? (
      <p role="alert" className={errorClassName ?? inputStyles.errorText}>
        <span className="size-1.5 rounded-full bg-rose-500 shrink-0" aria-hidden />
        {error}
      </p>
    ) : null}
  </div>
);

interface SignatureProps extends BaseProps {}

function SignatureCaptureDialog({
  open,
  initialValue,
  onClose,
  onSave,
}: {
  open: boolean;
  initialValue: string;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!initialValue) return;
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = initialValue;
  }, [open, initialValue]);

  const getPoint = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = "touches" in e ? e.touches[0]!.clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0]!.clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawing.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { x, y } = getPoint(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { x, y } = getPoint(e, canvas);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    drawing.current = false;
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL("image/png"));
    onClose();
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-[100] m-auto w-[min(100%-2rem,28rem)] rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50"
    >
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Sign here</h2>
        <p className="mt-1 text-sm text-slate-500">Draw your signature with mouse or finger, then save.</p>
      </div>
      <div className="p-5">
        <canvas
          ref={canvasRef}
          width={480}
          height={180}
          className="w-full touch-none rounded-xl border-2 border-dashed border-slate-200 bg-slate-50"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
        <button type="button" onClick={clearCanvas} className="mr-auto text-sm font-medium text-slate-600 hover:text-slate-900">
          Clear
        </button>
        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Save signature
        </button>
      </div>
    </dialog>
  );
}

const SignatureWidget = ({
  value,
  onChange,
  label,
  helperText,
  required,
  disabled,
  error,
  containerClassName,
  errorClassName,
  helperTextClassName,
}: SignatureProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className={containerClassName ?? inputStyles.container}>
      {label ? (
        <label className={inputStyles.label}>
          {label}
          {required ? <span className={inputStyles.required}>*</span> : null}
        </label>
      ) : null}
      {helperText ? <p className={helperTextClassName ?? inputStyles.helper}>{helperText}</p> : null}

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        {value ? (
          <div className="mb-3 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Your signature" className="mx-auto max-h-20 w-full object-contain" />
          </div>
        ) : (
          <p className="mb-3 text-center text-sm text-slate-400">No signature yet</p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setDialogOpen(true)}
            className="flex-1 rounded-lg bg-[color:var(--fb-primary,#4f46e5)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {value ? "Edit signature" : "Open signature pad"}
          </button>
          {value ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange("")}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>

      <SignatureCaptureDialog
        open={dialogOpen}
        initialValue={value}
        onClose={() => setDialogOpen(false)}
        onSave={onChange}
      />

      {error ? (
        <p role="alert" className={errorClassName ?? inputStyles.errorText}>
          <span className="size-1.5 rounded-full bg-rose-500 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
};

/** Maps each PageDef type to a core component. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const REGISTRY: Record<PageComponentType, React.ComponentType<any>> = {
  text: TextField,
  email: TextField,
  phone: TextField,
  url: TextField,
  number: NumberInput,
  textarea: TextArea,
  select: Select,
  radio: Choice,
  multiselect: Choice,
  checkbox: Checkbox,
  date: DateTime,
  time: DateTime,
  rating: RatingWidget,
  scale: ScaleWidget,
  section: SectionBlock,
  file: FileUploadWidget,
  signature: SignatureWidget,
};

/** Extra props to inject when rendering a type (e.g. variant, multiple). */
export function getVariantProps(type: PageComponentType): Record<string, unknown> {
  switch (type) {
    case "text":
      return { variant: "text" };
    case "email":
      return { variant: "email" };
    case "phone":
      return { variant: "phone" };
    case "url":
      return { variant: "url" };
    case "radio":
      return { variant: "radio" };
    case "multiselect":
      return { variant: "multiselect" };
    case "date":
      return { variant: "date" };
    case "time":
      return { variant: "time" };
    default:
      return {};
  }
}

export type RegistryKey = PageComponentType;
