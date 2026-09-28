
import express from "express";
import { dashboardCtrlStats } from "../controller/FinDashboard.js";
import { token, verifyRole } from "../utils/Token.js";

export const finDashroute = express.Router();

finDashroute.get("/dashboardCtrlStats",token,verifyRole, dashboardCtrlStats)