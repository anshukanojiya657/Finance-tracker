const express = require("express");
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
} = require("../controllers/transactionController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect); // is file ke saare routes login maangte hain

router.get("/summary", getSummary); // /:id se pehle hi rakhna
router.route("/").get(getTransactions).post(addTransaction);
router.route("/:id").put(updateTransaction).delete(deleteTransaction);

module.exports = router;