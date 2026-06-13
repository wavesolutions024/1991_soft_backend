import express from "express";
import { token } from "../utils/Token.js";
import {
  addEnquiry,
  getAllEnquiry,
  getEnquiryById,
  updateEnquiry,
  updateEnquiryStatus,
} from "../controller/EnquiryController.js";

export const enquiryRoute = express.Router();

enquiryRoute.post("/add", token, addEnquiry);
enquiryRoute.put("/updateStatus", token, updateEnquiryStatus);
enquiryRoute.get("/getAllEnquiry", token, getAllEnquiry);
enquiryRoute.get("/getEnquiryById", token, getEnquiryById);
enquiryRoute.put("/updateEnquiry", token, updateEnquiry);
