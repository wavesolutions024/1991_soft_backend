import { Franchies } from "../class/Class.js";
import {
  loginFranchies,
  registerFranchies,
} from "../services/franchiesService.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { database } from "../db/database.js";
dotenv.config();
export const regFranchies = async (req, res) => {
  try {
    const { franchies, address, username, password } = req.body;

    if (!franchies) {
      return res.status(400).json({
        message: "Franchies is required",
      });
    } else if (!address) {
      return res.status(400).json({
        message: "address is required",
      });
    } else if (!username) {
      return res.status(400).json({
        message: "username is required",
      });
    } else if (!password) {
      return res.status(400).json({
        message: "password is required",
      });
    }

    const payload = new Franchies({ franchies, address, username, password });

    const response = await registerFranchies(payload);

    if (response.success) {
      return res.status(200).json({
        message: response?.message,
        id: response?.id,
      });
    } else {
      return res.status(500).json({
        message: response?.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const loginFranchiesCtrl = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username) {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    const response = await loginFranchies(username, password);

    if (response.success) {
      const token = jwt.sign(
        {
          id: response?.id,
          franchiesId: response?.franchiesId,
          role: response?.user?.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        },
      );

      // res.cookie("token", token, {
      //   httpOnly: true,
      //   secure: false, // OK for localhost/Postman
      //   sameSite: "lax", // REQUIRED
      //   path: "/",
      //   maxAge: 24 * 60 * 60 * 1000,
      // });

        res.cookie("token", token, {
        httpOnly: true,
        secure: true, // REQUIRED
        sameSite: "None",
        domain: ".1991tattoos.com",
        path: "/",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      });

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

export const getUserDataViaToken = async (req, res) => {
  try {
    const id = req.user.id;

    

    if (!id) {
      return res.status(401).json({
        message: "you are not login",
      });
    }

    let response;

     [response] = await database.query(
        `SELECT id,franchiesCode, artistName,artistNumber,username,role FROM tattooArtists WHERE artistCode = ?`,
        [id],
      );



    if (response.length === 0) {
         [response] = await database.query(
      `SELECT id, username,franchies,address,role FROM franchies WHERE id = ?`,
      [id],
    );
    }

    return res.status(200).json({
      data: response[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


export const logout = async (req, res) => {
  try {
    res.clearCookie("token");


    return res.status(200).json({
      message: "logout successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};