import type { FormEvent } from "react";

/** `onSubmit` handler that cancels the form unless the person confirms. */
export function confirmBeforeSubmit(message: string) {
  return (event: FormEvent<HTMLFormElement>) => {
    if (!window.confirm(message)) event.preventDefault();
  };
}