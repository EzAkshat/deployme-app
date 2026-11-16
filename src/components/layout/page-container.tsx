import type { ReactNode } from "react";

const SIZES = {
  narrow: "max-w-3xl",
  medium: "max-w-4xl",
  wide: "max-w-7xl",
} as const;

interface PageContainerProps {
  children: ReactNode;
  size?: keyof typeof SIZES;
}

export function PageContainer({ children, size = "wide" }: PageContainerProps) {
  return (
    <div className={`mx-auto w-full px-5 py-10 sm:px-8 ${SIZES[size]}`}>
      {children}
    </div>
  );
}