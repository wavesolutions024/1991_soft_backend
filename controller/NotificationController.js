import { database } from "../db/database.js";

export const getBirthNotifi = async (req, res) => {
  try {
    const date = new Date();

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const franchiesCode = req.user?.franchiesId;

    const [response] = await database.query(
      `SELECT name, mobileno, dob 
       FROM clients 
       WHERE DATE_FORMAT(dob, '%m-%d') = ?
       AND franchiesCode = ?`,
      [`${month}-${day}`, franchiesCode]
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




export const getTodayBirthdayCustomers = async () => {
  const [rows] = await database.query(`
    SELECT 
      mobileno AS num,
      name,
      franchiesCode
    FROM clients
    WHERE DATE_FORMAT(dob, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d')
  `);

  console.log(rows)

  return rows;
};

export const getUpcomingBirthdayCustomers = async () => {
  const [rows] = await database.query(`
    SELECT
      mobileno AS num,
      name,
      franchiesCode
    FROM clients
    WHERE DATE_FORMAT(dob, '%m-%d') IN (
      DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%m-%d'),
      DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '%m-%d')
    )
  `);

  return rows;
};

