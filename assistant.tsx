import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askAssistant } from "@/lib/ai.functions";
import { Send, Sparkles, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/assistant")({
  head: () => ({ meta: [
    { title: "AI Legal Assistant — NyaySakhi" },
    { name: "description", content: "Ask any legal question in simple language and get AI-powered guidance grounded in Indian law." },
    { property: "og:title", content: "AI Legal Assistant" },
    { property: "og:description", content: "AI assistant for women's legal awareness in India." },
  ]}),
  component: Page,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "My husband beats me. What are my options?",
  "How do I file a POSH complaint at my workplace?",
  "Someone is creating fake profiles of me on Instagram.",
  "Am I entitled to my father's ancestral property?",
];

function Page() {
  const ask = useServerFn(askAssistant);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text.trim() }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const { reply } = await ask({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5"/> AI Legal Assistant
        </div>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold">Ask anything about your <span className="gradient-text">legal rights</span></h1>
      </div>

      <div className="mt-6 rounded-2xl border bg-card shadow-soft flex flex-col h-[65vh]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full grid place-items-center text-center">
              <div>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant">
                  <Sparkles className="h-7 w-7"/>
                </div>
                <p className="mt-4 text-muted-foreground">How can I help you today?</p>
                <div className="mt-5 grid gap-2 max-w-lg mx-auto">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-xl border px-4 py-3 text-left text-sm hover:border-primary hover:bg-secondary transition">{s}</button>
                  ))}
                </div>
              </div>
            </div>
          ) : messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role==="user"?"flex-row-reverse":""}`}>
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${m.role==="user"?"bg-secondary":"bg-gradient-primary text-primary-foreground"}`}>
                {m.role==="user"?<User className="h-4 w-4"/>:<Sparkles className="h-4 w-4"/>}
              </div>
              <div className={`max-w-[75%] rounded-2xl p-3.5 text-sm whitespace-pre-wrap ${m.role==="user"?"bg-secondary rounded-tr-sm":"bg-gradient-primary text-primary-foreground rounded-tl-sm"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {busy && <div className="text-sm text-muted-foreground animate-pulse">Thinking…</div>}
        </div>
        <form onSubmit={(e)=>{e.preventDefault();send(input);}} className="border-t p-3 flex gap-2">
          <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Ask a legal question..." className="flex-1 rounded-lg border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <button disabled={busy || !input.trim()} className="inline-flex items-center gap-1 rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft disabled:opacity-60">
            <Send className="h-4 w-4"/> Send
          </button>
        </form>
      </div>
      <p className="mt-3 text-xs text-center text-muted-foreground">General legal awareness only — not a substitute for professional advice.</p>
    </div>
  );
}
