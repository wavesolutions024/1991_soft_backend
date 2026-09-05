import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
const GRAPH_VERSION = process.env.META_GRAPH_VERSION;

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// ==========================================
// CREATE WHATSAPP MESSAGE TEMPLATE
// ==========================================

export const createWhatsAppTemplate = async () => {
  try {
    const url = `https://graph.facebook.com/${GRAPH_VERSION}/${WABA_ID}/message_templates`;

    const data = {
      name: "tattoo_session_confirmation",
      language: {
        code: "en_US",
      },

      components: [
        {
          type: "BODY",

          text: `Hello {{1}},

          Thank you for choosing 1991 Tattoo Studio.

          Tattoo Session Summary:
         🖋️ Tattoo: {{2}}
         📏 Size: {{3}}
         💳 Payment: {{4}}

         📍 Studio Location: https://maps.app.goo.gl/68YJtnccZhTg1Scz6
         📸 Instagram: https://www.instagram.com/1991tattoos

         Thank you,
         1991 Tattoo Studio`,

          example: {
            body_text: [
              ["Prajot Surey", "Scripted", "2 Inch", "Received (UPI)"],
            ],
          },
        },
      ],
    };

    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log("TEMPLATE CREATED:");
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.log("TEMPLATE ERROR:", error.response?.data || error.message);

    throw error;
  }
};

export const sendTattooSessionConfirmation = async ({
  customerPhone,
  customerName,
  tattoo,
  size,
  payment,
}) => {
  try {
    console.log("PHONE_NUMBER_ID:", PHONE_NUMBER_ID);
    console.log("CUSTOMER PHONE:", customerPhone);
    console.log("TEMPLATE:", "tattoo_session_confirmation");
    console.log("LANGUAGE:", "en_US");

    const phone = String(customerPhone).replace(/\D/g, "");

    const payload = {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: "tattoo_session_confirmation",
        language: {
          code: "en_US",
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: String(customerName),
              },
              {
                type: "text",
                text: String(tattoo),
              },
              {
                type: "text",
                text: String(size),
              },
              {
                type: "text",
                text: String(payment),
              },
            ],
          },
        ],
      },
    };

    console.log(
      "WHATSAPP PAYLOAD:",
      JSON.stringify(payload, null, 2)
    );

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

    console.log("WhatsApp sent:", response.data);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(
      "WhatsApp Error:",
      JSON.stringify(error.response?.data, null, 2)
    );

    return {
      success: false,
      message: error.response?.data?.error?.message || error.message,
      error: error.response?.data,
    };
  }
};
