import mysql from "mysql2/promise.js";
import dotenv from "dotenv";
dotenv.config();

// export const database = mysql.createPool({
//   host: "88.222.214.214" || "localhost",
//   port:3306,
//   user: "developer" || "root",
//   password: "Swarup@894234" || "ketan566123",
//   database: "1991_crm" || "1991_backend",
//   dateStrings: true,
// });

export const database = mysql.createPool({
  host: process.env.HOST || "localhost",
  port:3306,
  user: process.env.USER || "root",
  password: process.env.PASSWORD || "ketan566123",
  database: process.env.DATABASE || "1991_backend",
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
