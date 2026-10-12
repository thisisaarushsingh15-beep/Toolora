import type { ReactNode } from "react";

/**
 * Shared, accessible form primitives for every tool widget. Labels are always
 * real <label> elements, errors sit next to the input they belong to and are
 * announced, and every control keeps a 44px touch target on phones.
 */

export function describedBy(id: string, hint?: string, error?: string): string | undefined {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
      {children}
    </label>
  );
}

export function Hint({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={`${id}-hint`} className="mt-1 text-xs leading-relaxed text-muted">
      {children}
    </p>
  );
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-danger">
      {children}
    </p>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  children,
  className = "",
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {hint ? <Hint id={id}>{hint}</Hint> : null}
      <div className="mt-2">{children}</div>
      {error ? <FieldError id={id}>{error}</FieldError> : null}
    </div>
  );
}

export function TextInput({
  id,
  value,
  onChange,
  placeholder,
  error,
  hint,
  inputMode,
  className = "",
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  inputMode?: "text" | "decimal" | "numeric";
  className?: string;
}) {
  return (
    <input
      id={id}
      name={id}
      type="text"
      inputMode={inputMode ?? "text"}
      autoComplete="off"
      value={value}
      placeholder={placeholder}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, hint, error)}
      onChange={(event) => onChange(event.target.value)}
      className={`field ${error ? "border-danger" : ""} ${className}`}
    />
  );
}

export function DateInput({
  id,
  value,
  onChange,
  error,
  hint,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
}) {
  return (
    <input
      id={id}
      name={id}
      type="date"
      value={value}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, hint, error)}
      onChange={(event) => onChange(event.target.value)}
      className={`field ${error ? "border-danger" : ""}`}
    />
  );
}

/** The live region every tool announces its answer in. */
export function ResultArea({
  children,
  heading,
}: {
  children: ReactNode;
  heading: string;
}) {
  return (
    <div className="mt-7 min-w-0">
      <h3 className="text-sm font-semibold text-ink">{heading}</h3>
      <div aria-live="polite" className="mt-3 min-w-0">
        {children}
      </div>
    </div>
  );
}

export function EmptyResult({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-card border border-dashed border-line-strong bg-surface-2 px-4 py-5 text-sm leading-relaxed text-muted">
      {children}
    </p>
  );
}

export function ResultCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 rounded-card border border-line bg-surface-2 p-4 sm:p-5 ${className}`}>
      {children}
    </div>
  );
}

export function BigResult({ value, label }: { value: string; label: string }) {
  return (
    <p className="min-w-0">
      <span className="eyebrow block">{label}</span>
      <span className="mt-2 block font-mono text-2xl font-semibold break-words text-ink sm:text-3xl">
        {value}
      </span>
    </p>
  );
}

export function StatRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="min-w-0 border-t border-line py-3 first:border-t-0 first:pt-0 last:pb-0">
      <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-medium break-words text-ink">{value}</dd>
      {hint ? <dd className="mt-1 text-xs leading-relaxed text-muted">{hint}</dd> : null}
    </div>
  );
}

export function Notice({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "warn" | "error";
}) {
  const classes =
    tone === "error"
      ? "border-danger bg-danger-soft text-danger"
      : tone === "warn"
        ? "border-line-strong bg-surface-2 text-ink"
        : "border-line bg-surface-2 text-muted";
  return (
    <p role={tone === "error" ? "alert" : undefined} className={`rounded-card border px-4 py-3 text-sm leading-relaxed break-words ${classes}`}>
      {children}
    </p>
  );
}

export function Checkbox({
  id,
  checked,
  onChange,
  label,
  hint,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="flex min-h-11 items-center gap-3">
        <input
          id={id}
          name={id}
          type="checkbox"
          checked={checked}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(event) => onChange(event.target.checked)}
          className="h-5 w-5 shrink-0 rounded-sm accent-[var(--accent)]"
        />
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      </div>
      {hint ? <Hint id={id}>{hint}</Hint> : null}
    </div>
  );
}

export function ToolNote({ children }: { children: ReactNode }) {
  return <div className="prose-block mt-6 rounded-card border border-line bg-surface-2 p-4 text-sm">{children}</div>;
}
