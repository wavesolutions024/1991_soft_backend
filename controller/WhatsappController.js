import dotenv from "dotenv";
import {
  createWhatsAppTemplate,
  sendTattooSessionConfirmation,
} from "../services/WhatsappService.js";
import axios from "axios";
dotenv.config();

const wpToken = process.env.WHATSAPP_VERIFY_TOKEN;
const GRAPH_VERSION = process.env.META_GRAPH_VERSION;
import FormData from "form-data";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const APP_ID = process.env.META_APP_ID;

export const getWhatsappWebhook = (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("Webhook verification request received");

    if (mode === "subscribe" && token === wpToken) {
      console.log("WhatsApp webhook verified successfully");

      return res.status(200).send(challenge);
    }

    console.log("Webhook verification failed");

    return res.sendStatus(403);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const postWhatsappWebhook = async (req, res) => {
  console.log("🔥🔥 WEBHOOK POST CONTROLLER HIT 🔥🔥");
  try {
    console.log(
      "WhatsApp webhook received:",
      JSON.stringify(req.body, null, 2),
    );

    // Meta ला लगेच 200
    res.sendStatus(200);

    const body = req.body;

    if (body.object !== "whatsapp_business_account") {
      return;
    }

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== "messages") continue;

        const value = change.value;

        // MESSAGE STATUS
        for (const status of value.statuses || []) {
          console.log("================================");
          console.log("MESSAGE STATUS");
          console.log("ID:", status.id);
          console.log("STATUS:", status.status);
          console.log("RECIPIENT:", status.recipient_id);
          console.log("================================");
        }

        // INCOMING MESSAGE
        for (const message of value.messages || []) {
          console.log("================================");
          console.log("INCOMING MESSAGE");
          console.log("FROM:", message.from);
          console.log("TYPE:", message.type);

          if (message.type === "text") {
            console.log("TEXT:", message.text?.body);
          }

          console.log("================================");
        }
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
  }
};

// whatsapp template

export const createWpTemplate = async (req, res) => {
  try {
    const result = await createWhatsAppTemplate();

    res.status(200).json({
      success: true,
      message: "Template submitted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Template creation failed",
      error: error.response?.data || error.message,
    });
  }
};

export const uploadImageToMeta = async (req, res) => {
  try {
    const imageFile = req.files?.file?.[0];

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: "Tattoo image is required",
      });
    }

    // ==========================================
    // STEP 1: CREATE UPLOAD SESSION
    // ==========================================

    const sessionResponse = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/${APP_ID}/uploads`,
      null,
      {
        params: {
          file_length: imageFile.size,
          file_type: imageFile.mimetype,
        },
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    const uploadSessionId = sessionResponse.data.id;

    console.log("UPLOAD SESSION:", uploadSessionId);


    // ==========================================
    // STEP 2: UPLOAD IMAGE TO SESSION
    // ==========================================

    const uploadResponse = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/${uploadSessionId}`,
      imageFile.buffer,
      {
        headers: {
          Authorization: `OAuth ${ACCESS_TOKEN}`,
          "Content-Type": imageFile.mimetype,
          "file_offset": "0",
        },
      }
    );

    console.log("META HEADER HANDLE:", uploadResponse.data);


    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      session_id: uploadSessionId,
      header_handle: uploadResponse.data.h,
    });

  } catch (error) {
    console.log(
      "META TEMPLATE IMAGE UPLOAD ERROR:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};

export const getWhatsAppTemplates = async (req, res) => {
  try {
    const url = `https://graph.facebook.com/${GRAPH_VERSION}/${WABA_ID}/message_templates`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });

    return res.status(200).json({
      data: response.data,
    });
  } catch (error) {
    console.log("GET TEMPLATE ERROR:", error.response?.data || error.message);
    return res.status(500).json({
      message: error.message,
    });
    throw error;
  }
};

export const getImageStatus = async (req, res) => {
  try {
    const sessionResponse = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/${APP_ID}/uploads`,
      null,
      {
        params: {
          file_length: imageFile.size,
          file_type: imageFile.mimetype,
        },
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      },
    );

    const uploadSessionId = sessionResponse.data.id;

    return res.status(200).json({
      id: uploadSessionId,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// testing whatsapp mesasage

export const sendMessage = async (req, res) => {
  try {
    const { customerPhone, customerName, tattoo, size, payment } = req.body;

    if (!customerPhone || !customerName || !tattoo || !size || !payment) {
      return res.status(400).json({
        message: "all fields are required",
      });
    }

    const response = await sendTattooSessionConfirmation({
      customerPhone,
      customerName,
      tattoo,
      size,
      payment,
    });

    console.log("SUCCESS:", response.data);

    if (response.success) {
      return res.status(200).json({
        message: "message sent successfully",
        data: response.data,
      });
    } else {
      return res.status(500).json({
        message: "message sent successfully",
        data: response.message,
      });
    }
  } catch (error) {
    console.log(
      "WHATSAPP ERROR:",
      JSON.stringify(error.response?.data || error.message, null, 2),
    );

    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.error?.message || error.message,
      error: error.response?.data?.error || null,
    });
  }
};
