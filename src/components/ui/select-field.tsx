import type { SelectHTMLAttributes } from "react";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export function SelectField({
  label,
  className = "",
  children,
  ...props
}: SelectFieldProps) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <select
        className={`mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-foreground focus:border-primary disabled:opacity-60 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}