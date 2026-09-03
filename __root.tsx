import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { Menu, X, Scale, Phone } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-95"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NyaySakhi — AI Legal Awareness for Women in India" },
      { name: "description", content: "AI-based platform helping Indian women understand their legal rights, generate complaints, discover government schemes, and reach emergency helplines." },
      { property: "og:title", content: "NyaySakhi — AI Legal Awareness for Women" },
      { property: "og:description", content: "Understand your rights, draft complaints and access emergency support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/categories", label: "Categories" },
  { to: "/rights", label: "Rights & Laws" },
  { to: "/schemes", label: "Schemes" },
  { to: "/helplines", label: "Helplines" },
  { to: "/assistant", label: "AI Assistant" },
  { to: "/complaint-generator", label: "Complaint" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-soft">
            <Scale className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold gradient-text">NyaySakhi</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Legal Aid AI</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-muted-foreground transition hover:bg-secondary hover:text-primary"
              activeProps={{ className: "text-primary bg-secondary font-semibold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <a
            href="tel:1091"
            className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive"
          >
            <Phone className="h-3.5 w-3.5" /> 1091
          </a>
          {user ? (
            <>
              <Link to="/admin" className="rounded-md px-3 py-2 text-sm text-primary">Dashboard</Link>
              <button
                onClick={() => supabase.auth.signOut()}
                className="rounded-md bg-secondary px-3 py-2 text-sm"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/auth" className="rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft">
              Sign in
            </Link>
          )}
        </div>

        <button className="lg:hidden rounded-md p-2 hover:bg-secondary" onClick={() => setOpen(!open)} aria-label="menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t bg-background">
          <nav className="mx-auto max-w-7xl px-4 py-3 grid gap-1">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-secondary">
                {n.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/admin" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm text-primary">Dashboard</Link>
                <button onClick={() => supabase.auth.signOut()} className="rounded-md px-3 py-2 text-sm text-left hover:bg-secondary">Sign out</button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="rounded-md bg-gradient-primary px-3 py-2 text-sm text-primary-foreground">Sign in</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
              <Scale className="h-4 w-4" />
            </div>
            <span className="font-bold gradient-text text-lg">NyaySakhi</span>
          </div>
          <p className="mt-3 text-muted-foreground">
            AI-based legal awareness &amp; guidance for women in India. Educational — not a substitute for professional legal advice.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Learn</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/rights">Rights &amp; Laws</Link></li>
            <li><Link to="/categories">Legal Categories</Link></li>
            <li><Link to="/schemes">Government Schemes</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Act</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/assistant">AI Legal Assistant</Link></li>
            <li><Link to="/complaint-generator">Complaint Generator</Link></li>
            <li><Link to="/helplines">Emergency Helplines</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Emergency</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>Women Helpline: <a href="tel:1091" className="text-primary font-semibold">1091</a></li>
            <li>Sakhi (DV): <a href="tel:181" className="text-primary font-semibold">181</a></li>
            <li>Police: <a href="tel:112" className="text-primary font-semibold">112</a></li>
            <li>Cyber Crime: <a href="tel:1930" className="text-primary font-semibold">1930</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} NyaySakhi. For educational awareness only. Consult a qualified lawyer for advice.
      </div>
    </footer>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1"><Outlet /></main>
        <Footer />
      </div>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
