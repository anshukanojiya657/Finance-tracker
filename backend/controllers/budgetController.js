const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

// GET /api/budget?month=2026-11
const getBudget = async (req, res) => {
  try {
    const month = req.query.month || currentMonth();
    const [year, m] = month.split("-").map(Number);

    const budget = await Budget.findOne({ user: req.user._id, month });

    const result = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: "expense",
          date: { $gte: new Date(year, m - 1, 1), $lt: new Date(year, m, 1) },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const spent = result.length ? result[0].total : 0;
    const amount = budget ? budget.amount : 0;
    const remaining = amount - spent;
    const percentage = amount > 0 ? Math.round((spent / amount) * 100) : 0;

    res.json({ month, amount, spent, remaining, percentage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/budget   body: { month: "2026-11", amount: 10000 }
const setBudget = async (req, res) => {
  try {
    const { amount } = req.body;
    const month = req.body.month || currentMonth();

    if (amount === undefined || Number(amount) < 0) {
      return res.status(400).json({ message: "Valid budget amount is required" });
    }

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, month },
      { amount: Number(amount) },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBudget, setBudget };