import express from "express";
import { createWpTemplate, getWhatsappWebhook, postWhatsappWebhook, sendMessage } from "../controller/WhatsappController.js";
export const whatsappRoute = express.Router();


whatsappRoute.get("/webhook",getWhatsappWebhook)
whatsappRoute.post("/webhook",postWhatsappWebhook);
whatsappRoute.post("/createWpTemplate",createWpTemplate);
whatsappRoute.post("/sendMessage",sendMessage)