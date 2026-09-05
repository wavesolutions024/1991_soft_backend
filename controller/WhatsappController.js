import dotenv from "dotenv";
import {
  createWhatsAppTemplate,
  sendTattooSessionConfirmation,
} from "../services/WhatsappService.js";
import axios from "axios";
dotenv.config();

const wpToken = process.env.WHATSAPP_VERIFY_TOKEN;
const GRAPH_VERSION = process.env.META_GRAPH_VERSION;

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

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
  try {
    console.log(
      "WhatsApp webhook received:",
      JSON.stringify(req.body, null, 2)
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

// testing whatsapp mesasage

export const sendMessage = async (req, res) => {
  try {
    const {
      customerPhone,
      customerName,
      tattoo,
      size,
      payment,
    } = req.body;

    if (
      !customerPhone ||
      !customerName ||
      !tattoo ||
      !size ||
      !payment
    ) {
      return res.status(400).json({
        message: "all fields are required",
      });
    }

    const phone = String(customerPhone).replace(/\D/g, "");

    const payload = {
      messaging_product: "whatsapp",
      to: phone, // दुसरा WhatsApp number वापरून test कर
      type: "template",
      template: {
        name: "hello_world",
        language: {
          code: "en_US",
        },
      },
    };

    // console.log(
    //   "WHATSAPP PAYLOAD:",
    //   JSON.stringify(payload, null, 2)
    // );

    const response = await axios.post(
      `https://graph.facebook.com/v26.0/${PHONE_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("SUCCESS:", response.data);

    return res.status(200).json({
      message: "message sent successfully",
      data: response.data,
    });

  } catch (error) {
    console.log(
      "WHATSAPP ERROR:",
      JSON.stringify(
        error.response?.data || error.message,
        null,
        2
      )
    );

    return res.status(
      error.response?.status || 500
    ).json({
      success: false,
      message:
        error.response?.data?.error?.message ||
        error.message,
      error: error.response?.data?.error || null,
    });
  }
};