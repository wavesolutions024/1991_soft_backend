import mysql from "mysql2/promise.js";
import dotenv from "dotenv";
dotenv.config();

export const database = mysql.createPool({
  host: "193.203.184.157" || "localhost",
  port:3306,
  user: "u957540675_1991tatostudio" || "root",
  password: "1991@tattooStudio" || "ketan566123",
  database: "u957540675_1991_backend" || "1991_backend",
  dateStrings: true,
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
