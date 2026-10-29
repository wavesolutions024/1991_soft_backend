

import ExcelJS from "exceljs";
import { Readable } from "stream";
import { database } from "../db/database.js";

const normalizeHeader = (value) =>
  String(value ?? "")
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const getColumnIndex = (headers, acceptedNames) =>
  headers.findIndex((header) => acceptedNames.includes(header)) + 1;

export const importBulkData = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "A CSV file is required" });
  }

  if (!req.file.originalname.toLowerCase().endsWith(".csv")) {
    return res.status(400).json({ message: "Only CSV files are supported" });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    let worksheet;

    try {
      worksheet = await workbook.csv.read(
        Readable.from([req.file.buffer]),
        { map: (value) => value },
      );
    } catch {
      return res.status(400).json({ message: "The uploaded CSV file is invalid" });
    }

    const headers = worksheet
      .getRow(1)
      .values.slice(1)
      .map(normalizeHeader);
    const nameColumn = getColumnIndex(headers, ["name"]);
    const numberColumn = getColumnIndex(headers, [
      "number",
      "contactnumber",
      "mobileno",
      "mobilenumber",
      "phone",
      "phonenumber",
    ]);

    if (nameColumn === 0 || numberColumn === 0) {
      return res.status(400).json({
        message:
          "CSV must include name and number/contact number columns",
      });
    }

    const records = [];
    const invalidRows = [];
    const numbersInFile = new Set();
    let duplicateCount = 0;
    let invalidCount = 0;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const name = String(row.getCell(nameColumn).text ?? "").trim();
      const rawNumber = String(row.getCell(numberColumn).text ?? "").trim();
      const number = rawNumber.replace(/\D/g, "");

      if (
        !name ||
        name.length > 100 ||
        !/^\+?[\d\s().-]+$/.test(rawNumber) ||
        number.length < 7 ||
        number.length > 20
      ) {
        invalidCount += 1;
        if (invalidRows.length < 100) {
          invalidRows.push({
            row: rowNumber,
            reason: "Name or contact number is missing or invalid",
          });
        }
        return;
      }

      if (numbersInFile.has(number)) {
        duplicateCount += 1;
        return;
      }

      numbersInFile.add(number);
      records.push({ name, number });
    });

    if (records.length === 0 && invalidCount === 0 && duplicateCount === 0) {
      return res.status(400).json({ message: "CSV contains no data rows" });
    }

    let importedCount = 0;
    const connection = await database.getConnection();

    try {
      await connection.beginTransaction();

      for (const { name, number } of records) {
        try {
          await connection.execute(
            "INSERT INTO bulkData (name, number) VALUES (?, ?)",
            [name, number],
          );
          importedCount += 1;
        } catch (error) {
          if (error.code === "ER_DUP_ENTRY") {
            duplicateCount += 1;
            continue;
          }

          throw error;
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return res.status(200).json({
      message: "CSV import completed",
      importedCount,
      duplicateCount,
      invalidCount,
      invalidRows,
    });
  } catch (error) {
    console.error("Bulk customer CSV import failed:", error);
    return res.status(500).json({ message: "Failed to import CSV file" });
  }
};