import mysql from "mysql2/promise.js";
import dotenv from "dotenv";
dotenv.config();

export const database = mysql.createPool({
  host: process.env.HOST || "localhost",
  user: process.env.USER ||  "root",
  password:process.env.PASSWORD ||  "ketan566123",
  database: process.env.DATABASE ||  "1991_backend",
});

export const createConnection = async () => {
  let connection;

  try {
    connection = await database.getConnection();

    console.log("database connected");

    connection.commit();
  } catch (error) {
    console.log(error);
  } finally {
    connection.release();
  }
};
