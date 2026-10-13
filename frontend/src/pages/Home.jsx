import { SiteFooter, SiteHeader, Pill } from "../components/chrome";

export default function HomePage() {
  return (
    <div className="atmosphere min-h-screen">
      <SiteHeader />
      <main>
        <section className="px-5 pb-4 pt-16 text-center sm:pt-20">
          <p className="eyebrow">The intelligence behind your inventory</p>
          <h1 className="display mx-auto mt-6 max-w-5xl">Your business,<br />reimagined.</h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted">
            Organize effortlessly. Track intelligently. Grow confidently. Experience inventory management built for a clearer tomorrow.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Pill to="/login?mode=signup">Get Started</Pill>
            <Pill to="/#features" ghost>Explore Platform</Pill>
          </div>
        </section>
        <div className="mx-auto mt-8 max-w-6xl px-5">
          <div className="relative overflow-hidden rounded-[2rem] bg-void">
            <img src="/hero.jpg" alt="Cinematic portrait with lavender and blue rim light" className="h-[460px] w-full object-cover object-[center_22%] sm:h-[560px]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cream via-transparent to-void/40" />
            <div className="absolute bottom-6 left-6 right-6 hidden gap-3 lg:grid lg:grid-cols-4">
              {["Inventory Overview", "Product Intelligence", "Stock Monitoring", "Business Insights"].map((title) => (
                <article key={title} className="glass-card rounded-3xl p-4">
                  <p className="text-sm font-medium">{title}</p>
                  <p className="mt-1 text-xs text-white/70">A quieter way to see the work.</p>
                </article>
              ))}
            </div>
          </div>
        </div>
        <section className="mx-auto max-w-6xl px-5 py-24">
          <p className="eyebrow">Why GRXX INTELLIGENCE</p>
          <h2 className="display-md mt-4">Simplicity in every detail.<br />Clarity in every decision.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Effortless Organization", "Bring products, categories, and inventory records into one refined workspace."],
              ["02", "Smarter Business Insights", "Understand important inventory metrics instantly."],
              ["03", "Complete Control", "Manage product data with precision and confidence."],
            ].map(([n, title, copy]) => (
              <article key={n} className="surface p-7">
                <p className="text-sm tracking-[0.18em] text-muted">{n}</p>
                <h3 className="mt-6 text-2xl tracking-tight">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{copy}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="features" className="bg-ivory py-24">
          <div className="mx-auto max-w-6xl px-5">
            <p className="eyebrow">Made to work smarter</p>
            <h2 className="display-md mt-4">Powerful tools for<br />a more intelligent business.</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {[
                ["Product Inventory Management", "Create, update, and remove products with a calm table."],
                ["Real-Time Stock Overview", "See in stock, low stock, and out of stock immediately."],
                ["Inventory Analytics", "Category mix and inventory value from your own records."],
                ["Secure Account Access", "Every record belongs only to the signed-in account."],
                ["Organized Product Categories", "Filter and group what you sell."],
                ["Business Performance Visibility", "Products, units, and value on one overview."],
              ].map(([title, copy]) => (
                <article key={title} className="surface p-6">
                  <h3 className="text-xl tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="solutions" className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-24 lg:grid-cols-2">
          <div>
            <h2 className="display-md">Your inventory,<br />understood.</h2>
            <p className="mt-5 max-w-md text-muted">Every product tells a story. GRXX INTELLIGENCE turns your inventory data into clarity so you can focus on what matters.</p>
            <div className="mt-8"><Pill to="/dashboard">Explore Dashboard</Pill></div>
          </div>
          <div className="surface p-6">
            <p className="text-xs tracking-[0.16em] text-soft">PREVIEW</p>
            <p className="mt-4 text-3xl tracking-tight">At a glance</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {["Products", "Units", "Value", "Low stock"].map((label) => (
                <div key={label} className="rounded-2xl border border-line bg-ivory p-4 text-sm">{label}</div>
              ))}
            </div>
          </div>
        </section>
        <section className="bg-ivory py-24">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-3">
            {[
              ["01", "Create Your Workspace", "Register securely and access your personal dashboard."],
              ["02", "Organize Your Inventory", "Add products, update details, and manage stock levels."],
              ["03", "Understand Your Business", "Monitor inventory metrics and gain meaningful insights."],
            ].map(([n, title, copy]) => (
              <article key={n}>
                <p className="text-sm tracking-[0.2em] text-muted">{n}</p>
                <h3 className="mt-3 text-2xl tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="px-5 py-24 text-center">
          <h2 className="display-md">Intelligence begins<br />with clarity.</h2>
          <p className="mx-auto mt-4 max-w-md text-muted">Everything you need to manage your inventory, beautifully connected.</p>
          <div className="mt-8"><Pill to="/login?mode=signup">Start with GRXX</Pill></div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
