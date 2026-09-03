import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Search, Scale, Shield } from "lucide-react";

export const Route = createFileRoute("/rights")({
  head: () => ({ meta: [
    { title: "Rights & Laws — NyaySakhi" },
    { name: "description", content: "Browse Indian laws (IPC, PWDVA, POSH, IT Act) and specific rights available to women." },
    { property: "og:title", content: "Rights & Laws" },
    { property: "og:description", content: "Indian laws and women's rights, explained." },
  ]}),
  component: Page,
});

function Page() {
  const [tab, setTab] = useState<"rights" | "laws">("rights");
  const [q, setQ] = useState("");

  const rights = useQuery({
    queryKey: ["rights"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rights").select("*").order("id");
      if (error) throw error;
      return data;
    },
  });
  const laws = useQuery({
    queryKey: ["laws"],
    queryFn: async () => {
      const { data, error } = await supabase.from("laws").select("*").order("id");
      if (error) throw error;
      return data;
    },
  });

  const list = tab === "rights" ? rights.data ?? [] : laws.data ?? [];
  const filtered = list.filter((x: any) => JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-4xl font-bold">Rights & <span className="gradient-text">Laws</span></h1>
      <p className="mt-2 text-muted-foreground">Explore women's rights and the Indian laws that protect them.</p>

      <div className="mt-6 flex flex-col md:flex-row gap-4">
        <div className="inline-flex rounded-lg border bg-white p-1">
          {(["rights","laws"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${tab===t?"bg-gradient-primary text-primary-foreground shadow-soft":"text-muted-foreground"}`}>
              {t==="rights"? <Shield className="h-4 w-4"/> : <Scale className="h-4 w-4"/>}
              {t==="rights"?"Rights":"Laws"}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder={`Search ${tab}...`} className="w-full rounded-lg border bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary" />
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {filtered.map((item: any) => (
          <div key={item.id} className="card-hover rounded-2xl border bg-card p-6">
            {tab === "rights" ? (
              <>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                {item.how_to_exercise && (
                  <div className="mt-3 rounded-lg bg-secondary p-3 text-sm">
                    <b className="text-primary">How to exercise: </b>{item.how_to_exercise}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  {item.year && <span className="text-xs rounded-full bg-secondary px-2 py-0.5 text-primary shrink-0">{item.year}</span>}
                </div>
                {item.section && <div className="mt-1 text-xs text-primary font-medium">{item.section}</div>}
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                {item.punishment && (
                  <div className="mt-3 rounded-lg bg-destructive/5 border border-destructive/20 p-3 text-sm">
                    <b className="text-destructive">Punishment: </b>{item.punishment}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
