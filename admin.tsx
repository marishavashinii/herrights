import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Scale, FileText, Landmark, Phone, MessageCircle, BookOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [
    { title: "Admin Dashboard — NyaySakhi" },
    { name: "description", content: "NyaySakhi admin dashboard with statistics and charts." },
  ]}),
  component: Admin,
});

const COLORS = ["#6d28d9", "#a855f7", "#c084fc", "#ec4899", "#f59e0b", "#10b981"];

function Admin() {
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const tables = ["legal_categories","laws","rights","government_schemes","helplines","complaint_templates","faqs"] as const;
      const counts: Record<string, number> = {};
      for (const t of tables) {
        const { count } = await supabase.from(t).select("*", { count: "exact", head: true });
        counts[t] = count ?? 0;
      }
      const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      counts["users"] = userCount ?? 0;
      return counts;
    },
  });

  const catData = useQuery({
    queryKey: ["cat-law-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("laws").select("category_id, legal_categories(name)");
      const map = new Map<string, number>();
      (data ?? []).forEach((r: any) => {
        const name = r.legal_categories?.name ?? "Uncategorised";
        map.set(name, (map.get(name) ?? 0) + 1);
      });
      return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a,b)=>b.count-a.count).slice(0, 10);
    },
  });

  const kpis = [
    { icon: Users, l: "Registered Users", v: stats.data?.users ?? 0 },
    { icon: BookOpen, l: "Categories", v: stats.data?.legal_categories ?? 0 },
    { icon: Scale, l: "Laws", v: stats.data?.laws ?? 0 },
    { icon: FileText, l: "Rights", v: stats.data?.rights ?? 0 },
    { icon: Landmark, l: "Schemes", v: stats.data?.government_schemes ?? 0 },
    { icon: Phone, l: "Helplines", v: stats.data?.helplines ?? 0 },
    { icon: FileText, l: "Templates", v: stats.data?.complaint_templates ?? 0 },
    { icon: MessageCircle, l: "FAQs", v: stats.data?.faqs ?? 0 },
  ];

  const contentBreakdown = [
    { name: "Laws", value: stats.data?.laws ?? 0 },
    { name: "Rights", value: stats.data?.rights ?? 0 },
    { name: "Schemes", value: stats.data?.government_schemes ?? 0 },
    { name: "Helplines", value: stats.data?.helplines ?? 0 },
    { name: "Templates", value: stats.data?.complaint_templates ?? 0 },
    { name: "FAQs", value: stats.data?.faqs ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Admin <span className="gradient-text">Dashboard</span></h1>
      <p className="mt-1 text-muted-foreground">Overview of platform content and usage.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.l} className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{k.l}</div>
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground"><k.icon className="h-4 w-4"/></div>
            </div>
            <div className="mt-3 text-3xl font-bold gradient-text">{k.v}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold">Laws per Category (Top 10)</h2>
          <div className="h-80 mt-4">
            <ResponsiveContainer>
              <BarChart data={catData.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-xs text-muted-foreground grid grid-cols-2 gap-1">
            {(catData.data ?? []).map((d) => <div key={d.name}>• {d.name}</div>)}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold">Content Breakdown</h2>
          <div className="h-80 mt-4">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={contentBreakdown} dataKey="value" nameKey="name" outerRadius={110} label>
                  {contentBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
