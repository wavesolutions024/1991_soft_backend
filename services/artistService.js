import { database } from "../db/database.js";

export const addArtist = async (payload, franchies_code) => {
  try {
    const query = `INSERT INTO tattooArtists (franchiesCode,artistName,artistNumber,username,password) VALUES (?,?,?,?,?)`;
    const values = [
      franchies_code,
      payload.artistName,
      payload.artistNumber,
      payload.username,
      payload.password,
    ];

    const [response] = await database.query(query, values);

    return {
      success: true,
      id: response.insertId,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
