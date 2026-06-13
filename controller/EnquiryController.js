import { enquiry } from "../class/Class.js";
import { database } from "../db/database.js";
import {
  addEnquiryService,
  updateEnquiryStatusService,
} from "../services/EnquiryService.js";

export const addEnquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      mobileNo,
      gender,
      tattooStyle,
      tattooDescription,
      budget,
    } = req.body;
    const { username } = req.query;

    const franchiesCode = req.user.franchiesId;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!mobileNo) {
      return res.status(400).json({ message: "Mobile number is required" });
    }

    const payload = new enquiry({
      name,
      email,
      mobileNo,
      gender,
      tattooStyle,
      tattooDescription,
      budget,
    });

    const response = await addEnquiryService(payload, franchiesCode);

    if (response.success) {
      const payloadString = JSON.stringify(payload);
      await database.query(
        `INSERT INTO logs (user,service,action,tableNames) VALUES (?,?,?,?)`,
        [username, "Enquiry", "add", payloadString],
      );

      return res.status(200).json({ message: response.message });
    }

    return res.status(500).json({ message: response.message });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.query;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Enquiry id is required" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const allowedStatuses = [
      "pending",
      "contacted",
      "booked",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    const response = await updateEnquiryStatusService(id, status);

    if (response.success) {
      const payloadString = JSON.stringify({ id, status });
      await database.query(
        `INSERT INTO logs (user,service,action,tableNames) VALUES (?,?,?,?)`,
        [
          req.user.username || "Unknown",
          "Enquiry",
          "update status",
          payloadString,
        ],
      );

      return res.status(200).json({ message: response.message });
    }

    return res.status(400).json({ message: response.message });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

// edit enquiry

export const updateEnquiry = async (req, res) => {
  try {
    const { id, username } = req.query;
    const {
      name,
      email,
      mobileNo,
      gender,
      tattooStyle,
      tattooDescription,
      budget,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    if (!mobileNo) {
      return res.status(400).json({
        message: "Mobile Number is required",
      });
    }

     await database.query(
      `UPDATE enquiry SET name= ? , email = ?, mobileNo = ?, gender = ?, tattooStyle=?,tattooDescription=?,budget=? WHERE id = ?`,
      [
        name,
        email,
        mobileNo,
        gender,
        tattooStyle,
        tattooDescription,
        budget,
        id,
      ],
    );

    const payload = {
      name,
      email,
      mobileNo,
      gender,
      tattooStyle,
      tattooDescription,
      budget,
    };

    const payloadString = JSON.stringify(payload);

    await database.query(
      `INSERT INTO logs (user,service,action,tableNames) VALUES (?,?,?,?)`,
      [username, "Enquiry", "edit", payloadString],
    );
    return res.status(200).json({
      message: "update successfully",
    });
  } catch (error) {}
};

export const getAllEnquiry = async (req, res) => {
  try {
    const franchiesCode = req.user.franchiesId;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const size = Math.max(parseInt(req.query.size, 10) || 10, 1);
    const offset = (page - 1) * size;

    const [response] = await database.query(
      `SELECT * FROM enquiry ORDER BY id DESC LIMIT ? OFFSET ?`,
      [size, offset],
    );

    const [[{ total }]] = await database.query(
      `SELECT COUNT(DISTINCT id) AS total FROM enquiry`,
    );

    return res.status(200).json({
      message: "success",
      data: response,
      pagination: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getEnquiryById = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        message: "id is required",
      });
    }

    const [[response]] = await database.query(
      `SELECT * FROM enquiry WHERE id = ?`,
      [id],
    );

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
