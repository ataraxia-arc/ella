import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api";
import { useAuth } from "../auth";
import { Workspace } from "../components/chrome";

const peso = (value) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(Number(value) || 0);

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api.get("/api/dashboard/stats")
      .then((res) => { if (!cancelled) setData(res.data); })
      .catch(() => { if (!cancelled) setError("Could not load your overview."); });
    return () => { cancelled = true; };
  }, []);

  const status = data ? [
    { name: "In stock", value: data.in_stock_count, fill: "#161616" },
    { name: "Low stock", value: data.low_stock_count, fill: "#9890FF" },
    { name: "Out of stock", value: data.out_of_stock_count, fill: "#C6C3BD" },
  ].filter((d) => d.value > 0) : [];

  return (
    <Workspace crumb="Overview" title="Your business, at a glance." action={<Link to="/products?create=1" className="inline-flex h-11 items-center rounded-full bg-charcoal px-5 text-sm text-cream">Add product</Link>}>
      {error ? <p role="alert">{error}</p> : null}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total Products" value={data ? data.total_products : "—"} />
        <Metric label="Total Inventory Units" value={data ? data.total_units : "—"} />
        <Metric label="Total Inventory Value" value={data ? peso(data.total_value) : "—"} />
        <Metric label="Low Stock Products" value={data ? data.low_stock_count : "—"} />
      </section>
      {data && data.total_products === 0 ? (
        <section className="surface mt-6 px-6 py-16 text-center">
          <h2 className="text-3xl tracking-tight">Your inventory starts here.</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">Add your first product and begin building a clearer picture of your business.</p>
          <Link to="/products?create=1" className="mt-6 inline-flex h-11 items-center rounded-full bg-charcoal px-5 text-sm text-cream">Add First Product</Link>
        </section>
      ) : null}
      {data && data.total_products > 0 ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-5">
          <article className="surface p-6 xl:col-span-3">
            <h2 className="text-lg">Inventory distribution by category</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.by_category}>
                  <XAxis dataKey="category" tick={{ fill: "#85837F", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "#85837F", fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip />
                  <Bar dataKey="units" fill="#161616" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
          <article className="surface p-6 xl:col-span-2">
            <h2 className="text-lg">Stock status</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={status} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} stroke="none">
                    {status.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>
          <article className="surface p-6 xl:col-span-3">
            <h2 className="text-lg">Recent products</h2>
            <ul className="mt-3 divide-y divide-line text-sm">
              {data.recent.map((p) => <li key={p.id} className="flex justify-between py-3"><span>{p.name}</span><span className="text-muted">{p.sku}</span></li>)}
            </ul>
          </article>
          <article className="surface p-6 xl:col-span-2">
            <h2 className="text-lg">Low-stock products</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {data.low_stock.length ? data.low_stock.map((p) => <li key={p.id} className="flex justify-between"><span>{p.name}</span><span>{p.stock_quantity}</span></li>) : <li className="text-muted">Nothing is sitting at a low level.</li>}
            </ul>
          </article>
        </div>
      ) : null}
      <section id="account" className="surface mt-6 p-6">
        <h2 className="text-lg">Account</h2>
        <p className="mt-2 text-sm">Name<br />{user?.name}</p>
        <p className="mt-2 text-sm">Email<br />{user?.email}</p>
      </section>
    </Workspace>
  );
}

function Metric({ label, value }) {
  return (
    <article className="surface p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-4 text-3xl tracking-tight tabular-nums">{value}</p>
    </article>
  );
}
