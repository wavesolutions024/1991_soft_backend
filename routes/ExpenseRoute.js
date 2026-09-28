import express from "express";  
import { addExpense } from "../controller/Expense.js";
import { token, verifyRole } from "../utils/Token.js";
import { receiptUpload } from "../utils/multer.js";


export const expenseRoute = express.Router();

expenseRoute.post(
  "/addExpense",
  receiptUpload.single("receipt"),
  token,
  verifyRole,
  addExpense
);