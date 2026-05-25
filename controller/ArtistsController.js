import { artists } from "../class/Class.js";
import { database } from "../db/database.js";
import { addArtistService } from "../services/artistService.js";

export const addArtist = async (req, res) => {
  try {
    const { artistName, artistNumber, username, password } = req.body;
    const id = req.user.id;

    if (!artistName) {
      return res.status(400).json({
        message: "Artist Name Is Required",
      });
    } else if (!artistNumber) {
      return res.status(400).json({
        message: "Artist Number Is Required",
      });
    } else if (!username) {
      return res.status(400).json({
        message: "Username Is Required",
      });
    } else if (!password) {
      return res.status(400).json({
        message: "Password Is Required",
      });
    }

    const [extsRes] = await database.query(
      `SELECT username FROM tattooArtists WHERE username = ?`,
      [username],
    );

    if (extsRes.length !== 0) {
      return res.status(400).json({
        message: "Username already registed",
      });
    }

    const model = new artists({ artistName, artistNumber, username, password });

    const response = await addArtistService(model, id);

    if (response.success) {
      return res.status(200).json({
        message: "Artist add successfully",
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

export const getAllArtists = async (req, res) => {
  try {
    const [response] = await database.query(
      `SELECT id,artistName,artistNumber,username,role FROM tattooArtists`,
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
