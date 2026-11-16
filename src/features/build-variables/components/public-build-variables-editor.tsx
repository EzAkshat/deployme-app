"use client";

import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import {
  MAX_PUBLIC_VARIABLES,
  compareNames,
  type PublicVariableRow,
} from "../parse";

type EditorRow = PublicVariableRow & { id: string };

interface PublicBuildVariablesEditorProps {
  initial?: Record<string, string>;
  /** Called on every edit, e.g. to clear a "settings reviewed" confirmation. */
  onChange?: () => void;
}

export function PublicBuildVariablesEditor({
  initial = {},
  onChange,
}: PublicBuildVariablesEditorProps) {
  const editorId = useId();
  const nextId = useRef(0);

  const [rows, setRows] = useState<EditorRow[]>(() =>
    Object.entries(initial)
      .sort(([left], [right]) => compareNames(left, right))
      .map(([name, value], index) => ({
        id: `initial-${index}`,
        name,
        value,
      })),
  );

  function updateRow(id: string, field: "name" | "value", value: string) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
    onChange?.();
  }

  function removeRow(id: string) {
    setRows((current) => current.filter((row) => row.id !== id));
    onChange?.();
  }

  function addRow() {
    nextId.current += 1;
    const id = `row-${nextId.current}`;

    setRows((current) => [...current, { id, name: "", value: "" }]);
    onChange?.();
  }

  return (
    <section
      aria-labelledby={`${editorId}-title`}
      className="space-y-4 rounded-xl border border-border p-4"
    >
      <div className="space-y-2">
        <h3 id={`${editorId}-title`} className="font-semibold">
          Public build variables
        </h3>
        <p id={`${editorId}-help`} className="text-sm text-muted-foreground">
          Configure public values such as your external API address. These
          values may appear in your published website. Do not enter passwords,
          private API keys, or database credentials.
        </p>
      </div>

      <input
        type="hidden"
        name="publicBuildVariablesRows"
        value={JSON.stringify(rows.map(({ name, value }) => ({ name, value })))}
      />

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No public build variables configured.
        </p>
      ) : null}

      {rows.map((row, index) => (
        <div
          key={row.id}
          className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]"
        >
          <TextField
            label={`Name ${index + 1}`}
            value={row.name}
            onChange={(event) => updateRow(row.id, "name", event.target.value)}
            placeholder="VITE_API_BASE_URL"
            maxLength={128}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-describedby={`${editorId}-help`}
            className="font-mono text-sm"
          />

          <label className="block text-sm font-medium">
            Value {index + 1}
            <textarea
              value={row.value}
              onChange={(event) =>
                updateRow(row.id, "value", event.target.value)
              }
              placeholder="https://api.example.com"
              maxLength={4_096}
              rows={2}
              autoComplete="off"
              spellCheck={false}
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 font-mono text-sm text-foreground placeholder:text-subtle-foreground focus:border-primary disabled:opacity-60"
            />
          </label>

          <Button
            variant="ghost"
            aria-label={`Remove variable ${row.name || index + 1}`}
            onClick={() => removeRow(row.id)}
          >
            Remove
          </Button>
        </div>
      ))}

      <Button
        variant="secondary"
        disabled={rows.length >= MAX_PUBLIC_VARIABLES}
        onClick={addRow}
      >
        Add variable
      </Button>

      <p className="text-sm text-muted-foreground">
        Names must start with VITE_, NEXT_PUBLIC_, NUXT_PUBLIC_, REACT_APP_,
        VUE_APP_ or PUBLIC_. Use the name your application’s build tool
        expects. Changes take effect in a new deployment.
      </p>
    </section>
  );
}