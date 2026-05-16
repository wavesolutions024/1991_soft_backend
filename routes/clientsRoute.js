import express from "express";
import { token } from "../utils/Token.js";
import { addClinets } from "../controller/clientsController.js";
import { upload } from "../utils/multer.js";

export const clientRoute = express.Router();

clientRoute.post("/add",  upload.fields([
    { name: "tattooImage", maxCount: 1 }
  ]), token,addClinets)