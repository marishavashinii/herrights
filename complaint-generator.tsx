import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateComplaint } from "@/lib/ai.functions";
import { FileText, Sparkles, AlertTriangle, Shield, Phone, ClipboardCheck, ListChecks, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/complaint-generator")({
  head: () => ({ meta: [
    { title: "AI Complaint Generator — NyaySakhi" },
    { name: "description", content: "Describe your situation. Get a ready-to-file complaint letter, applicable Indian laws, required evidence and next steps." },
    { property: "og:title", content: "AI Complaint Generator" },
    { property: "og:description", content: "Instant, structured legal complaint drafts." },
  ]}),
  component: Page,
});

type Result = {
  category: string; risk_level: "Low"|"Medium"|"High";
  complaint_title: string; applicable_laws: string[]; rights: string[];
  complaint_letter: string; required_evidence: string[]; next_steps: string[];
  emergency_contact: string; scheme_recommendations: string[];
};

function Page() {
  const gen = useServerFn(generateComplaint);
  const [situation, setSituation] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const submit = async () => {
    if (situation.trim().length < 20) return toast.error("Please describe the situation in more detail (min 20 chars).");
    setBusy(true);
    try {
      const data = await gen({ data: { situation } });
      setResult(data as Result);
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally { setBusy(false); }
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.complaint_letter);
    toast.success("Complaint copied");
  };

  const riskColor = result?.risk_level === "High" ? "bg-destructive text-destructive-foreground"
    : result?.risk_level === "Medium" ? "bg-warning text-black" : "bg-success text-white";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5"/> AI Complaint Generator
        </div>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold">Turn your story into a <span className="gradient-text">legal complaint</span></h1>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">Describe what happened in your own words. We'll suggest the right sections, draft the letter and list the evidence you'll need.</p>
      </div>

      <div className="mt-8 rounded-2xl border bg-card p-6 shadow-soft">
        <label className="text-sm font-medium">Describe your situation</label>
        <textarea value={situation} onChange={(e)=>setSituation(e.target.value)} rows={7} placeholder="Example: My husband has been abusing me physically and mentally for 2 years. Yesterday he hit me and threw me out. I am currently at my parents' home." className="mt-2 w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-primary" />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Do not include personal identifiers you're not comfortable sharing. This session is not stored.</p>
          <button onClick={submit} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft disabled:opacity-60">
            <Sparkles className="h-4 w-4"/> {busy?"Generating…":"Generate complaint"}
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-8 space-y-6 animate-fade-up">
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${riskColor}`}>
                <AlertTriangle className="h-3.5 w-3.5"/> {result.risk_level} risk
              </span>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">{result.category}</span>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive px-3 py-1 text-xs font-medium">
                <Phone className="h-3.5 w-3.5"/> {result.emergency_contact}
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-bold">{result.complaint_title}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card icon={Shield} title="Applicable Laws" items={result.applicable_laws} />
            <Card icon={ClipboardCheck} title="Your Rights" items={result.rights} />
            <Card icon={FileText} title="Required Evidence" items={result.required_evidence} />
            <Card icon={ListChecks} title="Next Steps" items={result.next_steps} />
          </div>

          {result.scheme_recommendations?.length > 0 && (
            <Card icon={Sparkles} title="Recommended Schemes" items={result.scheme_recommendations} />
          )}

          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/> Draft Complaint Letter</h3>
              <button onClick={copy} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium hover:border-primary"><Copy className="h-3.5 w-3.5"/> Copy</button>
            </div>
            <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-secondary p-5 text-sm font-sans leading-relaxed">{result.complaint_letter}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ icon: Icon, title, items }: { icon: any; title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h3 className="font-semibold flex items-center gap-2"><Icon className="h-5 w-5 text-primary"/> {title}</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2"><span className="text-primary">•</span><span>{it}</span></li>
        ))}
      </ul>
    </div>
  );
}
