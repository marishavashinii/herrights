import { createFileRoute, Link } from "@tanstack/react-router";
import { Scale, Shield, Sparkles, FileText, Phone, GraduationCap, Landmark, MessageCircle, Users, ArrowRight, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NyaySakhi — AI Legal Rights Awareness for Women in India" },
      { name: "description", content: "Understand your rights, generate legal complaints with AI, discover government schemes and reach emergency helplines — all in one place." },
      { property: "og:title", content: "NyaySakhi — Legal Awareness AI" },
      { property: "og:description", content: "AI-powered legal awareness for women in India." },
    ],
  }),
  component: Home,
});

const FEATURES = [
  { icon: Sparkles, title: "AI Legal Assistant", desc: "Ask any question in plain language and get a clear, empathetic answer citing relevant Indian laws.", to: "/assistant" },
  { icon: FileText, title: "Complaint Generator", desc: "Describe your situation. Get a ready-to-file complaint letter, applicable laws, required evidence and next steps.", to: "/complaint-generator" },
  { icon: Scale, title: "Rights & Laws Library", desc: "33+ Indian laws and 33+ specific rights explained in simple language.", to: "/rights" },
  { icon: Landmark, title: "Government Schemes", desc: "Discover 29+ schemes with eligibility, benefits and how-to-apply guidance.", to: "/schemes" },
  { icon: Phone, title: "Emergency Helplines", desc: "One-tap access to 30+ verified helplines: police, DV, cyber, health, legal aid.", to: "/helplines" },
  { icon: MessageCircle, title: "50+ FAQs", desc: "Quick answers to the most common legal questions.", to: "/faq" },
];

const TOPICS = [
  "Domestic Violence","Sexual Harassment","POSH at Workplace","Cyber Crime","Online Blackmail",
  "Stalking","Acid Attack","Child Marriage","Dowry","Property Rights","Divorce","Maintenance",
  "Child Custody","Rape Awareness","Human Trafficking","Eve Teasing","Identity Theft","Fake Accounts",
  "Online Fraud","Employment Rights","Maternity Benefits","Equal Pay","Inheritance","Police Complaint",
];

function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-20 md:pt-24 md:pb-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/60 px-4 py-1.5 text-xs font-medium text-primary shadow-soft">
              <Shield className="h-3.5 w-3.5" /> AI-Based Legal Awareness Platform
            </div>
            <h1 className="mt-5 text-4xl md:text-6xl font-bold leading-tight">
              Know your <span className="gradient-text">rights.</span><br />
              Reclaim your <span className="gradient-text">voice.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              NyaySakhi is an AI-powered legal awareness companion for women in India — explaining laws in simple language, drafting complaints, and pointing you to the right help.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/assistant" className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-6 py-3 font-medium text-primary-foreground shadow-elegant transition hover:opacity-95">
                Ask the AI Assistant <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/complaint-generator" className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-white px-6 py-3 font-medium text-primary hover:bg-secondary">
                Generate a Complaint
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-6 max-w-md">
              {[
                { n: "33+", l: "Laws indexed" },
                { n: "50+", l: "Categories" },
                { n: "30+", l: "Helplines" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl md:text-3xl font-bold gradient-text">{s.n}</div>
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-up">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-primary opacity-25 blur-3xl" />
            <div className="relative rounded-3xl border bg-card shadow-elegant p-6 md:p-8">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-primary-foreground">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">AI Assistant</div>
                  <div className="text-xs text-muted-foreground">Trained on Indian legal awareness</div>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl rounded-tl-sm bg-secondary p-3 text-sm">
                  My employer keeps making inappropriate comments. What can I do?
                </div>
                <div className="rounded-2xl rounded-tr-sm bg-gradient-primary p-4 text-sm text-primary-foreground">
                  Under the <b>POSH Act 2013</b>, workplace sexual harassment is a punishable offence. You can file a written complaint with your Internal Committee within 3 months. If your organisation has fewer than 10 employees, approach the Local Committee. Emergency: call <b>181</b>.
                </div>
                <Link to="/assistant" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                  Try it now <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">What you can do</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold">A complete legal awareness toolkit</h2>
          <p className="mt-3 text-muted-foreground">Six focused tools, always available, in plain language.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Link
              key={f.title}
              to={f.to}
              className="group card-hover rounded-2xl border bg-card p-6"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Explore <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TOPICS */}
      <section className="bg-secondary/40 border-y">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Topics we cover</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold">From dowry to cybercrime</h2>
            </div>
            <Link to="/categories" className="text-sm font-medium text-primary inline-flex items-center gap-1">
              View all categories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <span key={t} className="rounded-full border border-primary/20 bg-white px-4 py-2 text-sm text-foreground shadow-soft hover:border-primary/60 transition">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* EMERGENCY BAR */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="rounded-3xl bg-gradient-primary p-8 md:p-12 text-primary-foreground shadow-elegant">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                <Phone className="h-3.5 w-3.5" /> If you are in danger, call now
              </div>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold">Emergency Helplines</h2>
              <p className="mt-3 text-white/85 max-w-md">
                Verified 24×7 helplines for women in distress across India.
              </p>
              <Link to="/helplines" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-primary">
                View all helplines <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { n: "1091", l: "Women Helpline" },
                { n: "181", l: "Sakhi DV" },
                { n: "112", l: "Police" },
                { n: "1930", l: "Cyber Crime" },
              ].map((h) => (
                <a key={h.n} href={`tel:${h.n}`} className="rounded-2xl bg-white/12 p-5 backdrop-blur transition hover:bg-white/20">
                  <div className="text-3xl font-bold">{h.n}</div>
                  <div className="text-xs uppercase tracking-wider text-white/85 mt-1">{h.l}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: GraduationCap, t: "Educate", d: "Simple explanations of complex Indian laws so every woman can understand her rights." },
            { icon: Users, t: "Empower", d: "Practical tools like AI complaint drafting and next-step guidance." },
            { icon: Shield, t: "Protect", d: "Quick access to emergency numbers and legal aid channels." },
          ].map((m) => (
            <div key={m.t} className="rounded-2xl border p-6 bg-card">
              <m.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 text-lg font-semibold">{m.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{m.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
