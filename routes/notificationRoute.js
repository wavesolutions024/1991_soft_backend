import express from "express";
import { token } from "../utils/Token.js";
import { getBirthNotifi } from "../controller/NotificationController.js";

export const notifyRoute = express.Router();

notifyRoute.get("/getBirthNotify", token, getBirthNotifi)