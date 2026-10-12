import { TitleBand } from "@/components/ledger/title-band";
import { RuledFigure } from "@/components/ledger/ruled-figure";
import { SectionHead } from "@/components/ledger/section-head";
import { SystemRow, systemCells, systemColumns } from "@/components/integrations/system-card";
import { integrations } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function IntegrationsPage() {
  const samples = integrations.filter((i) => i.source.kind === "Sample export").length;

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <TitleBand
        title="Integrations"
        description="Your existing tools stay in place — this platform reads from them and joins the data. Nothing is migrated, nothing is replaced."
      />

      <div className="divide-y divide-border border border-border bg-card">
        {/* Said plainly first: this demo is connected to nothing. */}
        <section
          aria-label="Connection summary"
          className="grid sm:grid-cols-3 [&>*]:border-border max-sm:[&>*+*]:border-t sm:[&>*+*]:border-l"
        >
          <RuledFigure label="Live connections" value="0" note="This demo reads sample data only" />
          <RuledFigure
            label="Sample exports"
            value={String(samples + 1)}
            source={["CostX", "Xero"]}
            note="Budget, transactions and the cost-code mapping that joins them"
          />
          <RuledFigure label="Systems read" value={String(integrations.length)} note="All read-only — nothing is written back" />
        </section>

        <section aria-labelledby="systems-title">
          <SectionHead
            id="systems-title"
            title="What each system feeds"
            description="What the finished product reads from each tool, what this demo uses in its place, and what would let us check it against your real data."
          />
          <div
            aria-hidden="true"
            className={cn(systemColumns, "hidden border-b border-border py-2 text-[11.5px] font-medium text-muted-foreground lg:grid")}
          >
            <span className={systemCells.system}>System</span>
            <span className={systemCells.reads}>Reads</span>
            <span className={systemCells.demo}>In this demo</span>
            <span className={systemCells.needed}>Needed from you</span>
          </div>
          <ul className="divide-y divide-border">
            {integrations.map((i) => (
              <SystemRow
                key={i.system}
                system={i.system}
                note={i.note}
                reads={i.reads}
                source={i.source}
                needed={i.needed}
              />
            ))}
            {/* The key between the two exports: the join itself, not a system. */}
            <SystemRow
              label="Cost-code mapping"
              note="Joins CostX and Xero"
              reads="Which Xero account or tracking category each CostX cost code lands in"
              source={{ kind: "Sample export", file: "cost-code-mapping.csv" }}
              needed="Where this mapping lives today and who maintains it — often a spreadsheet, sometimes nowhere"
            />
          </ul>
        </section>

        <p className="px-4 py-3 text-[11.5px] text-muted-foreground md:px-5">
          The sample exports are our guess at your files, built to match Riverside Office Fitout&rsquo;s figures.
          Send a real export in its place and the same import check reruns the join against it.
        </p>
      </div>
    </div>
  );
}
