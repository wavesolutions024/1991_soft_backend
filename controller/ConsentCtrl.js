import dotenv from "dotenv";
import { consent } from "../class/Class.js";
import { addConsent } from "../services/consent.js";
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
      idProof: idprooFile,
      signature: signatureFile,
    });

    const response = await addConsent(consentData);

    if (response.success) {
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

export const getAllConsent = async (req, res) => {
  try {
    const [response] = await database.query(
      "SELECT  cc.* ,cl.name FROM consent AS cc LEFT JOIN clients AS cl ON cc.clientId = cl.id",
    );

    return res.status(200).json({
      message: "success",
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
