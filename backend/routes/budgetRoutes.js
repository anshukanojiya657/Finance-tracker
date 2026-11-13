const express = require("express");
const { getBudget, setBudget } = require("../controllers/budgetController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/").get(getBudget).post(setBudget);

module.exports = router;