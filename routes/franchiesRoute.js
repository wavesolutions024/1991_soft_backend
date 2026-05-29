import express from "express";
import {
  getUserDataViaToken,
  loginFranchiesCtrl,
  logout,
  regFranchies,
} from "../controller/franchiesController.js";
import { token, verifyRole } from "../utils/Token.js";
import { getAllLogs } from "../controller/logsController.js";

export const franchRoute = express.Router();

franchRoute.post("/addFranch", regFranchies);
franchRoute.post("/login", loginFranchiesCtrl);
franchRoute.get("/getFranchiesData", token, getUserDataViaToken);
franchRoute.get("/logout", logout);
franchRoute.get("/getAllLogs",token,verifyRole, getAllLogs)
