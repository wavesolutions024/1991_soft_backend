import { database } from "../db/database.js";
import {
  addAppointmentService,
  getAllAppointmentsService,
  getAppointmentByIdService,
  updateAppointmentService,
} from "../services/appointmentsService.js";

export const addAppointment = async (req, res) => {
  try {
    const { name, date, time, contactNumber, advanceAmount, visitPlatform } =
      req.body;
    const username = req.query.username || req.user?.username || "Unknown";

    const franchiesCode = req.user?.franchiesId;

    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!date) return res.status(400).json({ message: "Date is required" });
    if (!time) return res.status(400).json({ message: "Time is required" });
    if (!contactNumber)
      return res.status(400).json({ message: "Contact number is required" });

    const payload = {
      name,
      date,
      time,
      contactNumber,
      advanceAmount,
      visitPlatform,
    };

    const response = await addAppointmentService(payload, franchiesCode);

    if (response.success) {
      await database.query(
        `INSERT INTO logs (user,service,action,tableNames) VALUES (?,?,?,?)`,
        [username, "Appointments", "add", JSON.stringify(payload)],
      );

      return res.status(200).json({ message: response.message });
    }

    return res.status(500).json({ message: response.message });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const size = Math.max(parseInt(req.query.size, 10) || 10, 1);

    const response = await getAllAppointmentsService(page, size);

    if (!response.success)
      return res.status(500).json({ message: response.message });

    return res.status(200).json({
      message: "success",
      data: response.data,
      pagination: response.pagination,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) return res.status(400).json({ message: "id is required" });

    const response = await getAppointmentByIdService(id);

    if (!response.success)
      return res.status(404).json({ message: response.message });

    return res.status(200).json({ message: "success", data: response.data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const editAppointment = async (req, res) => {
  try {
    const { id } = req.query;
    const username = req.query.username || req.user?.username || "Unknown";
    const { name, date, time, contactNumber, advanceAmount, visitPlatform } =
      req.body;

    if (!id) return res.status(400).json({ message: "id is required" });
    if (!name) return res.status(400).json({ message: "Name is required" });

    const payload = {
      name,
      date,
      time,
      contactNumber,
      advanceAmount,
      visitPlatform,
    };

    const response = await updateAppointmentService(id, payload);

    if (response.success) {
      await database.query(
        `INSERT INTO logs (user,service,action,tableNames) VALUES (?,?,?,?)`,
        [username, "Appointments", "edit", JSON.stringify(payload)],
      );

      return res.status(200).json({ message: response.message });
    }

    return res.status(400).json({ message: response.message });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteAppoinment = async (req, res) => {
  try {
    const { id, username } = req.query;

    if (!id || !username) {
      return res.status(400).json({
        message: "id & username are required",
      });
    }

    const [[response]] = await database.query(
      `SELECT * FROM appointments WHERE id = ?`,
      [id],
    );

    const payload = JSON.stringify(response);

    await database.query(
      `INSERT INTO logs (user,service,action,tableNames) VALUES (?,?,?,?)`,
      [username, "Appointments", "delete", payload],
    );

    await database.query(`DELETE FROM appointments WHERE id =?`, [id]);

    return res.status(200).json({
      message: "Appoinmetn Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
