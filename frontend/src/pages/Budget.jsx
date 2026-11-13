import { useEffect, useState } from "react";
import API from "../api/axios";
import "./Budget.css";

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

const Budget = () => {
  const [month, setMonth] = useState(currentMonth());
  const [status, setStatus] = useState(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [catName, setCatName] = useState("");
  const [catType, setCatType] = useState("expense");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadBudget = async () => {
    try {
      const { data } = await API.get(`/budget?month=${month}`);
      setStatus(data);
      setBudgetInput(data.amount || "");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load budget");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data } = await API.get("/categories");
      setCategories(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load categories");
    }
  };

  useEffect(() => {
    loadBudget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  useEffect(() => {
    loadCategories();
  }, []);

  const saveBudget = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (budgetInput === "" || Number(budgetInput) < 0) {
      return setError("Enter a valid budget amount");
    }
    try {
      await API.post("/budget", { month, amount: Number(budgetInput) });
      setSuccess("Budget saved");
      loadBudget();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save budget");
    }
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!catName.trim()) return setError("Category name is required");
    try {
      if (editingId) {
        await API.put(`/categories/${editingId}`, { name: catName });
        setSuccess("Category updated");
      } else {
        await API.post("/categories", { name: catName, type: catType });
        setSuccess("Category added");
      }
      setCatName("");
      setEditingId(null);
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const editCategory = (c) => {
    setEditingId(c._id);
    setCatName(c.name);
    setCatType(c.type);
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCatName("");
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await API.delete(`/categories/${id}`);
      setSuccess("Category deleted");
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
    }
  };

  if (loading) return <p>Loading...</p>;

  const pct = status?.percentage || 0;
  const hasBudget = status && status.amount > 0;
  let level = "safe";
  let message = "You are within budget";
  if (pct >= 100) {
    level = "over";
    message = "Budget exceeded!";
  } else if (pct >= 80) {
    level = "warn";
    message = "Careful, you are close to your budget";
  }

  return (
    <div>
      <div className="b-header">
        <h2>Budget & Categories</h2>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      {error && <div className="b-msg error">{error}</div>}
      {success && <div className="b-msg success">{success}</div>}

      <div className="b-panel">
        <h4>Monthly Budget ({month})</h4>
        <form className="b-form" onSubmit={saveBudget}>
          <input
            type="number"
            min="0"
            placeholder="Set budget amount"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
          />
          <button className="b-btn primary" type="submit">
            Save Budget
          </button>
        </form>

        {hasBudget ? (
          <div className="b-status">
            <div className="b-numbers">
              <div>
                <small>Budget</small>
                <b>{fmt(status.amount)}</b>
              </div>
              <div>
                <small>Spent</small>
                <b className="red">{fmt(status.spent)}</b>
              </div>
              <div>
                <small>Remaining</small>
                <b className={status.remaining < 0 ? "red" : "green"}>
                  {fmt(status.remaining)}
                </b>
              </div>
            </div>

            <div className="progress">
              <div
                className={`progress-bar ${level}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <p className={`b-alert ${level}`}>
              {pct}% used. {message}
            </p>
          </div>
        ) : (
          <p className="empty">No budget set for this month yet.</p>
        )}
      </div>

      <div className="b-panel">
        <h4>Categories</h4>
        <form className="b-form" onSubmit={saveCategory}>
          <input
            placeholder="Category name"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
          />
          {!editingId && (
            <select value={catType} onChange={(e) => setCatType(e.target.value)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          )}
          <button className="b-btn primary" type="submit">
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button type="button" className="b-btn" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </form>

        {categories.length === 0 ? (
          <p className="empty">No categories yet</p>
        ) : (
          <div className="cat-list">
            {categories.map((c) => (
              <div className="cat-item" key={c._id}>
                <span>
                  {c.name} <em className={`tag ${c.type}`}>{c.type}</em>
                </span>
                <span>
                  <button className="link" onClick={() => editCategory(c)}>
                    Edit
                  </button>
                  <button
                    className="link danger"
                    onClick={() => deleteCategory(c._id)}
                  >
                    Delete
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Budget;