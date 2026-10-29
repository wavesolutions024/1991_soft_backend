import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import { database } from "../db/database.js";
import { WHATSAPP_TEMPLATES } from "../utils/WhatsappTemplate.js";
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
      name: "offer_template1",
      language: "en_US",

      category: "UTILITY",

      components: [
        {
          type: "HEADER",
          format: "IMAGE",
          example: {
            header_handle: [
              "4::aW1hZ2UvanBlZw==:ARbFshef1-1ttOkgENZt-uyIqdetPVAKgYOugnPoF5m4gIQVtw_xMymO_7EzEZgqnOjeio_khCJBMSSUanNNof8UEK2HK7pM9_BwGf7BcNhLtA:e:1793362220:4507499142871543:61594115907835:ARZDvYk0UrDIUfDLGC4",
            ],
          },
        },

        {
          type: "BODY",
          text: `Hello {{1}},

        💥 TATTOO FESTIVAL AT BANER! 💥

        Kuch naya try karna hai ? Express yourself with ink at 1991 Tattoo Studio! 🎨✨

       🔥 EXCLUSIVE LIMITED OFFER:
       📌 Full Sleeve Tattoo – FLAT 50% OFF
       📌 Half Sleeve Tattoo – FLAT 40% OFF
       📌 Body Piercing – FLAT 40% OFF
       ⚡ Upto 50% OFF on Custom Designs!

       ⏳  Get Free Consultation & Aftercare Guide!

       📍 Location: Baner 🗾 :https://maps.app.goo.gl/68YjtnccZhTg1Scz6
       📷 Our Work: https://www.instagram.com/1991tattoos
       📲 Book Your Slot: 9881742686

       Thank you,
       1991 Tattoo Studio`,

          example: {
            body_text: [["Prajot Surey"]],
          },
        },
        {
          type: "FOOTER",
          text: "1991 Tattoo Studio",
        },

        {
          type: "BUTTONS",
          buttons: [
            {
              type: "PHONE_NUMBER",
              text: "Call Us",
              phone_number: "+919881742686",
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

export const sendTattooAppoinmentConfirmation = async ({
  franchiesCode,
  name,
  date,
  time,
  advance,
  customerPhone,
}) => {
  try {
    const phone = String(customerPhone).replace(/\D/g, "");
    const template =
      franchiesCode === 1
        ? "appointment_confirm_1991"
        : "appointment_confirm_inkfly";

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
                text: String(name),
              },
              {
                type: "text",
                text: String(date),
              },
              {
                type: "text",
                text: String(time),
              },
              {
                type: "text",
                text: String(advance),
              },
            ],
          },
        ],
      },
    };

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

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message,
      error: error.response?.data,
    };
  }
};

// Send bulk birthday notification
export const sendBirthdayNotification = async (numbers) => {
  try {
    for (const a of numbers) {
      const phone = String(a.num || "").replace(/\D/g, "");

      if (!phone) {
        console.log("Invalid phone number:", a.num);
        continue;
      }

      const template =
        a.franchiesCode === 1 ? "birthdaywish_1991" : "birthdaywish_inkfly";

      const tattooImageUrl =
        a.franchiesCode === 1
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
                  text: String(a.name),
                },
              ],
            },
          ],
        },
      };

      try {
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

        console.log(`Birthday notification sent to ${phone}`);
        console.log(response.data);
      } catch (error) {
        console.log(
          `Failed to send birthday notification to ${phone}`,
          error.response?.data || error.message,
        );
      }
    }
  } catch (error) {
    console.log("Bulk birthday notification error:", error);
  }
};

// send employee reg message

export const sendempregConfirmation = async ({
  franchiesCode,
  employyname,
  empId,
  role,
  salary,
  aphone,
}) => {
  try {
    // console.log("PHONE_NUMBER_ID:", PHONE_NUMBER_ID);
    // console.log("CUSTOMER PHONE:", customerPhone);
    // console.log("TEMPLATE:", "tattoo_session_confirmation_1991");
    // console.log("LANGUAGE:", "en_US");

    const phone = String(aphone).replace(/\D/g, "");

    const template =
      franchiesCode === 1
        ? "artist_registration_1991_updated"
        : "artist_registration_inkfly_test";

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
            type: "body",
            parameters: [
              {
                type: "text",
                text: String(employyname),
              },
              {
                type: "text",
                text: String(empId),
              },
              {
                type: "text",
                text: String(role),
              },
              {
                type: "text",
                text: String(salary),
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

    console.log("WhatsApp sent:", response.data);

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

// send bulk data messsages

export const sendBulkData = async ({ customerPhone, customerName }) => {
  try {
    const phone = String(customerPhone).replace(/\D/g, "");

    const payload = {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: "offer_template1",
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
                  link: "https://landing.1991tattoo.com/assets/offer.jpeg",
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
            ],
          },
        ],
      },
    };

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

    return {
      success: true,
      phone,
      data: response.data,
    };
  } catch (error) {
    console.error(
      "WhatsApp Error:",
      JSON.stringify(error.response?.data || error.message, null, 2)
    );

    return {
      success: false,
      phone: String(customerPhone),
      message:
        error.response?.data?.error?.message || error.message,
    };
  }
};


