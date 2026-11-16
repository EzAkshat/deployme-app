export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "destructive";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary:
    "border border-border bg-surface text-foreground hover:bg-surface-hover",
  ghost: "text-muted-foreground hover:text-foreground",
  danger:
    "border border-destructive/40 bg-surface text-destructive hover:bg-destructive-bg",
  destructive:
    "bg-destructive text-destructive-foreground hover:opacity-90",
};

export function buttonClasses({
  variant = "primary",
  fullWidth = false,
  className = "",
}: {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  className?: string;
} = {}): string {
  return `inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${fullWidth ? "w-full" : ""} ${className}`.trim();
}