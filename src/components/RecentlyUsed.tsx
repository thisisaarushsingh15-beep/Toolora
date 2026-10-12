import { Link } from "@tanstack/react-router";
import { IconTrash } from "~/components/icons";
import { Section, SectionHeading } from "~/components/ui";
import { useRecentTools } from "~/lib/recent";

/**
 * Recently used tools — the only thing kept between visits, and the only thing
 * stored is which tool pages were opened. Never any value typed into a tool.
 */
export function RecentlyUsed() {
  const { tools, ready, clear } = useRecentTools();

  return (
    <Section labelledBy="recently-used-heading">
      <SectionHeading
        id="recently-used-heading"
        eyebrow="On this device"
        title="Recently used tools"
        description="Stored in this browser only — just the tools you opened, never anything you typed into them."
        action={
          ready && tools.length > 0 ? (
            <button type="button" onClick={clear} className="btn btn-secondary gap-2">
              <IconTrash className="h-4 w-4" />
              Clear history
            </button>
          ) : null
        }
      />

      <div className="mt-6">
        {!ready ? (
          <p className="text-sm text-muted">Checking this browser…</p>
        ) : tools.length === 0 ? (
          <p className="card p-5 text-sm leading-relaxed text-muted">
            No tools opened here yet. Open any tool and it will be listed in this section next time
            you are on the homepage.
          </p>
        ) : (
          <ul aria-label="Recently used tools" className="flex flex-wrap gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <li key={tool.slug}>
                  <Link to="/tools/$slug" params={{ slug: tool.slug }} className="chip">
                    <Icon className="h-4 w-4 text-accent" />
                    {tool.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Section>
  );
}
