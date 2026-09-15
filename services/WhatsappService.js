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
      name: "birthdaywish_inkfly",
      language: "en_US",

      category: "UTILITY",

      components: [
        {
          type: "HEADER",
          format: "IMAGE",
          example: {
            header_handle: [
              "4::aW1hZ2UvanBlZw==:ARY4aI1N86OIrY2eMYGZwtrzu8rOT5JWUCvfPQCUkz0fmLdC3NQ4-M08HLefk0rg7GGsfsE0M4jpcBxxQNgIMEZYNXTvRdszfpPfBDczbGHHQw:e:1789820186:4507499142871543:61594115907835:ARazNSAV0sMOVm9o4ko",
            ],
          },
        },

        {
          type: "BODY",
          text: `Hello {{1}},

         🎉 Happy Birthday from InkFly Tattoo Studio! 🎂🖤

         Wishing you an amazing birthday filled with happiness, good vibes, and unforgettable moments. ✨

         🎁 Birthday Special Offer

         As a birthday gift from InkFly Tattoo Studio, enjoy
         🔥 50% OFF on your tattoo!

         This special offer is exclusively for you and is valid for your birthday celebration.

         📍 Studio Location: https://maps.app.goo.gl/B6VyvioZQy73UMrq7
         📸 Instagram: https://www.instagram.com/inkflytattoopune
         📞 Contact: +91 96070 09494

         Thank you,
         InkFly Tattoo Studio`,

          example: {
            body_text: [["Prajot Surey"]],
          },
        },

        {
          type: "FOOTER",
          text: "InkFly Tattoo Studio",
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
