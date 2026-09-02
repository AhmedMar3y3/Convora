import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { LinkButton } from "@/components/button";

type Tool = { name: string; shortName: string; description: string; route: string; icon: LucideIcon };

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;

  return (
    <article className="group rounded-[18px] p-5 glass liquid-glass-interactive">
      <div className="mb-8 flex items-center justify-between">
        <span className="grid size-12 place-items-center rounded-[8px] bg-[var(--accent-soft)] text-[var(--accent-strong)]">
          <Icon size={23} aria-hidden />
        </span>
        <ArrowUpRight className="text-muted transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={20} aria-hidden />
      </div>
      <h3 className="text-xl font-semibold">{tool.name}</h3>
      <p className="mt-3 min-h-12 text-sm leading-6 text-muted">{tool.description}</p>
      <LinkButton href={tool.route} variant="secondary" className="mt-6 w-full">
        Open {tool.shortName}
      </LinkButton>
    </article>
  );
}
