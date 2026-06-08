import { database } from "../db/database.js";
import {
  addClientsService,
  editClientService,
} from "../services/clientService.js";
import dotenv from "dotenv";
import { put } from "@vercel/blob";

dotenv.config();

export const addClinets = async (req, res) => {
  try {
    const franchiesCode = req.user.franchiesId;
    const payload = JSON.parse(req.body.clients);
    const baseUrl = process.env.BASE_URL;

    const imageFile = req.files?.tattooImage?.[0];

    // const ttImage = imageFile ? `${baseUrl}/${imageFile.filename}` : null;

    const blob = await put(imageFile.originalname, imageFile.buffer, {
      access: "public",
      contentType: imageFile.mimetype,
    });

    const response = await addClientsService(payload, blob.url, franchiesCode);

    const pdata = JSON.stringify(payload);

    if (response.success) {
      await database.query(
        `INSERT INTO logs (user,service,action,tableNames) VALUES (?,?,?,?)`,
        [payload.username, "Clients", "add", pdata],
      );
      return res.status(200).json({
        message: response.message,
      });
    } else {
      return res.status(500).json({
        message: response.message,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

// get all clients

export const getAllClients = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const size = Math.max(parseInt(req.query.size, 10) || 10, 1);
    const offset = (page - 1) * size;

    const [response] = await database.query(
      `SELECT cl.*,td.tattoodetails,td.inch,td.price,td.tattooImage FROM clients AS cl LEFT JOIN tattoodetails 
      AS td ON cl.id = td.clientId  ORDER BY cl.id DESC LIMIT ? OFFSET ?`,
      [size, offset],
    );

    const [[{ total }]] = await database.query(
      `SELECT COUNT(*) AS total FROM clients AS cl LEFT JOIN tattoodetails AS td ON cl.id = td.clientId`,
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

// get client by id

export const getClientById = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        message: "id is required",
      });
    }

    const [response] = await database.query(
      `SELECT cl.*,td.tattoodetails,td.inch,td.price,td.tattooImage FROM clients AS cl LEFT JOIN tattoodetails AS td ON cl.id = td.clientId WHERE cl.id = ?`,
      [id],
    );

    if (response.length === 0) {
      return res.status(200).json({
        message: "Client data is not available",
      });
    }

    return res.status(200).json({
      message: "success",
      data: response[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// edit client

export const editClient = async (req, res) => {
  try {
    const { clientId } = req.query;
    const payload = JSON.parse(req.body.clients);

    const imageFile = req.files?.tattooImage?.[0];

    let blobUrl = null;

    if (imageFile) {
      const blob = await put(imageFile.originalname, imageFile.buffer, {
        access: "public",
        contentType: imageFile.mimetype,
      });

      blobUrl = blob.url;
    }

    const response = await editClientService(payload, blobUrl, clientId);

    if (response.success) {
      await database.query(
        `INSERT INTO logs (user,service,action,tableNames) VALUES (?,?,?,?)`,
        [payload.username, "Clients", "edit", JSON.stringify(payload)]
      );

      return res.status(200).json({ message: response.message });
    }

    return res.status(400).json({ message: response.message });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// delete clients

export const deleteClient = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        message: "id is required",
      });
    }

    const response = await database.query(
      `DELETE FROM clients WHERE id = ?`,
      id,
    );

    if (response[0].affectedRows === 0) {
      return res.status(400).json({
        message: "something wrong",
      });
    } else {
      return res.status(200).json({
        message: "delete successfully",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllClientsDropdown = async (req, res) => {
  try {
    const franchiesId = req.user?.franchiesId;

    const [response] = await database.query(
      `SELECT id, name FROM clients WHERE franchiesCode = ? `,
      [franchiesId],
    );

    if (response?.length > 0) {
      return res.status(200).json({
        message: "success",
        data: response,
      });
    } else {
      return res.status(400).json({
        message: "data not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
