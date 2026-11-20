import express from "express";
import { token, verifyRole } from "../utils/Token.js";
import {
  addEnquiry,
  addOutEnquiry,
  getAllEnquiry,
  getAllLandingPageEnquiry,
  getEnquiryById,
  updateEnquiry,
  updateEnquiryStatus,
} from "../controller/EnquiryController.js";

export const enquiryRoute = express.Router();

enquiryRoute.post("/add", token, addEnquiry);
enquiryRoute.patch("/updateStatus", token, verifyRole, updateEnquiryStatus);
enquiryRoute.get("/getAllEnquiry", token, getAllEnquiry);
enquiryRoute.get("/getEnquiryById", token, getEnquiryById);
enquiryRoute.put("/updateEnquiry", token, updateEnquiry);
enquiryRoute.post("/addOutEnquiry", addOutEnquiry);
enquiryRoute.get("/getAllLandingPageEnquiry",token,  getAllLandingPageEnquiry);
