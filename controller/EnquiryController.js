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
        [req.user.username || "Unknown", "Enquiry", "add", payloadString],
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
