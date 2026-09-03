import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Search, ExternalLink, Landmark } from "lucide-react";

export const Route = createFileRoute("/schemes")({
  head: () => ({ meta: [
    { title: "Government Schemes for Women — NyaySakhi" },
    { name: "description", content: "29+ Indian government schemes for women — eligibility, benefits and how to apply." },
    { property: "og:title", content: "Government Schemes for Women" },
    { property: "og:description", content: "Explore central schemes with eligibility and application details." },
  ]}),
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");
  const { data = [] } = useQuery({
    queryKey: ["schemes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("government_schemes").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
  const filtered = data.filter((s: any) => JSON.stringify(s).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-4xl font-bold">Government <span className="gradient-text">Schemes</span></h1>
      <p className="mt-2 text-muted-foreground">Central government schemes empowering women across India.</p>
      <div className="mt-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search schemes..." className="w-full rounded-lg border bg-white pl-10 pr-4 py-2.5 text-sm" />
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {filtered.map((s: any) => (
          <div key={s.id} className="card-hover rounded-2xl border bg-card p-6">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
                <Landmark className="h-5 w-5"/>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{s.name}</h3>
                {s.ministry && <div className="text-xs text-primary mt-0.5">{s.ministry}</div>}
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{s.description}</p>
            <div className="mt-3 grid gap-2 text-sm">
              {s.eligibility && <div><b className="text-primary">Eligibility:</b> <span className="text-muted-foreground">{s.eligibility}</span></div>}
              {s.benefits && <div><b className="text-primary">Benefits:</b> <span className="text-muted-foreground">{s.benefits}</span></div>}
              {s.how_to_apply && <div><b className="text-primary">Apply:</b> <span className="text-muted-foreground">{s.how_to_apply}</span></div>}
            </div>
            {s.website && (
              <a href={s.website} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Visit official site <ExternalLink className="h-3.5 w-3.5"/>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
