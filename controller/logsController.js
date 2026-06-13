import { database } from "../db/database.js";

export const getAllLogs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const size = Math.max(parseInt(req.query.size, 10) || 10, 1);
    const offset = (page - 1) * size;

    const [response] = await database.query(
      `SELECT *
               FROM logs
               ORDER BY id DESC
               LIMIT ? OFFSET ?`,
      [size, offset],
    );

    const [[ {total} ]] = await database.query(
      "SELECT COUNT(*) AS total FROM logs",
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
        message:error.message
    })
  }
};
