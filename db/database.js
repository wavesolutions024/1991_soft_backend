import mysql from "mysql2/promise.js";
import dotenv from "dotenv";
dotenv.config();

export const database = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
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
