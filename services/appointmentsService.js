import { database } from "../db/database.js";

export const addAppointmentService = async (payload, franchiesCode) => {
  try {
    // check for existing appointment with same date & time for this franchies
    const [[existing]] = await database.query(
      `SELECT * FROM appointments WHERE franchiesCode = ? AND date = ? AND time = ? LIMIT 1`,
      [franchiesCode, payload.date, payload.time],
    );

    if (existing) {
      return {
        success: false,
        message: `same day same time is already appoinend to --- ${existing.name}`,
      };
    }

    const query = `INSERT INTO appointments (franchiesCode,name,date,time,contactNumber,advanceAmount,visitPlatform) VALUES (?,?,?,?,?,?,?)`;

    const values = [
      franchiesCode,
      payload.name,
      payload.date,
      payload.time,
      payload.contactNumber,
      payload.advanceAmount || 0,
      payload.visitPlatform,
    ];

    await database.query(query, values);

    return {
      success: true,
      message: "Appointment added successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getAllAppointmentsService = async (page = 1, size = 10) => {
  try {
    const offset = (page - 1) * size;
    const [response] = await database.query(
      `SELECT * FROM appointments ORDER BY id DESC LIMIT ? OFFSET ?`,
      [size, offset],
    );

    const [[{ total }]] = await database.query(
      `SELECT COUNT(DISTINCT id) AS total FROM appointments`,
    );

    return {
      success: true,
      data: response,
      pagination: { page, size, total, totalPages: Math.ceil(total / size) },
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getAppointmentByIdService = async (id) => {
  try {
    const [[response]] = await database.query(
      `SELECT * FROM appointments WHERE id = ?`,
      [id],
    );

    if (!response) {
      return { success: false, message: "Appointment not found" };
    }

    return { success: true, data: response };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const updateAppointmentService = async (id, payload) => {
  try {
    // check for existing appointment with same date & time (exclude current id)
    const [[existing]] = await database.query(
      `SELECT * FROM appointments WHERE date = ? AND time = ? AND id != ? LIMIT 1`,
      [payload.date, payload.time, id],
    );

    if (existing) {
      return {
        success: false,
        message: `same day same time is already appoinend to --- ${existing.name}`,
      };
    }

    const query = `UPDATE appointments SET name = ?, date = ?, time = ?, contactNumber = ?, advanceAmount = ?, visitPlatform = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const values = [
      payload.name,
      payload.date,
      payload.time,
      payload.contactNumber,
      payload.advanceAmount || 0,
      payload.visitPlatform,
      id,
    ];

    const [response] = await database.query(query, values);

    if (response.affectedRows === 0) {
      return { success: false, message: "Appointment not found or unchanged" };
    }

    return { success: true, message: "Appointment updated successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
