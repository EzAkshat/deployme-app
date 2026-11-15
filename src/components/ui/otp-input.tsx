"use client";

import {
  useRef,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  name,
  disabled = false,
  invalid = false,
  autoFocus = false,
}: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  function focusAt(index: number) {
    inputs.current[Math.max(0, Math.min(index, length - 1))]?.focus();
  }

  function commit(next: string) {
    onChange(next);
    if (next.length === length) onComplete?.(next);
  }

  // Writes digits starting at `index`; never leaves a gap.
  function insert(index: number, digits: string) {
    const position = Math.min(index, value.length);
    const next = (
      value.slice(0, position) + digits + value.slice(position + digits.length)
    ).slice(0, length);

    commit(next);
    focusAt(position + digits.length);
  }

  function remove(index: number) {
    if (index >= value.length) return;
    commit(value.slice(0, index) + value.slice(index + 1));
  }

  function handleChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    let digits = event.target.value.replace(/\D/g, "");

    if (digits === "") {
      remove(index);
      return;
    }

    // Typing into a filled box: keep only the newly typed digit.
    const existing = value[index];
    if (existing && digits.length === 2) digits = digits.replace(existing, "");

    insert(index, digits);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      event.preventDefault();
      remove(index - 1);
      focusAt(index - 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAt(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAt(index + 1);
    }
  }

  function handlePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();

    const digits = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!digits) return;

    insert(digits.length >= length ? 0 : index, digits.slice(0, length));
  }

  return (
    <div role="group" aria-label="One-time code" className="flex w-full max-w-sm gap-2">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          value={value[index] ?? ""}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.target.select()}
          className={`h-12 max-w-14 min-w-0 flex-1 rounded-lg border bg-surface text-center font-mono text-xl text-foreground transition-colors focus:border-primary disabled:opacity-50 ${
            invalid ? "border-destructive" : "border-border"
          }`}
        />
      ))}
      {name ? <input type="hidden" name={name} value={value} /> : null}
    </div>
  );
}