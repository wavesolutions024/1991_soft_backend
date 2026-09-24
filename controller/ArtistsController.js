import { artists } from "../class/Class.js";
import { database } from "../db/database.js";
import { addArtistService } from "../services/artistService.js";
import bcrypt from "bcrypt";
import { sendempregConfirmation } from "../services/WhatsappService.js";

const passRound = 10;
export const addArtist = async (req, res) => {
  try {
    const { artistName, artistNumber, username, password, salary } = req.body;
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

    // generate artistCode like emp199101, emp199102 ...
    // prefix is kept as 'emp1991' to match requested format
    const prefix = `emp1991`;

    // find latest artistCode for this franchise with the same prefix
    const [latestRows] = await database.query(
      `SELECT artistCode FROM tattooArtists WHERE artistCode LIKE ? AND franchiesCode = ? ORDER BY id DESC LIMIT 1`,
      [`${prefix}%`, id],
    );

    let nextNumber = 1;
    if (latestRows.length > 0) {
      const latestCode = latestRows[0].artistCode || "";
      const suffixPart = latestCode.slice(prefix.length); // everything after "emp1991"
      const lastNum = parseInt(suffixPart, 10);
      if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }

    const suffix = String(nextNumber).padStart(2, "0");
    const artistCode = `${prefix}${suffix}`;

    const model = new artists({
      artistName,
      artistNumber,
      username,
      password,
      artistCode,
      salary,
    });

    const response = await addArtistService(model, id);

    if (response.success) {
      await sendempregConfirmation({
        franchiesCode: id,
        employyname: artistName,
        empId: artistCode,
        role: "Artist",
        salary: salary,
        aphone: artistNumber,
      });
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
    const franchiesCode = req.user.franchiesId;

    const [response] = await database.query(
      `SELECT id,artistName,artistNumber,username,role, salary FROM tattooArtists WHERE franchiesCode = ?`,
      [franchiesCode],
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
    const { artistName, artistNumber, username, password, salary } = req.body;

    const [existUser] = await database.query(
      `SELECT password,franchiesCode,artistCode FROM tattooArtists WHERE id = ?`,
      [id],
    );

    const exitpassword = existUser[0].password;
    const fId = existUser[0].franchiesCode;
    const artistCode = existUser[0].artistCode;

    if (password === "") {
      await database.query(
        `UPDATE tattooArtists SET  artistName = ?, artistNumber = ?,username = ?,password = ?,salary=? WHERE id = ?`,
        [artistName, artistNumber, username, exitpassword, salary, id],
      );
    } else {
      const hashPassword = await bcrypt.hash(password, passRound);
      await database.query(
        `UPDATE tattooArtists SET  artistName = ?, artistNumber=?,username=?,password=?,salary WHERE id = ?`,
        [artistName, artistNumber, username, hashPassword, salary, id],
      );
    }
    await sendempregConfirmation({
      franchiesCode: fId,
      employyname: artistName,
      empId: artistCode,
      role: "Artist",
      salary: salary,
      aphone: artistNumber,
    });
    return res.status(200).json({
      message: "update successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
