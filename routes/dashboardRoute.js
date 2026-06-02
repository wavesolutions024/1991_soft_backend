import express from "express";
import { 
  getDashboard, 
  getDashboardStats_API, 
  getMonthlyGrowth, 
  getCalendar 
} from "../controller/DashBoardController.js";
import { token, verifyRole } from "../utils/Token.js";

export const dashboardRoute = express.Router();

// Get complete dashboard (all data in one call)
dashboardRoute.get("/dashboard", token,verifyRole, getDashboard);

// Get individual endpoints
dashboardRoute.get("/stats", token,verifyRole, getDashboardStats_API);
dashboardRoute.get("/monthly-growth", token,verifyRole, getMonthlyGrowth);
dashboardRoute.get("/calendar", token,verifyRole, getCalendar);
