import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Clock } from "lucide-react";

export const Route = createFileRoute("/helplines")({
  head: () => ({ meta: [
    { title: "Emergency Helplines for Women in India — NyaySakhi" },
    { name: "description", content: "30+ verified 24×7 helplines: police, domestic violence, cyber crime, health, legal aid and more." },
    { property: "og:title", content: "Women's Emergency Helplines" },
    { property: "og:description", content: "Verified all-India helpline directory." },
  ]}),
  component: Page,
});

function Page() {
  const { data = [] } = useQuery({
    queryKey: ["helplines"],
    queryFn: async () => {
      const { data, error } = await supabase.from("helplines").select("*").order("id");
      if (error) throw error;
      return data;
    },
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="rounded-3xl bg-gradient-primary p-8 md:p-12 text-primary-foreground shadow-elegant">
        <h1 className="text-4xl md:text-5xl font-bold">Emergency <span className="text-white/85">Helplines</span></h1>
        <p className="mt-3 text-white/90 max-w-xl">If you are in danger, dial now. All numbers below are verified national or state-level helplines.</p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((h: any) => (
          <a key={h.id} href={`tel:${h.number}`} className="card-hover rounded-2xl border bg-card p-5 block">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-primary">{h.category}</div>
                <h3 className="mt-1 font-semibold">{h.name}</h3>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-primary-foreground shrink-0">
                <Phone className="h-5 w-5"/>
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold gradient-text">{h.number}</div>
            {h.description && <p className="mt-2 text-sm text-muted-foreground">{h.description}</p>}
            {h.available && (
              <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3"/> {h.available}
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
