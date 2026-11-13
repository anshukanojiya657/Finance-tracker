const Transaction = require("../models/Transaction");

// GET /api/transactions?type=expense&category=Food&month=2026-11
const getTransactions = async (req, res) => {
  try {
    const { type, category, month } = req.query;
    const filter = { user: req.user._id };

    if (type) filter.type = type;
    if (category) filter.category = category;

    if (month) {
      const [year, m] = month.split("-").map(Number);
      filter.date = {
        $gte: new Date(year, m - 1, 1),
        $lt: new Date(year, m, 1),
      };
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/transactions
const addTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;

    if (!title || !amount || !type || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Type must be income or expense" });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount,
      type,
      category,
      date: date || Date.now(),
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;

    if (type && !["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Type must be income or expense" });
    }
    if (amount !== undefined && Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, amount, type, category, date },
      { new: true, runValidators: true, omitUndefined: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/transactions/summary?month=2026-11
const getSummary = async (req, res) => {
  try {
    const { month } = req.query;
    const match = { user: req.user._id };

    if (month) {
      const [year, m] = month.split("-").map(Number);
      match.date = {
        $gte: new Date(year, m - 1, 1),
        $lt: new Date(year, m, 1),
      };
    }

    const result = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    let income = 0;
    let expense = 0;
    result.forEach((r) => {
      if (r._id === "income") income = r.total;
      if (r._id === "expense") expense = r.total;
    });

    res.json({ income, expense, balance: income - expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
};