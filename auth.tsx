import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Scale, Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Sign in — NyaySakhi" },
    { name: "description", content: "Sign in or create an account to access your NyaySakhi dashboard." },
    { property: "og:title", content: "Sign in to NyaySakhi" },
    { property: "og:description", content: "Access your account." },
  ]}),
  component: Auth,
});

function Auth() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: form.full_name },
          },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
      nav({ to: "/admin" });
    } catch (e: any) {
      toast.error(e.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-[80vh] grid place-items-center bg-hero px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
            <Scale className="h-6 w-6"/>
          </div>
          <h1 className="mt-4 text-3xl font-bold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Access the AI assistant, complaint generator & dashboard.</p>
        </div>
        <form onSubmit={submit} className="rounded-2xl border bg-card p-6 shadow-elegant space-y-4">
          {mode === "signup" && (
            <input required value={form.full_name} onChange={(e)=>setForm({...form,full_name:e.target.value})} placeholder="Full name" className="w-full rounded-lg border px-3 py-2.5 text-sm bg-white" />
          )}
          <input required type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} placeholder="Email" className="w-full rounded-lg border px-3 py-2.5 text-sm bg-white" />
          <input required type="password" minLength={6} value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} placeholder="Password (min 6 chars)" className="w-full rounded-lg border px-3 py-2.5 text-sm bg-white" />
          <button disabled={busy} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft disabled:opacity-60">
            <Sparkles className="h-4 w-4"/>
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            {mode === "login" ? "New here?" : "Already registered?"}{" "}
            <button type="button" onClick={()=>setMode(mode==="login"?"signup":"login")} className="font-semibold text-primary">
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
