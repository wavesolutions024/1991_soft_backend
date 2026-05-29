import { database } from "../db/database.js";
import {
  addClientsService,
  editClientService,
} from "../services/clientService.js";
import dotenv from "dotenv";
dotenv.config();

export const addClinets = async (req, res) => {
  try {
    const franchiesCode = req.user.franchiesId;
    const payload = JSON.parse(req.body.clients);
    const baseUrl = process.env.BASE_URL;

    const imageFile = req.files?.tattooImage?.[0];

    const ttImage = imageFile ? `${baseUrl}/${imageFile.filename}` : null;

    const response = await addClientsService(payload, ttImage, franchiesCode);

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
    const [response] = await database.query(
      `SELECT cl.*,td.tattoodetails,td.inch,td.price,td.tattooImage FROM clients AS cl LEFT JOIN tattooDetails AS td ON cl.id = td.clientId`,
    );

    if (response.length === 0) {
      return res.status(400).json({
        message: "Clients are not available",
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
      `SELECT cl.*,td.tattoodetails,td.inch,td.price,td.tattooImage FROM clients AS cl LEFT JOIN tattooDetails AS td ON cl.id = td.clientId WHERE cl.id = ?`,
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

    const baseUrl = "http://localhost:3003/images";

    const imageFile = req.files?.tattooImage?.[0];

    const ttImage = imageFile ? `${baseUrl}/${imageFile.filename}` : null;

    const response = await editClientService(payload, ttImage, clientId);

    const pdata = JSON.stringify(payload)

    if (response.success) {
              await database.query(
      `INSERT INTO logs (user,service,action,tableNames) VALUES (?,?,?,?)`,
      [payload.username, "Clients", "edit", pdata],
    );
      return res.status(200).json({
        message: response.message,
      });
    } else {
      return res.status(400).json({
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
