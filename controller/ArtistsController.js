import { artists } from "../class/Class.js";
import { database } from "../db/database.js";
import { addArtistService } from "../services/artistService.js";
import bcrypt from "bcrypt";

const passRound = 10;
export const addArtist = async (req, res) => {
  try {
    const { artistName, artistNumber, username, password } = req.body;
    const id = req.user.franchiesId;

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

export const deleteArtist = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        message: "id is required",
      });
    }

    const [response] = await database.query(
      `DELETE FROM tattooArtists WHERE id = ?`,
      [id],
    );

    return res.status(200).json({
      message: "Artists delete successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getArtistById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({
        message: "Id is requried",
      });
    }

    const [response] = await database.query(
      `SELECT * FROM  tattooArtists WHERE id = ?`,
      [id],
    );

    const data = response[0];

    if (data) {
      return res.status(200).json({
        message: "success",
        data: data,
      });
    } else {
      return res.status(400).json({
        message: "data not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const editArtist = async (req, res) => {
  try {
    const { id } = req.query;
    const { artistName, artistNumber, username, password } = req.body;

    const [existUser] = await database.query(
      `SELECT password FROM tattooArtists WHERE id = ?`,
      [id],
    );

    const exitpassword = existUser[0].password;

    if (password === "") {
      await database.query(
        `UPDATE tattooArtists SET  artistName = ?, artistNumber = ?,username = ?,password = ? WHERE id = ?`,
        [artistName, artistNumber, username, exitpassword,id],
      );
    } else {
      const hashPassword = await bcrypt.hash(password, passRound);
      await database.query(
        `UPDATE tattooArtists SET  artistName = ?, artistNumber=?,username=?,password=? WHERE id = ?`,
        [artistName, artistNumber, username, hashPassword,id],
      );
    }

    return res.status(200).json({
      message: "update successfully",
    });
  } catch (error) {
   
    return res.status(500).json({
      message: error.message,
    });
  }
};
