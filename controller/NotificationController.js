import { database } from "../db/database.js";

export const getBirthNotifi = async (req, res) => {
  try {
    const date = new Date();

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");



    const [response] = await database.query(
      `SELECT name, mobileno FROM clients 
       WHERE DATE_FORMAT(dob, '%m-%d') = ?`,
      [`${month}-${day}`]
    );

    if (response?.length === 0) {
      return res.status(400).json({
        message: "No Notification Available",
      });
    }

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
