import express from "express";
import { getWhatsappWebhook, postWhatsappWebhook } from "../controller/WhatsappController";
export const whatsappRoute = express.Router();


whatsappRoute.get("/webhook",getWhatsappWebhook)
whatsappRoute.post("/webhook",postWhatsappWebhook);