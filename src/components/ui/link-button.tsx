import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonClasses, type ButtonVariant } from "./button-styles";

interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export function LinkButton({
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={buttonClasses({ variant, fullWidth, className })}
      {...props}
    />
  );
}