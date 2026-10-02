import { database } from "../db/database.js";

export const addExpense = async (req, res) => {
  try {
    const payload = JSON.parse(req.body.payload);

    const receipt = req.file?.filename;
    const franchiesCode = req.user.franchiesId;

    const { expenseType, amount, description, paymentMethod } = payload;

    let fileUrl = `https://backend.1991tattoos.com/images/receipts/${receipt}`;

    

    if(receipt === undefined){
      fileUrl = null
    }

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
        const pdata = JSON.stringify(payload);

    await database.query(
        `INSERT INTO logs (franchiesCode,user,service,action,tableNames) VALUES (?,?,?,?,?)`,
        [franchiesCode, "Admin", "Expense", "add", pdata],
      );

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

export const getAllExpense = async (req, res) => {
  try {
    const franchiesCode = req.user.franchiesId;

    const { month, year } = req.query;

    const [response] = await database.query(
      `SELECT * FROM expenses 
      WHERE franchiesCode = ? AND MONTH(created_at) = ? 
      AND YEAR(created_at)=?`,
      [franchiesCode, month, year],
    );

    if (response?.length > 0) {
      return res.status(200).json({
        data: response,
      });
    } else {
      return res.status(400).json({
        messagge: "data not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


// delete expense 

export const deleteExpense = async (req,res) =>{
  try {
    const {id} = req.query;
        const franchiesCode = req.user.franchiesId;

        const [[expresponse]] = await database.query(`SELECT * FROM expenses WHERE id = ?`,[id]);

 
        const pdata = JSON.stringify(expresponse);

    if(!id){
      return res.status(400).json({
        message:"id is required"
      })
    }

    const [response] = await database.query(`DELETE FROM expenses WHERE id = ?`,[id]);

 await database.query(
        `INSERT INTO logs (franchiesCode,user,service,action,tableNames) VALUES (?,?,?,?,?)`,
        [franchiesCode, "Admin", "Expense", "delete", pdata],
      );

    if(response.affectedRows > 0){
      return res.status(200).json({
        message:"deleted successfully"
      })
    }else{
        return res.status(400).json({
        message:"something went wrong"
      })
    }

  } catch (error) {
    return res.status(500).json({
      message:error.message
    })
  }
}