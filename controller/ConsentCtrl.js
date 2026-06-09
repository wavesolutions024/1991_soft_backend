import dotenv from "dotenv";
import { consent } from "../class/Class.js";
import { addConsent, editConsent } from "../services/consent.js";
import { database } from "../db/database.js";
import { put } from "@vercel/blob";
dotenv.config();

export const addConsentCtrl = async (req, res) => {
  try {

    
    const payload = JSON.parse(req.body.consent);
    const idProof = req?.files?.idproof?.[0] || null;
    const signature = req?.files?.signature?.[0] || null;

    let idProofBlob;
    if (idProof) {
      idProofBlob = await put(idProof.originalname, idProof.buffer, {
        access: "public",
        contentType: idProof.mimetype,
      });
    }

    let signatureBlob;
    if (signature) {
      signatureBlob = await put(signature.originalname, signature.buffer, {
        access: "public",
        contentType: signature.mimetype,
      });
    }

    const consentData = new consent({
      clientId: payload.clientId,
      idProofType: payload.idProofType,
      idProofNumber: payload.idProofNumber,
      idProofImage: idProofBlob?.file ?? null,
      signature: signatureBlob?.file ?? null,
    });

    console.log(idProofBlob?.file);
    console.log(signatureBlob?.file);

    console.log(consentData)

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
    console.log(error)
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

    const [existingConsentRows] = await database.query(
      "SELECT idProofImage, signature FROM consent WHERE id = ?",
      [id],
    );

    const oldIdProofImage = existingConsentRows?.[0]?.idProofImage ?? null;
    const oldSignature = existingConsentRows?.[0]?.signature ?? null;

    const idProof = req.files?.idproof?.[0] || null;
    const signature = req.files?.signature?.[0] || null;

    // Upload new files to Vercel Blob when provided
    let newIdProofUrl = null;
    if (idProof) {
      const uploaded = await put(idProof.originalname, idProof.buffer, {
        access: "public",
        contentType: idProof.mimetype,
      });
      newIdProofUrl = uploaded?.file ?? null;
    }

    let newSignatureUrl = null;
    if (signature) {
      const uploaded = await put(signature.originalname, signature.buffer, {
        access: "public",
        contentType: signature.mimetype,
      });
      newSignatureUrl = uploaded?.file ?? null;
    }

    const finalIdProof = newIdProofUrl || payload.idProofImage || oldIdProofImage;
    const finalSignature = newSignatureUrl || payload.signature || oldSignature;

    const response = await editConsent(id, {
      ...payload,
      idProofImage: finalIdProof,
      signature: finalSignature,
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
