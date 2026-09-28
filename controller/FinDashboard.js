import { database } from "../db/database.js";

export const dashboardCtrlStats = async (req, res) => {
  try {
    const franchiesCode = req.user.franchiesId;

    const { month, year } = req.query;

    const [countClientResponse] = await database.query(
      `
      SELECT COALESCE(SUM(tattoodetails.price), 0) AS totalRevenue 
      FROM tattoodetails  LEFT JOIN clients ON tattoodetails.clientId = clients.id
      WHERE clients.franchiesCode = ?
        AND MONTH(clients.created_at) = ?
        AND YEAR(clients.created_at) = ?
      `,
      [franchiesCode, month, year],
    );

    const [countExpenseResonse] = await database.query(
      `SELECT COALESCE(SUM(expenses.amount), 0) AS 
      totalExpenses FROM expenses WHERE expenses.franchiesCode = ? AND 
      MONTH(expenses.created_at) = ? AND 
      YEAR(expenses.created_at) = ?`,
      [franchiesCode, month, year],
    );

    const response = {
      totalRevenue: countClientResponse[0].totalRevenue,
      totalExpenses: Number(countExpenseResonse[0].totalExpenses),
      netRevenue:
        countClientResponse[0].totalRevenue -
        countExpenseResonse[0].totalExpenses,
    };

    const [monthlyStats] = await database.query(
      `
      SELECT
        months.month,
        months.monthName,

        COALESCE(revenue.totalRevenue, 0) AS revenue,

        COALESCE(expense.totalExpenses, 0) AS expense

      FROM (
        SELECT 1 AS month, 'Jan' AS monthName
        UNION ALL SELECT 2, 'Feb'
        UNION ALL SELECT 3, 'Mar'
        UNION ALL SELECT 4, 'Apr'
        UNION ALL SELECT 5, 'May'
        UNION ALL SELECT 6, 'Jun'
        UNION ALL SELECT 7, 'Jul'
        UNION ALL SELECT 8, 'Aug'
        UNION ALL SELECT 9, 'Sep'
        UNION ALL SELECT 10, 'Oct'
        UNION ALL SELECT 11, 'Nov'
        UNION ALL SELECT 12, 'Dec'
      ) AS months

      LEFT JOIN (
        SELECT
          MONTH(clients.created_at) AS month,
          SUM(tattoodetails.price) AS totalRevenue
        FROM tattoodetails
        LEFT JOIN clients
          ON tattoodetails.clientId = clients.id
        WHERE clients.franchiesCode = ?
          AND YEAR(clients.created_at) = ?
        GROUP BY MONTH(clients.created_at)
      ) AS revenue
        ON revenue.month = months.month

      LEFT JOIN (
        SELECT
          MONTH(expenses.created_at) AS month,
          SUM(expenses.amount) AS totalExpenses
        FROM expenses
        WHERE expenses.franchiesCode = ?
          AND YEAR(expenses.created_at) = ?
        GROUP BY MONTH(expenses.created_at)
      ) AS expense
        ON expense.month = months.month

      ORDER BY months.month
      `,
      [franchiesCode, year, franchiesCode, year],
    );

    // =========================
    // Revenue By Artist
    // =========================

    const [revenueByArtist] = await database.query(
      `
  SELECT
    clients.tattooArtist AS artist,
    COALESCE(SUM(tattoodetails.price), 0) AS revenue
  FROM clients
  LEFT JOIN tattoodetails
    ON tattoodetails.clientId = clients.id
  WHERE clients.franchiesCode = ?
    AND YEAR(clients.created_at) = ?
    AND MONTH(clients.created_at) = ?
  GROUP BY clients.tattooArtist
  ORDER BY revenue DESC
  `,
      [franchiesCode, year, month],
    );

    // =========================
    // Payment Methods
    // =========================

    const [paymentMethods] = await database.query(
      `
  SELECT
    clients.paymentType AS paymentType,
    COALESCE(SUM(tattoodetails.price), 0) AS amount
  FROM clients
  LEFT JOIN tattoodetails
    ON tattoodetails.clientId = clients.id
  WHERE clients.franchiesCode = ?
    AND YEAR(clients.created_at) = ?
    AND MONTH(clients.created_at) = ?
    AND clients.paymentType IS NOT NULL
  GROUP BY clients.paymentType
  ORDER BY amount DESC
  `,
      [franchiesCode, year, month],
    );

    const totalPaymentAmount = paymentMethods.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    const paymentMethodResponse = paymentMethods.map((item) => ({
      paymentType: item.paymentType,
      amount: Number(item.amount),
      percentage:
        totalPaymentAmount > 0
          ? Number(
              ((Number(item.amount) / totalPaymentAmount) * 100).toFixed(2),
            )
          : 0,
    }));

    // ========================
    // RECENT 5 CLIENTS
    // ========================

    const [recentClients] = await database.query(`SELECT 
      c.id,c.created_at,c.name,
      c.franchiesCode,c.clientType,td.price,
      c.paymentType,c.status,td.clientId FROM 
      clients AS c LEFT JOIN tattoodetails AS td ON c.id = td.clientId 
      WHERE c.franchiesCode = ? ORDER BY c.created_at DESC LIMIT 5`, 
      [franchiesCode]);

    return res.status(200).json({
      success: true,
      data: response,
      monthlyStats: monthlyStats,
      revenueByArtist: revenueByArtist.map((item) => ({
        artist: item.artist,
        revenue: Number(item.revenue),
      })),

      paymentMethods: paymentMethodResponse,
      recentClients:recentClients
    });
  } catch (error) {
    console.error("dashboardCtrlStats error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
