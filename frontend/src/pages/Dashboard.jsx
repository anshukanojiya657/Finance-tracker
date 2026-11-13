import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import API from "../api/axios";
import "./Dashboard.css";

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

const Dashboard = () => {
  const [month, setMonth] = useState(currentMonth());
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [monthly, setMonthly] = useState({ income: 0, expense: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [all, monthSum, txs] = await Promise.all([
          API.get("/transactions/summary"),
          API.get(`/transactions/summary?month=${month}`),
          API.get(`/transactions?month=${month}`),
        ]);
        setSummary(all.data);
        setMonthly(monthSum.data);
        setRecent(txs.data.slice(0, 5));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [month]);

  const chartData = [
    { name: "Income", value: monthly.income, color: "#10b981" },
    { name: "Expenses", value: monthly.expense, color: "#ef4444" },
  ];

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="dash-header">
        <h2>Dashboard</h2>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      {error && <div className="dash-error">{error}</div>}

      <div className="cards">
        <div className="card balance">
          <p>Total Balance</p>
          <h3>{fmt(summary.balance)}</h3>
        </div>
        <div className="card income">
          <p>Total Income</p>
          <h3>{fmt(summary.income)}</h3>
        </div>
        <div className="card expense">
          <p>Total Expenses</p>
          <h3>{fmt(summary.expense)}</h3>
        </div>
      </div>

      <div className="panels">
        <div className="panel">
          <h4>Monthly Summary ({month})</h4>
          <p className="m-row">
            Income: <b className="green">{fmt(monthly.income)}</b>
          </p>
          <p className="m-row">
            Spent: <b className="red">{fmt(monthly.expense)}</b>
          </p>
          <p className="m-row">
            Saved:{" "}
            <b>{fmt(monthly.income - monthly.expense)}</b>
          </p>

          <div style={{ width: "100%", height: 220, marginTop: 12 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <h4>Recent Transactions</h4>
          {recent.length === 0 ? (
            <p className="empty">No transactions this month</p>
          ) : (
            recent.map((t) => (
              <div className="tx-row" key={t._id}>
                <div>
                  <b>{t.title}</b>
                  <small>
                    {t.category} • {new Date(t.date).toLocaleDateString("en-IN")}
                  </small>
                </div>
                <span className={t.type === "income" ? "green" : "red"}>
                  {t.type === "income" ? "+" : "-"}
                  {fmt(t.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;