import express from "express";
import { getUserDataViaToken, loginFranchiesCtrl, regFranchies } from "../controller/franchiesController.js";
import { token } from "../utils/Token.js";

export const franchRoute = express.Router();

franchRoute.post("/addFranch", regFranchies);
franchRoute.post("/login",loginFranchiesCtrl);
franchRoute.get("/getFranchiesData", token, getUserDataViaToken);