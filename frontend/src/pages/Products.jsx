import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, errorMessage } from "../api";
import { Workspace } from "../components/chrome";

const empty = { name: "", sku: "", category: "", description: "", price: "", stock_quantity: "", low_stock_threshold: 5 };
const peso = (value) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(Number(value) || 0);

export default function ProductsPage() {
  const [params] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [notice, setNotice] = useState("");
  const [editor, setEditor] = useState(params.get("create") === "1" ? { mode: "create", form: empty } : null);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await api.get("/api/products", { params: { search, category, status, sort } });
    setProducts(data.data);
    setLoading(false);
  }

  useEffect(() => {
    const t = setTimeout(() => { void load().catch(() => setNotice("Could not load products.")); }, 180);
    return () => clearTimeout(t);
  }, [search, category, status, sort]);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const payload = {
        ...editor.form,
        price: Number(editor.form.price),
        stock_quantity: Number(editor.form.stock_quantity),
        low_stock_threshold: Number(editor.form.low_stock_threshold),
      };
      if (editor.mode === "edit") await api.put(`/api/products/${editor.id}`, payload);
      else await api.post("/api/products", payload);
      setNotice(editor.mode === "edit" ? "Product updated" : "Product added");
      setEditor(null);
      await load();
    } catch (err) {
      setNotice(errorMessage(err, "Could not save the product."));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await api.delete(`/api/products/${pending.id}`);
      setNotice("Product deleted");
      setPending(null);
      await load();
    } catch (err) {
      setNotice(errorMessage(err, "Could not delete the product."));
    } finally {
      setBusy(false);
    }
  }

  const categories = [...new Set(products.map((p) => p.category))];
  const emptyState = !loading && products.length === 0 && !search && !category && status === "all";

  return (
    <Workspace crumb="Products" title="Products" action={<button type="button" className="h-11 rounded-full bg-charcoal px-5 text-sm text-cream" onClick={() => setEditor({ mode: "create", form: empty })}>Add Product</button>}>
      {notice ? <p className="mb-4 text-sm" role="status">{notice}</p> : null}
      <div className="surface mb-4 grid gap-3 p-4 md:grid-cols-4">
        <input className="field" placeholder="Search name, SKU, or category" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search products" />
        <select className="field" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="field" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Stock status">
          <option value="all">All stock</option>
          <option value="in">In stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
        <select className="field" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="newest">Newest</option>
          <option value="name">Name</option>
          <option value="price_asc">Price, low to high</option>
          <option value="price_desc">Price, high to low</option>
          <option value="stock">Stock, low to high</option>
        </select>
      </div>
      {loading ? <p className="text-sm text-muted">Loading products…</p> : emptyState ? (
        <section className="surface px-6 py-16 text-center">
          <h2 className="text-3xl tracking-tight">Your inventory starts here.</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">Add your first product and begin building a clearer picture of your business.</p>
          <button type="button" className="mt-6 h-11 rounded-full bg-charcoal px-5 text-sm text-cream" onClick={() => setEditor({ mode: "create", form: empty })}>Add First Product</button>
        </section>
      ) : (
        <div className="surface overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted">
              <tr className="border-b border-line">
                {["Product", "SKU", "Category", "Price", "Qty", "Status", "Actions"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-4">{p.name}</td>
                  <td className="px-4 py-4 text-muted">{p.sku}</td>
                  <td className="px-4 py-4">{p.category}</td>
                  <td className="px-4 py-4 tabular-nums">{peso(p.price)}</td>
                  <td className="px-4 py-4">{p.stock_quantity}</td>
                  <td className="px-4 py-4">{p.status === "out" ? "Out of stock" : p.status === "low" ? "Low stock" : "In stock"}</td>
                  <td className="px-4 py-4">
                    <button type="button" className="mr-2 rounded-full border border-line px-3 py-1.5 text-xs" onClick={() => setEditor({ mode: "edit", id: p.id, form: { name: p.name, sku: p.sku, category: p.category, description: p.description, price: p.price, stock_quantity: p.stock_quantity, low_stock_threshold: p.low_stock_threshold } })}>Edit</button>
                    <button type="button" className="rounded-full border border-line px-3 py-1.5 text-xs" onClick={() => setPending(p)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!products.length ? <p className="p-6 text-sm text-muted">No products match those filters.</p> : null}
        </div>
      )}

      {editor ? (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <button type="button" className="absolute inset-0 bg-void/40" aria-label="Close form" onClick={() => setEditor(null)} />
          <form className="surface relative w-full max-w-xl p-6" onSubmit={save}>
            <h2 className="text-3xl tracking-tight">{editor.mode === "edit" ? "Update details" : "Add a product"}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[["name", "Product name"], ["sku", "SKU"], ["category", "Category"], ["price", "Price"], ["stock_quantity", "Stock quantity"], ["low_stock_threshold", "Low-stock threshold"]].map(([key, label]) => (
                <label key={key} className="text-sm">{label}
                  <input className="field mt-1.5" required value={editor.form[key]} onChange={(e) => setEditor({ ...editor, form: { ...editor.form, [key]: e.target.value } })} />
                </label>
              ))}
              <label className="text-sm sm:col-span-2">Description
                <textarea className="field mt-1.5 min-h-24" value={editor.form.description} onChange={(e) => setEditor({ ...editor, form: { ...editor.form, description: e.target.value } })} />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="h-11 rounded-full border border-line px-5 text-sm" onClick={() => setEditor(null)}>Cancel</button>
              <button type="submit" disabled={busy} className="h-11 rounded-full bg-charcoal px-5 text-sm text-cream">{busy ? "Saving…" : "Save product"}</button>
            </div>
          </form>
        </div>
      ) : null}

      {pending ? (
        <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0 bg-void/40" aria-label="Cancel delete" onClick={() => setPending(null)} />
          <div className="surface relative w-full max-w-md p-6">
            <h2 className="text-2xl tracking-tight">Delete {pending.name}?</h2>
            <p className="mt-2 text-sm text-muted">This removes the product from your inventory. The action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="h-11 rounded-full border border-line px-5 text-sm" onClick={() => setPending(null)}>Cancel</button>
              <button type="button" disabled={busy} className="h-11 rounded-full bg-charcoal px-5 text-sm text-cream" onClick={() => void remove()}>{busy ? "Deleting…" : "Delete product"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </Workspace>
  );
}
