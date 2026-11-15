import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function TextField({ label, className = "", ...props }: TextFieldProps) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        className={`mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-foreground placeholder:text-subtle-foreground focus:border-primary disabled:opacity-60 ${className}`}
        {...props}
      />
    </label>
  );
}