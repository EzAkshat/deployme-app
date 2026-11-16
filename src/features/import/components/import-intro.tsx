import Link from "next/link";

const STEPS = [
  { title: "Choose your source", description: "Find a repository from GitHub." },
  {
    title: "Make it yours",
    description: "Name your project and review its settings.",
  },
  {
    title: "Ship your website",
    description: "Deploy and follow the build in real time.",
  },
] as const;

export function ImportIntro() {
  return (
    <aside>
      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Dashboard
      </Link>

      <p className="mt-6 font-mono text-xs tracking-widest text-primary uppercase">
        New project
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        Your next launch
        <br />
        starts here.
      </h1>
      <p className="mt-4 text-muted-foreground">
        Choose a repository. We’ll detect its settings and help you get it
        online.
      </p>

      <ol className="mt-10 hidden gap-7 lg:grid">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex items-start gap-4">
            <span className="font-mono text-xs/6 text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <strong className="text-sm font-medium">{step.title}</strong>
              <p className="mt-1 text-xs text-muted-foreground">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-6 border-t border-border pt-5 text-xs text-muted-foreground lg:mt-10">
        Automatic presets for static HTML and supported npm + Vite projects.
      </p>
    </aside>
  );
}