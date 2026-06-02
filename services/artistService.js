import { database } from "../db/database.js";
import bcrypt from "bcrypt"

const passLength = 10
export const addArtistService = async (payload, franchies_code) => {
  try {
    const hashPassword =  await bcrypt.hash(payload.password,passLength)
    const query = `INSERT INTO tattooArtists (franchiesCode,artistCode,artistName,artistNumber,username,password) VALUES (?,?,?,?,?,?)`;
    const values = [
      franchies_code,
      payload.artistCode,
      payload.artistName,
      payload.artistNumber,
      payload.username,
      hashPassword,
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
