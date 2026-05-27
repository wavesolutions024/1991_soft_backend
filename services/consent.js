import { database } from "../db/database.js";

export const addConsent = async (payload) => {
  try {
    const query = `INSERT INTO consent (clientId,idProofType,idProofNumber,idProofImage,signature) VALUES (?,?,?,?,?)`;
    
    const values = [
      payload.clientId,
      payload.idProofType,
      payload.idProofNumber,
      payload.idProofImage,
      payload.signature,
    ];

    await database.query(query, values);

    return {
      success: true,
      message: "Consent Form added Successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
