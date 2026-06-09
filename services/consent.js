import { del } from "@vercel/blob";
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
    console.log(payload, "userData?.username")
      
    const [[oldData]] = await database.query(`SELECT idProofImage,signature FROM consent WHERE id=?`,[id]);

    const idProofImage = oldData?.idProofImage;
    const signature = oldData?.signature

        // Delete old signature blob only if a new different signature URL is provided
        if (signature && payload.signature && payload.signature !== signature) {
          try {
            const pathname = new URL(signature).pathname;
            await del(pathname);
          } catch (err) {
            console.log("Blob delete failed:", err.message);
          }
        }

        // Delete old id proof blob only if a new different idProofImage URL is provided
        if (idProofImage && payload.idProofImage && payload.idProofImage !== idProofImage) {
          try {
            const pathname = new URL(idProofImage).pathname;
            await del(pathname);
          } catch (err) {
            console.log("Blob delete failed:", err.message);
          }
        }

    const signatureFinal = payload.signature || signature
    const idProofFinal = payload.idProofImage || idProofImage


    const query = `UPDATE consent SET clientId=?, idProofType=?, idProofNumber=?, idProofImage=?, signature=? WHERE id=?`;
    const values = [
      payload.clientId,
      payload.idProofType,
      payload.idProofNumber,
      idProofFinal,
      signatureFinal,
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
