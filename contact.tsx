import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, MapPin, Phone, Send } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact — NyaySakhi" },
    { name: "description", content: "Send us feedback or questions about NyaySakhi." },
    { property: "og:title", content: "Contact NyaySakhi" },
    { property: "og:description", content: "Get in touch with the team." },
  ]}),
  component: Page,
});

function Page() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("feedback").insert(form);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Thanks — we received your message.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 grid lg:grid-cols-2 gap-10">
      <div>
        <h1 className="text-4xl font-bold">Get in <span className="gradient-text">touch</span></h1>
        <p className="mt-3 text-muted-foreground">Feedback, corrections or partnership ideas — we'd love to hear from you.</p>
        <div className="mt-8 space-y-4">
          {[
            { icon: Mail, l: "Email", v: "hello@nyaysakhi.example" },
            { icon: Phone, l: "Emergency", v: "1091 / 181 / 112" },
            { icon: MapPin, l: "Based in", v: "India" },
          ].map((c) => (
            <div key={c.l} className="flex items-center gap-4 rounded-xl border p-4 bg-card">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-primary text-primary-foreground"><c.icon className="h-5 w-5"/></div>
              <div><div className="text-xs text-muted-foreground">{c.l}</div><div className="font-medium">{c.v}</div></div>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={submit} className="rounded-2xl border bg-card p-6 shadow-soft space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <input required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Your name" className="rounded-lg border px-3 py-2.5 text-sm bg-white" />
          <input required type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} placeholder="Email" className="rounded-lg border px-3 py-2.5 text-sm bg-white" />
        </div>
        <input value={form.subject} onChange={(e)=>setForm({...form,subject:e.target.value})} placeholder="Subject" className="w-full rounded-lg border px-3 py-2.5 text-sm bg-white" />
        <textarea required value={form.message} onChange={(e)=>setForm({...form,message:e.target.value})} placeholder="Your message..." rows={6} className="w-full rounded-lg border px-3 py-2.5 text-sm bg-white" />
        <button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft disabled:opacity-60">
          <Send className="h-4 w-4"/> {busy?"Sending…":"Send message"}
        </button>
      </form>
    </div>
  );
}
