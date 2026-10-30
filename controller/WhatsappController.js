import dotenv from "dotenv";
import {
  createWhatsAppTemplate,
  getWhatsappAnyaltics,
  sendBulkData,
  sendTattooSessionConfirmation,
} from "../services/WhatsappService.js";
import {
  getWhatsAppLogs as fetchWhatsAppLogs,
  recordIncomingWhatsAppMessage,
  updateWhatsAppMessageStatus,
} from "../services/whatsappLogsService.js";
import axios from "axios";
dotenv.config();

const wpToken = process.env.WHATSAPP_VERIFY_TOKEN;
const GRAPH_VERSION = process.env.META_GRAPH_VERSION;
import FormData from "form-data";
import { database } from "../db/database.js";
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
  try {
    const body = req.body;

    if (body?.object !== "whatsapp_business_account") {
      return res.sendStatus(200);
    }

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== "messages") continue;

        const value = change.value || {};

        for (const message of value.messages || []) {
          const contact = (value.contacts || []).find(
            (item) => item.wa_id === message.from,
          );
          const messageText =
            message.text?.body ??
            message.image?.caption ??
            message.video?.caption ??
            message.document?.caption ??
            message.interactive?.button_reply?.title ??
            message.interactive?.list_reply?.title ??
            message.button?.text ??
            message.reaction?.emoji ??
            `[${message.type || "WhatsApp"} message]`;

          await recordIncomingWhatsAppMessage({
            customerPhone: message.from,
            customerName: contact?.profile?.name,
            message: String(messageText),
            messageId: message.id,
          });
        }

        for (const status of value.statuses || []) {
          console.log("WHATSAPP DELIVERY UPDATE", {
            wamid: status.id,
            status: status.status,
            recipient: status.recipient_id,
            timestamp: status.timestamp,
            errors: status.errors || [],
          });

          await updateWhatsAppMessageStatus({
            messageId: status.id,
            status: status.status,
            error: status.errors?.length
              ? status.errors
                  .map((item) => item.title || item.message || item.code)
                  .join("; ")
              : null,
          });
        }
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return res.sendStatus(500);
  }
};

export const getWhatsAppLogs = async (req, res) => {
  try {
    const franchiesCode = req.user?.franchiesId;
    if (!franchiesCode) {
      return res.status(401).json({ message: "Franchise ID not found" });
    }

    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const size = Math.min(
      Math.max(Number.parseInt(req.query.size, 10) || 20, 1),
      100,
    );
    const result = await fetchWhatsAppLogs({ franchiesCode, page, size });

    return res.status(200).json({
      message: "success",
      ...result,
    });
  } catch (error) {
    console.error("WhatsApp logs controller error:", error);
    return res.status(500).json({ message: error.message });
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
      },
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
          file_offset: "0",
        },
      },
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
      error.response?.data || error.message,
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
      franchiesCode: req.user?.franchiesId,
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



// send appoinment message
// export const sendAppoinmentMessage = async (req, res) => {
//   try {
//     const { name, date, tattoo, size, payment } = req.body;

//     if (!customerPhone || !customerName || !tattoo || !size || !payment) {
//       return res.status(400).json({
//         message: "all fields are required",
//       });
//     }

//     const response = await sendTattooSessionConfirmation({
//       customerPhone,
//       customerName,
//       tattoo,
//       size,
//       payment,
//     });

//     console.log("SUCCESS:", response.data);

//     if (response.success) {
//       return res.status(200).json({
//         message: "message sent successfully",
//         data: response.data,
//       });
//     } else {
//       return res.status(500).json({
//         message: "message sent successfully",
//         data: response.message,
//       });
//     }
//   } catch (error) {
//     console.log(
//       "WHATSAPP ERROR:",
//       JSON.stringify(error.response?.data || error.message, null, 2),
//     );

//     return res.status(error.response?.status || 500).json({
//       success: false,
//       message: error.response?.data?.error?.message || error.message,
//       error: error.response?.data?.error || null,
//     });
//   }
// };

const getTodayIST = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
};

export const whatsappAnalyticsController = async (req, res) => {
  try {
    let { date } = req.query;

    // Date not passed → today's date
    if (!date) {
      date = getTodayIST();
    }

    // Basic date validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Date must be YYYY-MM-DD",
      });
    }

    const result = await getWhatsappAnyaltics(date);

    return res.status(200).json({
      success: true,
      date,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    console.error("WhatsApp Analytics Controller:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch WhatsApp analytics",
      error: error.message,
    });
  }
};


export const sendBulkWhatsappMessage = async (req, res) => {
  try {
    const [dbresponse] = await database.query(
      `SELECT * FROM bulkData`
    );

    const results = [];

    for (const arr of dbresponse) {
      const response = await sendBulkData({
        customerPhone: arr.number,
        customerName: arr.name,
        franchiesCode: req.user?.franchiesId,
      });

      results.push({
        name: arr.name,
        phone: arr.number,
        success: response.success,
        messageId: response.data?.messages?.[0]?.id || null,
        error: response.success ? null : response.message,
      });
    }

    const successCount = results.filter(
      (item) => item.success
    ).length;

    const failedCount = results.length - successCount;

    return res.status(200).json({
      success: true,
      message: "Bulk WhatsApp sending completed",
      total: results.length,
      successful: successCount,
      failed: failedCount,
      results,
    });
  } catch (error) {
    console.error("WHATSAPP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
