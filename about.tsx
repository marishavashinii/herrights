import { createFileRoute } from "@tanstack/react-router";
import { Shield, Sparkles, Users, GraduationCap, Scale, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About NyaySakhi — AI Legal Awareness for Women" },
      { name: "description", content: "Learn about NyaySakhi, an AI-based platform making Indian women's legal rights accessible, understandable and actionable." },
      { property: "og:title", content: "About NyaySakhi" },
      { property: "og:description", content: "AI legal awareness platform for women in India." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" /> About Us
        </div>
        <h1 className="mt-4 text-4xl md:text-5xl font-bold">
          Legal awareness, <span className="gradient-text">reimagined with AI</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          NyaySakhi is a final-year academic project that combines Indian legal knowledge, NLP-based classification and empathetic UX to help women navigate their legal rights.
        </p>
      </div>

      <div className="mt-16 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border p-8 bg-card">
          <Scale className="h-6 w-6 text-primary" />
          <h2 className="mt-3 text-2xl font-semibold">Our Mission</h2>
          <p className="mt-3 text-muted-foreground">
            To bridge the gap between complex legal information and everyday women in India. Laws exist to protect — but only when people know they exist and how to use them.
          </p>
        </div>
        <div className="rounded-2xl border p-8 bg-card">
          <Heart className="h-6 w-6 text-primary" />
          <h2 className="mt-3 text-2xl font-semibold">Our Approach</h2>
          <p className="mt-3 text-muted-foreground">
            We use AI language models to answer questions, classify issues, assess risk level (Low / Medium / High) and generate ready-to-file complaints — all in simple language.
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-3xl bg-gradient-primary p-8 md:p-12 text-primary-foreground shadow-elegant">
        <h2 className="text-2xl md:text-3xl font-bold">How NyaySakhi helps</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {[
            { icon: GraduationCap, t: "Educate", d: "Explains Indian laws — IPC, PWDVA, POSH, IT Act, Dowry Prohibition, Maternity Benefit — in plain English." },
            { icon: Sparkles, t: "Assist", d: "AI legal assistant answers questions, classifies your issue and suggests the right sections to invoke." },
            { icon: Shield, t: "Act", d: "One-tap generation of complaint letters, evidence checklists and next steps." },
          ].map((m) => (
            <div key={m.t}>
              <m.icon className="h-6 w-6" />
              <h3 className="mt-3 text-lg font-semibold">{m.t}</h3>
              <p className="mt-1 text-white/85 text-sm">{m.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-2xl border-2 border-dashed border-primary/30 bg-secondary/40 p-6">
        <h3 className="font-semibold text-primary flex items-center gap-2">
          <Users className="h-5 w-5" /> Important Disclaimer
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          NyaySakhi provides <b>general legal awareness for educational purposes only</b>. It is not a substitute for professional legal advice. Please consult a qualified lawyer or approach your District Legal Services Authority (DLSA) for legal representation.
        </p>
      </div>

      <div className="mt-12 grid md:grid-cols-4 gap-4">
        {[
          { l: "Frontend", v: "React 19 + TanStack Start" },
          { l: "Backend", v: "Lovable Cloud (Postgres)" },
          { l: "AI", v: "Lovable AI (Gemini / GPT)" },
          { l: "Charts", v: "Recharts" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border p-4 text-center">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.l}</div>
            <div className="mt-1 font-semibold text-primary">{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
