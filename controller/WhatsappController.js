import dotenv from "dotenv";
dotenv.config();

const wpToken = process.env.WHATSAPP_VERIFY_TOKEN;

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

export const postWhatsappWebhook = (req,res) => {
  try {
    console.log(
      "WhatsApp webhook received:",
      JSON.stringify(req.body, null, 2),
    );

    // Always respond quickly to Meta
    res.sendStatus(200);

    const body = req.body;

    if (body.object !== "whatsapp_business_account") {
      return;
    }

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== "messages") {
          continue;
        }

        const value = change.value;

        // ------------------------------------------------
        // Incoming messages
        // ------------------------------------------------

        if (value.messages) {
          for (const message of value.messages) {
            const phoneNumber = message.from;
            const messageId = message.id;
            const messageType = message.type;

            console.log("Message ID:", messageId);
            console.log("From:", phoneNumber);
            console.log("Type:", messageType);

            if (messageType === "text") {
              const text = message.text?.body || "";

              console.log("Message:", text);

              // Your business logic goes here
              // Example:
              // await handleIncomingMessage(phoneNumber, text);
            }
          }
        }

        // ------------------------------------------------
        // Message status updates
        // ------------------------------------------------

        if (value.statuses) {
          for (const status of value.statuses) {
            console.log("Message status:", {
              id: status.id,
              status: status.status,
              recipient: status.recipient_id,
            });

            // statuses:
            // sent
            // delivered
            // read
            // failed
          }
        }
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
  }
};
