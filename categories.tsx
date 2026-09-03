import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [
    { title: "Legal Categories — NyaySakhi" },
    { name: "description", content: "Explore 50+ women's legal categories including Domestic Violence, POSH, Cyber Crime, Dowry, Property Rights and more." },
    { property: "og:title", content: "Legal Categories" },
    { property: "og:description", content: "50+ women's legal topics explained." },
  ]}),
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("legal_categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
  const filtered = data.filter((c) => (c.name + " " + (c.description ?? "")).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-4xl font-bold">Legal <span className="gradient-text">Categories</span></h1>
      <p className="mt-2 text-muted-foreground">50+ areas of women's law in India — pick a topic to learn more.</p>
      <div className="mt-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search categories..." className="w-full rounded-lg border bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary" />
      </div>
      {isLoading ? <p className="mt-8 text-muted-foreground">Loading…</p> : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id} className="card-hover rounded-2xl border bg-card p-5">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold">Category</div>
              <h3 className="mt-2 font-semibold">{c.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
