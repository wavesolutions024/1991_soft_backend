import { database } from "../db/database.js";
import {
  addClientsService,
  editClientService,
} from "../services/clientService.js";
import dotenv from "dotenv";
import { put } from "@vercel/blob";
import ExcelJS from "exceljs";
import fs from "fs/promises";
import os from "os";
import path from "path";

import { encryptExcel } from "../utils/encryptExcel.js";

dotenv.config();

export const addClinets = async (req, res) => {
  try {
    const franchiesCode = req.user.franchiesId;
    const payload = JSON.parse(req.body.clients);
    const id = req.user.id;
    const role = req.user.role;

    const userId = role === "Admin" ? 0 : id

    // const baseUrl = process.env.BASE_URL;

    const imageFile = req.files?.tattooImage?.[0] || null;

    // const ttImage = imageFile ? `${baseUrl}/${imageFile.filename}` : null;

    let blob;

    if (imageFile !== null) {
      blob = await put(imageFile.originalname, imageFile.buffer, {
        access: "public",
        contentType: imageFile.mimetype,
      });
    }

    const response = await addClientsService(payload, blob?.url || null, franchiesCode,userId);

    const pdata = JSON.stringify(payload);





    if (response.success) {
      await database.query(
        `INSERT INTO logs (franchiesCode,user,service,action,tableNames) VALUES (?,?,?,?,?)`,
        [franchiesCode, payload?.username, "Clients", "add", pdata],
      );
      return res.status(200).json({
        message: response.message,
      });
    } else {
      console.log(response.message)
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
    const id = req.user.id;
    const role = req.user.role;
    const franchiesCode = req.user.franchiesId;



    const vip = req.query.vip;
    const semiVip = req.query.semiVip;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const size = Math.max(parseInt(req.query.size, 10) || 10, 1);
    const offset = (page - 1) * size;

    const search = (
      req.query.search ||
      req.query.query ||
      ""
    ).trim();

    const conditions = [];
    const params = [];

    // =====================================================
    // 1. Franchise condition - ALWAYS compulsory
    // =====================================================
    conditions.push("cl.franchiesCode = ?");
    params.push(franchiesCode);

    // =====================================================
    // 2. Search condition
    //
    // If search is available:
    // Search ALL clients from the same franchise
    //
    // If search is NOT available:
    // Artist sees only their own clients
    // Admin sees all clients
    // =====================================================
    if (search) {
      conditions.push(
        "(cl.name LIKE ? OR cl.mobileno LIKE ?)"
      );

      const like = `%${search}%`;

      params.push(like, like);
    } else if (role !== "Admin") {
      conditions.push("cl.a_id = ?");
      params.push(id);
    }

    // =====================================================
    // 3. VIP filter
    // =====================================================
    if (vip !== undefined) {
      conditions.push("cl.VIP = ?");

      params.push(
        vip === "true" || vip === "1" ? 1 : 0
      );
    }

    // =====================================================
    // 4. Semi VIP filter
    // =====================================================
    if (semiVip !== undefined) {
      conditions.push("cl.semiVIP = ?");

      params.push(
        semiVip === "true" || semiVip === "1" ? 1 : 0
      );
    }

    // =====================================================
    // 5. WHERE clause
    // =====================================================
    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // =====================================================
    // 6. Get clients with pagination
    //
    // First paginate clients,
    // THEN join tattoo details
    // =====================================================
    const [response] = await database.query(
      `
      SELECT
        cl.*,
        td.tattoodetails,
        td.inch,
        td.price,
        td.tattooImage
      FROM (
        SELECT cl.*
        FROM clients AS cl
        ${whereClause}
        ORDER BY cl.id DESC
        LIMIT ? OFFSET ?
      ) AS cl
      LEFT JOIN tattoodetails AS td
        ON cl.id = td.clientId
      ORDER BY cl.id DESC
      `,
      [...params, size, offset]
    );

    // =====================================================
    // 7. Get total count
    //    Same WHERE condition is used
    // =====================================================
    const [[{ total }]] = await database.query(
      `
      SELECT COUNT(*) AS total
      FROM clients AS cl
      ${whereClause}
      `,
      params
    );

    // =====================================================
    // 8. Response
    // =====================================================
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
    console.error("getAllClients error:", error);

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
   const id = req.user.id
    const imageFile = req.files?.tattooImage?.[0];
 const franchiesCode = req.user.franchiesId;
    let blobUrl = null;

    if (imageFile) {
      const blob = await put(imageFile.originalname, imageFile.buffer, {
        access: "public",
        contentType: imageFile.mimetype,
      });

      blobUrl = blob.url;
    }

    const response = await editClientService(payload, blobUrl, clientId);

     const pdata = JSON.stringify(payload);

    if (response.success) {
      await database.query(
        `INSERT INTO logs (franchiesCode,user,service,action,tableNames) VALUES (?,?,?,?,?)`,
        [franchiesCode,payload.username, "Clients", "edit", pdata],
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

// export all clients as CSV
export const exportAllClients = async (req, res) => {
  try {
    const franchiesId = req.user?.franchiesId;

    const [rows] = await database.query(
      `SELECT cl.*, td.tattoodetails, td.inch, td.price, td.tattooImage FROM clients AS cl LEFT JOIN tattoodetails AS td ON cl.id = td.clientId WHERE cl.franchiesCode = ? ORDER BY cl.id DESC`,
      [franchiesId],
    );

    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: "data not found" });
    }

    // build CSV header from keys of first row
    const headers = Object.keys(rows[0]);

    const escape = (val) => {
      if (val === null || val === undefined) return "";
      const s = String(val);
      return '"' + s.replace(/"/g, '""') + '"';
    };

    const csvLines = [];
    csvLines.push(headers.join(","));

    for (const row of rows) {
      const line = headers.map((h) => escape(row[h])).join(",");
      csvLines.push(line);
    }

    const csv = csvLines.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=clients_export.csv");
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const exportClientExcel = async (req,res)=>{
    let tempDir;
   try {
    const franchiesId = req.user?.franchiesId;

    if (!franchiesId) {
      return res.status(401).json({
        message: "Franchise ID not found",
      });
    }

    // -----------------------------------
    // 1. Get clients from database
    // -----------------------------------

    const [rows] = await database.query(
      `
      SELECT 
        cl.*,
        td.tattoodetails,
        td.inch,
        td.price,
        td.tattooImage
      FROM clients AS cl
      LEFT JOIN tattoodetails AS td
        ON cl.id = td.clientId
      WHERE cl.franchiesCode = ?
      ORDER BY cl.id DESC
      `,
      [franchiesId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    // -----------------------------------
    // 2. Create Excel workbook
    // -----------------------------------

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet("Clients");

    const headers = Object.keys(rows[0]);

    worksheet.columns = headers.map((header) => ({
      header,
      key: header,
      width: 20,
    }));

    // Add rows
    for (const row of rows) {
      const excelRow = {};

      for (const header of headers) {
        excelRow[header] =
          row[header] === null ||
          row[header] === undefined
            ? ""
            : row[header];
      }

      worksheet.addRow(excelRow);
    }

    // -----------------------------------
    // 3. Excel formatting
    // -----------------------------------

    const headerRow = worksheet.getRow(1);

    headerRow.font = {
      bold: true,
    };

    headerRow.alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];

    // -----------------------------------
    // 4. Create temporary directory
    // -----------------------------------

    tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "client-export-")
    );

    const originalFile = path.join(
      tempDir,
      "clients.xlsx"
    );

    const encryptedFile = path.join(
      tempDir,
      "clients_protected.xlsx"
    );

    // -----------------------------------
    // 5. Save XLSX temporarily
    // -----------------------------------

    await workbook.xlsx.writeFile(originalFile);

    // -----------------------------------
    // 6. Get password
    // -----------------------------------

    const password =
      process.env.EXCEL_EXPORT_PASSWORD;

    if (!password) {
      throw new Error(
        "EXCEL_EXPORT_PASSWORD is not configured"
      );
    }

    // -----------------------------------
    // 7. Encrypt XLSX
    // -----------------------------------

    await encryptExcel({
      inputFile: originalFile,
      outputFile: encryptedFile,
      password,
    });

    // -----------------------------------
    // 8. Read encrypted file
    // -----------------------------------

    const fileBuffer = await fs.readFile(
      encryptedFile
    );

    // -----------------------------------
    // 9. Send to browser
    // -----------------------------------

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="clients_export.xlsx"'
    );

    res.setHeader(
      "Content-Length",
      fileBuffer.length
    );

    return res.status(200).send(fileBuffer);

  } catch (error) {

    console.error(
      "Export clients error:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });

  } finally {

    // -----------------------------------
    // 10. Delete temporary files
    // -----------------------------------

    if (tempDir) {
      await fs.rm(tempDir, {
        recursive: true,
        force: true,
      }).catch((error) => {
        console.error(
          "Temporary file cleanup error:",
          error
        );
      });
    }
  }
}

