import dotenv from "dotenv";
import { consent } from "../class/Class.js";
import { addConsent, editConsent } from "../services/consent.js";
import { database } from "../db/database.js";
dotenv.config();

export const addConsentCtrl = async (req, res) => {
  try {
    const payload = JSON.parse(req.body.consent);
    const baseUrl = process.env.BASE_URL;

    const idProof = req.files?.idproof?.[0];

    const idprooFile = idProof ? `${baseUrl}/${idProof.filename}` : null;

    const signature = req.files?.signature?.[0];
    const signatureFile = signature ? `${baseUrl}/${signature.filename}` : null;

    const consentData = new consent({
      clientId: payload.clientId,
      idProofType: payload.idProofType,
      idProofNumber: payload.idProofNumber,
      idProofImage: idprooFile,
      signature: signatureFile,
    });

    const response = await addConsent(consentData);
    const pdata = JSON.stringify(payload);
    if (response.success) {
      await database.query(
        `INSERT INTO logs (user,service,action,tableNames) VALUES (?,?,?,?)`,
        [payload.username, "Consent", "add", pdata],
      );
      return res.status(200).json({
        message: response.message,
      });
    } else {
      return res.status(500).json({
        message: response.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const editConsentCtrl = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        message: "id is required",
      });
    }

    const payload = JSON.parse(req.body.consent || "{}");
    const baseUrl = process.env.BASE_URL;

    const [existingConsent] = await database.query(
      "SELECT idProofImage, signature FROM consent WHERE id = ?",
      [id],
    );

    const oldIdProofImage = existingConsent?.[0]?.idProofImage ?? null;
    const oldSignature = existingConsent?.[0]?.signature ?? null;

    const idProof = req.files?.idproof?.[0];
    const idProofImage = idProof
      ? `${baseUrl}/${idProof.filename}`
      : payload.idProofImage || oldIdProofImage;

    const signature = req.files?.signature?.[0];
    const signatureFile = signature
      ? `${baseUrl}/${signature.filename}`
      : payload.signature || oldSignature;

    const response = await editConsent(id, {
      ...payload,
      idProofImage,
      signature: signatureFile,
    });
    const pdata = JSON.stringify(payload);
    if (response.success) {
      await database.query(
        `INSERT INTO logs (user,service,action,tableNames) VALUES (?,?,?,?)`,
        [payload.username, "Consent", "edit", pdata],
      );
      return res.status(200).json({
        message: response.message,
      });
    }

    return res.status(400).json({
      message: response.message,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllConsent = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const size = Math.max(parseInt(req.query.size, 10) || 10, 1);
    const offset = (page - 1) * size;

    const [response] = await database.query(
      `SELECT cc.*, cl.name
       FROM consent AS cc
       LEFT JOIN clients AS cl ON cc.clientId = cl.id
       ORDER BY cc.id DESC
       LIMIT ? OFFSET ?`,
      [size, offset],
    );

    const [[{ total }]] = await database.query(
      "SELECT COUNT(*) AS total FROM consent",
    );

    return res.status(200).json({
      message: "success",
      data: response,
      pagination: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getConsentById = async (req, res) => {
  try {
    const { id } = req.query;

    const [response] = await database.query(
      `SELECT * FROM consent WHERE id = ?`,
      [id],
    );

    return res.status(200).json({
      message: "success",
      data: response[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


