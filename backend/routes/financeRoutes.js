// routes/financeRoutes.js
const express = require("express");
const { financeAuth } = require("../middleware/financeAuth");
const ctrl = require("../controllers/finance.controller");

const router = express.Router();

/* Tenants */
router.get("/tenants", financeAuth, ctrl.listTenants);
router.post("/tenants", financeAuth, ctrl.createTenant);

/* Accounts */
router.get("/:tenantId/accounts", financeAuth, ctrl.getAccounts);
router.post("/:tenantId/accounts", financeAuth, ctrl.createAccount);
router.patch("/:tenantId/accounts/:id", financeAuth, ctrl.updateAccount);

/* Categories */
router.get("/:tenantId/categories", financeAuth, ctrl.getCategories);
router.post("/:tenantId/categories", financeAuth, ctrl.createCategory);

/* Transactions */
router.get("/:tenantId/transactions", financeAuth, ctrl.listTransactions);
router.post("/:tenantId/transactions", financeAuth, ctrl.createTransaction);
router.patch("/:tenantId/transactions/:id", financeAuth, ctrl.updateTransaction);
router.delete("/:tenantId/transactions/:id", financeAuth, ctrl.deleteTransaction);

/* Budgets */
router.get("/:tenantId/budgets", financeAuth, ctrl.getBudgets);
router.post("/:tenantId/budgets", financeAuth, ctrl.upsertBudget);

/* Summary */
router.get("/:tenantId/summary", financeAuth, ctrl.summaryMonthly);




module.exports = router;
