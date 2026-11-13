const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
  })
);
app.use(express.json());
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
const transactionRoutes = require("./routes/transactionRoutes");
app.use("/api/transactions", transactionRoutes);
const categoryRoutes = require("./routes/categoryRoutes");
app.use("/api/categories", categoryRoutes);

const budgetRoutes = require("./routes/budgetRoutes");
app.use("/api/budget", budgetRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Finance Tracker API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));