import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#ec4899", "#8b5cf6"];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const Dashboard = () => {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonth());
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [monthly, setMonthly] = useState({ income: 0, expense: 0 });
  const [monthTx, setMonthTx] = useState([]);
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
        setMonthTx(txs.data);
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

  const byCategory = Object.values(
    monthTx
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = acc[t.category] || { name: t.category, value: 0 };
        acc[t.category].value += t.amount;
        return acc;
      }, {})
  );

  const saved = monthly.income - monthly.expense;
  const savingRate =
    monthly.income > 0 ? Math.round((saved / monthly.income) * 100) : 0;
  const recent = monthTx.slice(0, 5);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="dash-header">
        <div>
          <h2>
            {greeting()}, {user?.name} 👋
          </h2>
          <p className="dash-sub">Here is your financial overview</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      {error && <div className="dash-error">{error}</div>}

      <div className="cards">
        <div className="card balance">
          <span className="icon">💼</span>
          <p>Total Balance</p>
          <h3>{fmt(summary.balance)}</h3>
        </div>
        <div className="card income">
          <span className="icon">📈</span>
          <p>Total Income</p>
          <h3>{fmt(summary.income)}</h3>
        </div>
        <div className="card expense">
          <span className="icon">📉</span>
          <p>Total Expenses</p>
          <h3>{fmt(summary.expense)}</h3>
        </div>
      </div>

      <div className="panels">
        <div className="panel">
          <h4>Monthly Summary</h4>
          <div className="mini-stats">
            <div>
              <small>Income</small>
              <b className="green">{fmt(monthly.income)}</b>
            </div>
            <div>
              <small>Spent</small>
              <b className="red">{fmt(monthly.expense)}</b>
            </div>
            <div>
              <small>Saved</small>
              <b>
                {fmt(saved)} <em>({savingRate}%)</em>
              </b>
            </div>
          </div>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <h4>Spending by Category</h4>
          {byCategory.length === 0 ? (
            <p className="empty">No expenses this month</p>
          ) : (
            <>
              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={byCategory}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {byCategory.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="legend">
                {byCategory.map((c, i) => (
                  <span key={c.name}>
                    <i style={{ background: COLORS[i % COLORS.length] }} />
                    {c.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h4>Recent Transactions</h4>
        {recent.length === 0 ? (
          <p className="empty">No transactions this month</p>
        ) : (
          recent.map((t) => (
            <div className="tx-row" key={t._id}>
              <div className="tx-left">
                <div className={`tx-icon ${t.type}`}>
                  {t.type === "income" ? "↑" : "↓"}
                </div>
                <div>
                  <b>{t.title}</b>
                  <small>
                    {t.category} • {new Date(t.date).toLocaleDateString("en-IN")}
                  </small>
                </div>
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
  );
};

export default Dashboard;