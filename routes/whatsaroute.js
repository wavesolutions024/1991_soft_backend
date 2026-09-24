import express from "express";
import { createWpTemplate, getImageStatus, getWhatsAppTemplates, getWhatsappWebhook, postWhatsappWebhook, sendMessage, uploadImageToMeta, whatsappAnalyticsController } from "../controller/WhatsappController.js";
import { upload } from "../utils/multer.js";
export const whatsappRoute = express.Router();


whatsappRoute.get("/webhook",getWhatsappWebhook)
whatsappRoute.post("/webhook",postWhatsappWebhook);
whatsappRoute.post("/createWpTemplate",createWpTemplate);
whatsappRoute.get("/getWhatsAppTemplates",getWhatsAppTemplates);
whatsappRoute.get("/getImageStatus",getImageStatus);
whatsappRoute.post("/uploadImageToMeta", upload.fields([
    { name: "file", maxCount: 1 }
  ]), uploadImageToMeta);
whatsappRoute.post("/sendMessage",sendMessage);

whatsappRoute.get("/getWhatsappAnyaltics", whatsappAnalyticsController)