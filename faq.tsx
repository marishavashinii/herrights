import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [
    { title: "FAQ — NyaySakhi" },
    { name: "description", content: "50+ frequently asked questions about women's legal rights in India, answered simply." },
    { property: "og:title", content: "Frequently Asked Questions" },
    { property: "og:description", content: "Common women's legal questions in India, answered." },
  ]}),
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const { data = [] } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faqs").select("*").order("id");
      if (error) throw error;
      return data;
    },
  });
  const filtered = data.filter((f: any) => (f.question + " " + f.answer).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-bold">Frequently Asked <span className="gradient-text">Questions</span></h1>
      <p className="mt-2 text-muted-foreground">Quick answers to the most common questions.</p>
      <div className="mt-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search FAQs..." className="w-full rounded-lg border bg-white pl-10 pr-4 py-2.5 text-sm" />
      </div>
      <div className="mt-8 space-y-3">
        {filtered.map((f: any) => (
          <div key={f.id} className="rounded-2xl border bg-card overflow-hidden">
            <button onClick={() => setOpen(open === f.id ? null : f.id)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
              <span className="font-medium">{f.question}</span>
              <ChevronDown className={`h-5 w-5 text-primary transition ${open===f.id?"rotate-180":""}`} />
            </button>
            {open === f.id && (
              <div className="px-5 pb-5 text-sm text-muted-foreground border-t pt-4">{f.answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
