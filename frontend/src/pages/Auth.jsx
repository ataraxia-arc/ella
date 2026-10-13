import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { api, ensureCsrf, errorMessage } from "../api";
import { useAuth } from "../auth";
import { Wordmark } from "../components/chrome";

export default function AuthPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, ready, setUser } = useAuth();
  const [mode, setMode] = useState(params.get("mode") === "signup" ? "signup" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (ready && user) return <Navigate to="/dashboard" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (mode === "signup") {
      if (!name.trim()) return setError("Enter your full name.");
      if (password.length < 8) return setError("Use at least 8 characters.");
      if (password !== confirm) return setError("Passwords do not match.");
    }
    setBusy(true);
    try {
      await ensureCsrf();
      const path = mode === "signup" ? "/api/register" : "/api/login";
      const payload = mode === "signup"
        ? { name: name.trim(), email: email.trim(), password, password_confirmation: confirm }
        : { email: email.trim(), password };
      const { data } = await api.post(path, payload);
      setUser(data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(errorMessage(err, "Could not sign you in."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-cream p-10 lg:flex">
        <Link to="/"><Wordmark /></Link>
        <div>
          <p className="eyebrow">GRXX INTELLIGENCE</p>
          <h1 className="display-md mt-4">A clearer way<br />to keep stock.</h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">Intelligent Inventory. Effortless Control. Your products stay private to your account.</p>
        </div>
        <img src="/hero.jpg" alt="" className="h-56 w-full rounded-[1.75rem] object-cover object-[center_20%]" />
      </section>
      <section className="flex items-center justify-center bg-ivory px-5 py-16">
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
          <p className="eyebrow">{mode === "signup" ? "Create account" : "Welcome back"}</p>
          <h2 className="text-4xl tracking-tight">{mode === "signup" ? "Start with GRXX" : "Sign in"}</h2>
          <div className="flex gap-2 text-sm">
            <button type="button" onClick={() => setMode("login")} className={`rounded-full px-4 py-2 ${mode === "login" ? "bg-charcoal text-cream" : "text-muted"}`}>Login</button>
            <button type="button" onClick={() => setMode("signup")} className={`rounded-full px-4 py-2 ${mode === "signup" ? "bg-charcoal text-cream" : "text-muted"}`}>Signup</button>
          </div>
          {mode === "signup" ? (
            <label className="block text-sm">Full name<input className="field mt-1.5" value={name} onChange={(e) => setName(e.target.value)} required /></label>
          ) : null}
          <label className="block text-sm">Email<input className="field mt-1.5" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label className="block text-sm">Password
            <span className="relative mt-1.5 block">
              <input className="field pr-12" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((v) => !v)}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
          {mode === "signup" ? (
            <label className="block text-sm">Confirm password<input className="field mt-1.5" type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></label>
          ) : null}
          {error ? <p className="rounded-2xl border border-line bg-white px-4 py-3 text-sm" role="alert">{error}</p> : null}
          <button type="submit" disabled={busy} className="flex h-12 w-full items-center justify-center rounded-full bg-charcoal text-sm text-cream disabled:opacity-60">
            {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
