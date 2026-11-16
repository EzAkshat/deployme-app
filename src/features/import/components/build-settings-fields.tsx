import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import type { BuildSettings } from "../types";

interface BuildSettingsFieldsProps {
  settings: BuildSettings;
  appFolder: string;
  open: boolean;
  onChange: (patch: Partial<BuildSettings>) => void;
}

export function BuildSettingsFields({
  settings,
  appFolder,
  open,
  onChange,
}: BuildSettingsFieldsProps) {
  return (
    <details open={open}>
      <summary className="cursor-pointer font-semibold">
        Advanced build settings
      </summary>

      <div className="mt-4 space-y-4">
        <p className="text-sm text-muted-foreground [overflow-wrap:anywhere]">
          App folder: {appFolder}
        </p>

        <SelectField
          label="Install command"
          value={settings.installCommand}
          onChange={(event) =>
            onChange({
              installCommand: event.target.value === "npm ci" ? "npm ci" : "",
            })
          }
        >
          <option value="">None — finished static files</option>
          <option value="npm ci">npm ci</option>
        </SelectField>

        <TextField
          label="Build command"
          value={settings.buildCommand}
          maxLength={500}
          onChange={(event) => onChange({ buildCommand: event.target.value })}
        />

        <div>
          <TextField
            label="Output folder"
            value={settings.outputDirectory}
            required
            maxLength={255}
            placeholder="dist or ."
            onChange={(event) =>
              onChange({ outputDirectory: event.target.value })
            }
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Choose the folder containing the finished public website.
          </p>
        </div>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={settings.spaFallback}
            onChange={(event) => onChange({ spaFallback: event.target.checked })}
            className="mt-1 accent-primary"
          />
          Serve index.html for client-side application routes.
        </label>
      </div>
    </details>
  );
}