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
      name: "tattoo_session_confirmation_inkfly",
      language: "en_US",

      category: "UTILITY",

      components: [
        {
          type: "HEADER",
          format: "IMAGE",
          example: {
            header_handle: [
              "4::aW1hZ2UvanBlZw==:ARZSwo-12CnKS1VMkcD0kjf4popJ5i00ZjFkKy98n-UwNerN9iENGMkuX7JKVgEpCyoDLf9ZTsR7N1E9ARJhmhXHXaFcmLV8BdZ9sqA9GmJBFA:e:1789375250:4507499142871543:61594115907835:ARZhHdTjQ82cXNnnWH8",
            ],
          },
        },

        {
          type: "BODY",
          text: `Hello {{1}},

  Thank you for choosing Inkfly Tattoo Studio.

  Tattoo Session Summary

  👤 Name: {{1}}
  🖋️ Tattoo: {{2}}
  📏 Size: {{3}}
  💳 Payment: {{4}}

  📍 Studio Location: https://maps.app.goo.gl/B6VyvioZQy73UMrq7

  ⭐ Google Review: https://share.google/Vn3308xlKli9A4LUu

  📸 Instagram: https://www.instagram.com/inkflytattoopune

  Tattoo Care: https://www.inkflytattoo.com/tattoo-aftercare

  📞 Contact: +91 96070 09494

  Thank you,
  Inkfly Tattoo Studio`,

          example: {
            body_text: [
              ["Prajot Surey", "Scripted", "2 Inch", "Received (UPI)"],
            ],
          },
        },

        {
          type: "FOOTER",
          text: "Inkfly Tattoo Studio",
        },

        {
          type: "BUTTONS",
          buttons: [
            {
              type: "PHONE_NUMBER",
              text: "Call Us",
              phone_number: "+919607009494",
            },
          ],
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
  franchiesCode,
  customerPhone,
  customerName,
  tattoo,
  size,
  payment,
}) => {
  try {
    // console.log("PHONE_NUMBER_ID:", PHONE_NUMBER_ID);
    // console.log("CUSTOMER PHONE:", customerPhone);
    // console.log("TEMPLATE:", "tattoo_session_confirmation_1991");
    // console.log("LANGUAGE:", "en_US");

    const phone = String(customerPhone).replace(/\D/g, "");

    const template =
      franchiesCode === 1
        ? "tattoo_session_confirmation_1991"
        : "tattoo_session_confirmation_inkfly";

    const tattooImageUrl =
      franchiesCode === 1
        ? "https://landing.1991tattoo.com/assets/tattoo2-C4f0QS2g.jpeg"
        : "https://landing.inkflytattoo.com/assets/imag1-DE-6_4RU.png";

    const payload = {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: template,
        language: {
          code: "en_US",
        },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "image",
                image: {
                  link: tattooImageUrl,
                },
              },
            ],
          },
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

    // console.log("WHATSAPP PAYLOAD:", JSON.stringify(payload, null, 2));

    const response = await axios.post(
      `https://graph.facebook.com/v26.0/${PHONE_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    // console.log("WhatsApp sent:", response.data);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(
      "WhatsApp Error:",
      JSON.stringify(error.response?.data, null, 2),
    );

    return {
      success: false,
      message: error.response?.data?.error?.message || error.message,
      error: error.response?.data,
    };
  }
};
