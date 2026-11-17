import type { ReactNode, TextareaHTMLAttributes } from "react";

interface TextAreaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "children"> {
  label: ReactNode;
}

export function TextAreaField({
  label,
  className = "",
  ...props
}: TextAreaFieldProps) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <textarea
        className={`mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-foreground placeholder:text-subtle-foreground focus:border-primary disabled:opacity-60 ${className}`}
        {...props}
      />
    </label>
  );
}