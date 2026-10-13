import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Menu, Package, UserRound, X } from "lucide-react";
import { useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth";

export function Wordmark() {
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="text-[15px] font-semibold tracking-[0.2em]">GRXX</span>
      <span className="text-[10px] font-medium tracking-[0.22em] text-muted">INTELLIGENCE</span>
    </span>
  );
}

export function Pill({ to, children, ghost = false }) {
  return (
    <Link to={to} className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium ${ghost ? "border border-line" : "bg-charcoal text-cream"}`}>
      {children}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const links = [
    ["Home", "/"],
    ["Features", "/#features"],
    ["Solutions", "/#solutions"],
    ["Dashboard", "/dashboard"],
    ["Products", "/products"],
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" aria-label="GRXX INTELLIGENCE home"><Wordmark /></Link>
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map(([label, to]) => (
            <Link key={label} to={to} className="text-sm text-muted hover:text-ink">{label}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {user ? <Pill to="/dashboard">Open workspace</Pill> : (
            <>
              <Link to="/login" className="px-3 text-sm">Sign In</Link>
              <Pill to="/login?mode=signup">Get Started</Pill>
            </>
          )}
        </div>
        <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-line lg:hidden" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {open ? (
        <div className="space-y-2 border-t border-line px-5 py-4 lg:hidden">
          {links.map(([label, to]) => (
            <Link key={label} to={to} onClick={() => setOpen(false)} className="block rounded-2xl px-3 py-3">{label}</Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-3">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted">Intelligent Inventory. Effortless Control.</p>
        </div>
        <div className="text-sm space-y-2">
          <p className="eyebrow">Navigate</p>
          <Link className="block" to="/">Home</Link>
          <Link className="block" to="/#features">Features</Link>
          <Link className="block" to="/dashboard">Dashboard</Link>
          <Link className="block" to="/products">Products</Link>
        </div>
        <div className="text-sm space-y-2">
          <p className="eyebrow">Account</p>
          <Link className="block" to="/login">Sign In</Link>
          <Link className="block" to="/login?mode=signup">Create account</Link>
        </div>
      </div>
      <p className="border-t border-line px-5 py-5 text-xs text-muted">© {new Date().getFullYear()} GRXX INTELLIGENCE</p>
    </footer>
  );
}

export function Workspace({ crumb, title, action, children }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const initials = (user?.name || "G").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  async function logout() {
    await api.post("/api/logout");
    setUser(null);
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[248px_1fr]">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-line bg-ivory p-5 lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"} transition-transform`}>
        <div className="flex items-center justify-between">
          <Link to="/"><Wordmark /></Link>
          <button type="button" className="lg:hidden" aria-label="Close" onClick={() => setOpen(false)}><X size={18} /></button>
        </div>
        <nav className="mt-10 flex flex-col gap-1">
          <NavLink to="/dashboard" className={({ isActive }) => `flex h-11 items-center gap-3 rounded-2xl px-3 text-sm ${isActive ? "bg-charcoal text-cream" : ""}`}><LayoutDashboard size={16} /> Overview</NavLink>
          <NavLink to="/products" className={({ isActive }) => `flex h-11 items-center gap-3 rounded-2xl px-3 text-sm ${isActive ? "bg-charcoal text-cream" : ""}`}><Package size={16} /> Products</NavLink>
          <a href="/dashboard#account" className="flex h-11 items-center gap-3 rounded-2xl px-3 text-sm"><UserRound size={16} /> Account</a>
        </nav>
        <button type="button" onClick={() => void logout()} className="absolute bottom-5 left-5 flex h-11 items-center gap-3 text-sm"><LogOut size={16} /> Logout</button>
      </aside>
      <div>
        <header className="flex items-center justify-between border-b border-line px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-line lg:hidden" aria-label="Open sidebar" onClick={() => setOpen(true)}><Menu size={18} /></button>
            <p className="text-sm text-muted">{crumb}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm">Welcome, {user?.name}</p>
              <p className="text-xs text-muted">{user?.email}</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-charcoal text-xs text-cream">{initials}</span>
          </div>
        </header>
        <div className="px-4 py-8 sm:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-4xl tracking-tight sm:text-5xl">{title}</h1>
            {action}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
