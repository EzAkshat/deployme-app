"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { TextField } from "@/components/ui/text-field";
import type { BuildSettingsValues, SettingsState } from "../types";
import { PublicBuildVariablesEditor } from "@/features/build-variables/components/public-build-variables-editor";

const FIELDS = [
    {
        name: "rootDirectory",
        label: "Root directory",
        help: 'Use "." for the repository root, or a folder such as "apps/web".',
        required: true,
        maxLength: 255,
    },
    {
        name: "installCommand",
        label: "Install command",
        help: "Leave blank when dependency installation is not needed.",
        required: false,
        maxLength: 500,
    },
    {
        name: "buildCommand",
        label: "Build command",
        help: "Leave blank for a static site that does not need a build.",
        required: false,
        maxLength: 500,
    },
    {
        name: "outputDirectory",
        label: "Output directory",
        help: 'The folder containing the finished website, such as "dist" or ".".',
        required: true,
        maxLength: 255,
    },
] as const;

interface BuildSettingsFormProps {
    initial: BuildSettingsValues;
    action: (payload: FormData) => void;
    state: SettingsState;
    saving: boolean;
    disabled: boolean;
}

export function BuildSettingsForm({
    initial,
    action,
    state,
    saving,
    disabled,
}: BuildSettingsFormProps) {
    const [values, setValues] = useState(initial);

    return (
        <form action={action} className="space-y-5">
            <div>
                <h2 className="text-xl font-semibold">Build settings</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Directory, command and public-variable changes apply to future
                    deployments. Saving does not start a deployment.
                </p>
            </div>

            <fieldset disabled={disabled} className="space-y-5">
                {FIELDS.map((field) => (
                    <div key={field.name}>
                        <TextField
                            label={field.label}
                            id={field.name}
                            name={field.name}
                            value={values[field.name]}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    [field.name]: event.target.value,
                                }))
                            }
                            required={field.required}
                            maxLength={field.maxLength}
                            spellCheck={false}
                            autoComplete="off"
                            aria-describedby={`${field.name}-help`}
                            className="font-mono"
                        />
                        <p
                            id={`${field.name}-help`}
                            className="mt-2 text-sm text-muted-foreground"
                        >
                            {field.help}
                        </p>
                    </div>
                ))}

                <div className="space-y-2">
                    <CheckboxField
                        name="spaFallback"
                        label={<span className="font-medium">Enable SPA fallback</span>}
                        checked={values.spaFallback}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                spaFallback: event.target.checked,
                            }))
                        }
                    />
                    <p className="text-sm text-muted-foreground">
                        Serve the app entry page for client-side routes. Changing this
                        setting can update the published website’s routing without
                        rebuilding it.
                    </p>
                </div>
                {initial.publicBuildVariables !== undefined ? (
                    <PublicBuildVariablesEditor initial={initial.publicBuildVariables} />
                ) : (
                    <Alert tone="warning">
                        Public build variables were not returned by the backend. Reload
                        after updating the backend. Existing variables will be preserved
                        when saving other settings.
                    </Alert>
                )}
                <Button type="submit">{saving ? "Saving…" : "Save settings"}</Button>
            </fieldset>

            {state.message ? (
                <Alert tone={state.ok ? "success" : "error"}>{state.message}</Alert>
            ) : null}
        </form>
    );
}