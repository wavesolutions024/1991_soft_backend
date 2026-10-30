import { database } from "../db/database.js";

const normalizePhone = (phone) => String(phone ?? "").replace(/\D/g, "");

const findClientByPhone = async (phone) => {
  const digits = normalizePhone(phone);
  if (digits.length < 10) return null;

  const [rows] = await database.query(
    `SELECT name, franchiesCode FROM clients WHERE RIGHT(mobileno, 10) = ? ORDER BY id DESC LIMIT 1`,
    [digits.slice(-10)],
  );

  return rows[0] ?? null;
};

export const recordOutgoingWhatsAppMessage = async ({
  franchiesCode,
  customerPhone,
  customerName,
  message,
  messageId,
}) => {
  try {
    const client =
      !franchiesCode || !customerName
        ? await findClientByPhone(customerPhone)
        : null;
    const phone = normalizePhone(customerPhone);

    await database.query(
      `INSERT INTO whatsapp_message_logs
        (franchiesCode, clientName, phoneNumber, direction, message, status, wamid)
       VALUES (?, ?, ?, 'sent', ?, 'sent', ?)`,
      [
        franchiesCode ?? client?.franchiesCode ?? null,
        customerName || client?.name || phone,
        phone,
        message,
        messageId ?? null,
      ],
    );
  } catch (error) {
    console.error("Failed to save outgoing WhatsApp log:", error.message);
  }
};

export const recordIncomingWhatsAppMessage = async ({
  customerPhone,
  customerName,
  message,
  messageId,
}) => {
  const phone = normalizePhone(customerPhone);
  const client = await findClientByPhone(phone);

  await database.query(
    `INSERT INTO whatsapp_message_logs
      (franchiesCode, clientName, phoneNumber, direction, message, status, wamid)
     VALUES (?, ?, ?, 'reply', ?, 'received', ?)
     ON DUPLICATE KEY UPDATE wamid = VALUES(wamid)`,
    [
      client?.franchiesCode ?? null,
      client?.name || customerName || phone,
      phone,
      message,
      messageId ?? null,
    ],
  );
};

export const updateWhatsAppMessageStatus = async ({
  messageId,
  status,
  error,
}) => {
  await database.query(
    `UPDATE whatsapp_message_logs
     SET status = ?, error = ?
     WHERE wamid = ?`,
    [status, error ?? null, messageId],
  );
};

export const getWhatsAppLogs = async ({ franchiesCode, page, size }) => {
  const offset = (page - 1) * size;
  const [rows] = await database.query(
    `SELECT id, clientName, phoneNumber, direction, message, status, timestamp
     FROM whatsapp_message_logs
     WHERE franchiesCode = ?
     ORDER BY timestamp DESC, id DESC
     LIMIT ? OFFSET ?`,
    [franchiesCode, size, offset],
  );
  const [[{ total }]] = await database.query(
    `SELECT COUNT(*) AS total
     FROM whatsapp_message_logs
     WHERE franchiesCode = ?`,
    [franchiesCode],
  );

  return {
    data: rows,
    pagination: {
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
    },
  };
};