// --------------------------------------------------
// Check if date is recent
// --------------------------------------------------

export const isRecentDate = (dateString, days = 3) => {
  const requestedDate = new Date(`${dateString}T00:00:00`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const difference = (today - requestedDate) / (1000 * 60 * 60 * 24);

  return difference >= 0 && difference <= days;
};

export const whatsappAnyalticsdb = async (date) => {
  try {
    const [rows] = await database.query(
      `
    SELECT
      analytics_date,
      template_name,
      sent,
      delivered,
      read_count,
      failed,
      updated_at
    FROM whatsapp_daily_analytics
    WHERE analytics_date = ?
    ORDER BY template_name
    `,
      [date],
    );

    return rows;
  } catch (error) {
    return error;
  }
};

export const saveUpdateData = async (data) => {
  try {
    for (const item of data) {
      await database.query(
        `
      INSERT INTO whatsapp_daily_analytics
      (
        analytics_date,
        template_name,
        sent,
        delivered,
        read_count,
        failed
      )
      VALUES (?, ?, ?, ?, ?, ?)

      ON DUPLICATE KEY UPDATE
        sent = VALUES(sent),
        delivered = VALUES(delivered),
        read_count = VALUES(read_count),
        failed = VALUES(failed),
        updated_at = CURRENT_TIMESTAMP
      `,
        [
          item.date,
          item.template_name,
          item.sent || 0,
          item.delivered || 0,
          item.read || 0,
          item.failed || 0,
        ],
      );
    }

    return true;
  } catch (error) {
    return error;
  }
};

export const getAnalyticsFromMeta = async (date) => {
  try {
    const templateResponse = await axios.get(
      `https://graph.facebook.com/${GRAPH_VERSION}/${WABA_ID}/message_templates`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
        params: {
          fields: "id,name,status",
          limit: 100,
        },
      },
    );

    const templates = templateResponse.data?.data || [];

    // 2. Find IDs using template names
    const selectedTemplates = templates.filter((template) =>
      WHATSAPP_TEMPLATES.includes(template.name),
    );

    if (!selectedTemplates.length) {
      throw new Error("No matching WhatsApp templates found");
    }

    // 3. Automatically get IDs
    const templateIds = selectedTemplates.map((template) => template.id);
    // Meta analytics endpoint इथे verified endpoint प्रमाणे ठेवायचा आहे
    const url = `https://graph.facebook.com/${GRAPH_VERSION}/${WABA_ID}/template_analytics`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      params: {
        start: date,
        end: date,
        granularity: "DAILY",
        template_ids: templateIds.join(","),
        metric_types: "SENT,DELIVERED,READ",
        use_waba_timezone: true,
        product_type: "CLOUD_API",
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Meta Analytics Error:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const getWhatsappAnyaltics = async (date) => {
  try {
    const recent = isRecentDate(date, 3);
    if (!recent) {
      const dbData = await whatsappAnyalticsdb(date);

      console.log(dbData, "dbData");

      return {
        source: "database",
        date,
        data: dbData,
      };
    }

    const metaData = await getAnalyticsFromMeta(date);

    const formattedData = formatMetaAnalytics(metaData, date);

    // Save latest snapshot
    await saveAnalyticsToDB(formattedData);

    return {
      source: "meta",
      date,
      data: formattedData,
    };
  } catch (error) {
    return error;
  }
};

const formatMetaAnalytics = (metaData, date) => {
  // Meta च्या actual response structure नुसार
  // हा भाग बदलायचा आहे.

  return WHATSAPP_TEMPLATES.map((template) => {
    return {
      date,
      template_name: template,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
    };
  });
};
