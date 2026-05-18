import express from "express";
import { token, verifyRole } from "../utils/Token.js";
import {
  addClinets,
  deleteClient,
  editClient,
  getAllClients,
  getClientById,
} from "../controller/clientsController.js";
import { upload } from "../utils/multer.js";

export const clientRoute = express.Router();

clientRoute.post(
  "/add",
  upload.fields([{ name: "tattooImage", maxCount: 1 }]),
  token,
  addClinets,
);

clientRoute.get("/getAllClients", token, getAllClients);
clientRoute.get("/getClientById", token, getClientById);
clientRoute.put(
  "/editClient",
  upload.fields([{ name: "tattooImage", maxCount: 1 }]),
  token,
  editClient,
);

clientRoute.delete("/deleteClient",token,verifyRole, deleteClient)
