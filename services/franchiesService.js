import { database } from "../db/database.js";
import bcrypt from "bcrypt";

const passLength = 10;

export const registerFranchies = async (franch) => {
  try {
    const hashPassword = await bcrypt.hash(franch.password,passLength);


    const query = `INSERT INTO franchies (franchies,address,username,password) VALUES (?,?,?,?)`;
    const values = [
      franch.franchies,
      franch.address,
      franch.username,
      hashPassword,
    ];

    const [response] = await database.query(query, values);


   

    return {
      success: true,
      message: "Franchies added successfully",
      id: response.insertId,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const loginFranchies = async (username,password) => {
  try {
    const query = `SELECT * FROM franchies WHERE username = ?`;
    const value = [username];

    const [existUser] = await database.query(query, value);

    // Check user exists
    if (existUser.length === 0) {
      return {
        message: "User not found",
      };
    }

    const user = existUser[0];

    // Compare password
    const encryptPass = await bcrypt.compare(
      password, // plain password
      user.password     // hashed password from DB
    );

    if (!encryptPass) {
      return {
        message: "Password Invalid",
      };
    }

    return {
      success:true,
      message: "Login successfully",
      user,
    };

  } catch (error) {
    return {
      success:false,
      message: error.message,
    };
  }
};
