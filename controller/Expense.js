import { database } from "../db/database.js";



export const addExpense = async (req, res) => {
  try {
    const payload = JSON.parse(req.body.payload);

    const receipt = req.file?.filename;
    const franchiesCode = req.user.franchiesId;
   


    const {
      expenseType,
      amount,
      description,
      paymentMethod,
    } = payload;


    const fileUrl = `https://backend.1991tattoos.com/images/receipts/${receipt}`;

    const query = `
      INSERT INTO expenses
      (
        franchiesCode,
        expenseType,
        amount,
        description,
        paymentMethod,
        recietImage
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      franchiesCode,
      expenseType,
      amount,
      description,
      paymentMethod,
      fileUrl,
    ];

    const [response] = await database.query(query, values);

    if (response.affectedRows > 0) {
      return res.status(200).json({
        message: "Expense added successfully",
      });
    }

    return res.status(500).json({
      message: "Failed to add expense",
    });

  } catch (error) {
    console.error("addExpense error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};