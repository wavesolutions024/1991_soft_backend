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

export const editConsent = async (id, payload) => {
  try {
    const query = `UPDATE consent SET clientId=?, idProofType=?, idProofNumber=?, idProofImage=?, signature=? WHERE id=?`;
    const values = [
      payload.clientId,
      payload.idProofType,
      payload.idProofNumber,
      payload.idProofImage,
      payload.signature,
      id,
    ];

    const [response] = await database.query(query, values);

    if (response.affectedRows === 0) {
      return {
        success: false,
        message: "Consent form not found",
      };
    }

    return {
      success: true,
      message: "Consent Form updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
