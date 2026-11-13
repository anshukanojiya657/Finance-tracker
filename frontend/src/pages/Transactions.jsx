import { useEffect, useState } from "react";
import API from "../api/axios";
import "./Transactions.css";

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  title: "",
  amount: "",
  type: "expense",
  category: "",
  date: today(),
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ type: "", category: "" });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCategories = async () => {
    try {
      const { data } = await API.get("/categories");
      setCategories(data);
    } catch {
      /* categories optional hain, error ignore */
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      const { data } = await API.get("/transactions", { params });
      setTransactions(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title.trim()) return setError("Title is required");
    if (!form.amount || Number(form.amount) <= 0)
      return setError("Amount must be greater than 0");
    if (!form.category.trim()) return setError("Category is required");
    if (!form.date) return setError("Date is required");

    setSaving(true);
    try {
      if (editingId) {
        await API.put(`/transactions/${editingId}`, form);
        setSuccess("Transaction updated");
      } else {
        await API.post("/transactions", form);
        setSuccess("Transaction added");
      }
      setForm(emptyForm);
      setEditingId(null);
      loadTransactions();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (t) => {
    setEditingId(t._id);
    setForm({
      title: t.title,
      amount: t.amount,
      type: t.type,
      category: t.category,
      date: t.date.slice(0, 10),
    });
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await API.delete(`/transactions/${id}`);
      setSuccess("Transaction deleted");
      loadTransactions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
    }
  };

  // dropdown me categories: form ke type ke hisaab se
  const formCategories = categories.filter((c) => c.type === form.type);

  return (
    <div>
      <h2>Transactions</h2>

      <form className="tx-form" onSubmit={handleSubmit}>
        <h4>{editingId ? "Edit Transaction" : "Add Transaction"}</h4>

        {error && <div className="msg error">{error}</div>}
        {success && <div className="msg success">{success}</div>}

        <div className="form-grid">
          <input
            name="title"
            placeholder="Title / Description"
            value={form.title}
            onChange={handleChange}
          />
          <input
            name="amount"
            type="number"
            min="0"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
          />
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <input
            name="category"
            list="category-list"
            placeholder="Category (type or pick)"
            value={form.category}
            onChange={handleChange}
          />
          <datalist id="category-list">
            {formCategories.map((c) => (
              <option key={c._id} value={c.name} />
            ))}
          </datalist>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button type="button" className="btn" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="filters">
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All categories</option>
          {[...new Set(categories.map((c) => c.name))].map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        {(filters.type || filters.category) && (
          <button
            className="btn"
            onClick={() => setFilters({ type: "", category: "" })}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="table-wrap">
        {loading ? (
          <p style={{ padding: 16 }}>Loading...</p>
        ) : transactions.length === 0 ? (
          <p style={{ padding: 16 }} className="empty">
            No transactions found
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td>{new Date(t.date).toLocaleDateString("en-IN")}</td>
                  <td>{t.title}</td>
                  <td>{t.category}</td>
                  <td>
                    <span className={`badge ${t.type}`}>{t.type}</span>
                  </td>
                  <td className={t.type === "income" ? "green" : "red"}>
                    {t.type === "income" ? "+" : "-"}
                    {fmt(t.amount)}
                  </td>
                  <td>
                    <button className="link" onClick={() => handleEdit(t)}>
                      Edit
                    </button>
                    <button
                      className="link danger"
                      onClick={() => handleDelete(t._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Transactions;