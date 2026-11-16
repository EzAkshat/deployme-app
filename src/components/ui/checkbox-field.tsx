import type { InputHTMLAttributes, ReactNode } from "react";

interface CheckboxFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "children"> {
  label: ReactNode;
}

export function CheckboxField({
  label,
  className = "",
  ...props
}: CheckboxFieldProps) {
  return (
    <label className={`flex items-start gap-3 text-sm ${className}`}>
      <input
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 accent-primary"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}