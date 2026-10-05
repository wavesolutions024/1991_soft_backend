import { database } from "../db/database.js";

export const addEnquiryService = async (payload, franchiesCode) => {
  try {
    const query = `INSERT INTO enquiry (franchiesCode,name,mobileNo,
    serviceType
        ,enquiryType,budget,message,FOLLOW_UP_1,FOLLOW_UP_2_DATE) 
        VALUES (?,?,?,?,?,?,?,?,?)`;

    const values = [
      franchiesCode,
      payload.name,
      payload.mobileNo,
      payload.service,
      payload.enquiryType,
      payload.budget,
      payload.message,
      payload.FOLLOW_UP_1,
      payload.FOLLOW_UP_2_DATE
    ];

    await database.query(query, values);

    return {
      success: true,
      message: "Enquiry added successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const updateEnquiryStatusService = async (id, status) => {
  try {
    const query = `UPDATE enquiry SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const [response] = await database.query(query, [status, id]);

    if (response.affectedRows === 0) {
      return {
        success: false,
        message: "Enquiry not found or status unchanged",
      };
    }

    return {
      success: true,
      message: "Enquiry status updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
