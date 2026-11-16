import type { InputHTMLAttributes, ReactNode } from "react";

interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "children"> {
  label: ReactNode;
  danger?: boolean;
}

export function TextField({
  label,
  danger = false,
  className = "",
  ...props
}: TextFieldProps) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        className={`mt-2 w-full rounded-lg border bg-surface px-4 py-3 text-base text-foreground placeholder:text-subtle-foreground focus:border-primary disabled:opacity-60 ${
          danger ? "border-destructive/50" : "border-border"
        } ${className}`}
        {...props}
      />
    </label>
  );
}