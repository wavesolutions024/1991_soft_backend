import express from "express";
import { addConsentCtrl } from "../controller/ConsentCtrl.js";
import { token } from "../utils/Token.js";
import { upload } from "../utils/multer.js";

export const consentRoute = express.Router();

consentRoute.post(
  "/add",
  upload.fields([
    { name: "idproof", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  token,
  addConsentCtrl,
);
