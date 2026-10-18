import { database } from "../db/database.js";
// import { Parser } from "json2csv";
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

    const [recentClients] = await database.query(
      `SELECT 
      c.id,c.created_at,c.name,
      c.franchiesCode,c.clientType,td.price,
      c.paymentType,c.status,td.clientId FROM 
      clients AS c LEFT JOIN tattoodetails AS td ON c.id = td.clientId 
      WHERE c.franchiesCode = ? ORDER BY c.created_at DESC LIMIT 5`,
      [franchiesCode],
    );

    const query = `
      SELECT
        COALESCE(NULLIF(clientType, ''), 'Unspecified') AS clientType,
        COUNT(*) AS count
      FROM clients
      WHERE MONTH(created_at) = ?
        AND YEAR(created_at) = ? AND franchiesCode = ?
      GROUP BY COALESCE(NULLIF(clientType, ''), 'Unspecified')
      ORDER BY count DESC
    `;

    const [rows] = await database.query(query, [month, year, franchiesCode]);

    return res.status(200).json({
      success: true,
      data: response,
      monthlyStats: monthlyStats,
      revenueByArtist: revenueByArtist.map((item) => ({
        artist: item.artist,
        revenue: Number(item.revenue),
      })),

      clientype: rows,
      paymentMethods: paymentMethodResponse,
      recentClients: recentClients,
    });
  } catch (error) {
    console.error("dashboardCtrlStats error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};



export const expordata = async (req, res) => {
  try {
    const franchiesCode = req.user.franchiesId;
    const { month, year } = req.query;

    // Validate month and year
    const selectedMonth = month ? Number(month) : null;
    const selectedYear = year ? Number(year) : null;

    if (
      (month && (!Number.isInteger(selectedMonth) ||
        selectedMonth < 1 || selectedMonth > 12)) ||
      (year && (!Number.isInteger(selectedYear) ||
        selectedYear < 2000 || selectedYear > 9999))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid month or year",
      });
    }

    // Dynamic date filter
    let dateCondition = "";
    const params = [franchiesCode];

    if (selectedYear) {
      dateCondition += " AND YEAR(c.created_at) = ?";
      params.push(selectedYear);
    }

    if (selectedMonth) {
      dateCondition += " AND MONTH(c.created_at) = ?";
      params.push(selectedMonth);
    }

    // Normalize client source
    const sourceSQL = `
      CASE
        WHEN LOWER(TRIM(c.clientType)) LIKE '%Instragram%'
          THEN 'Instragram'
        WHEN LOWER(TRIM(c.clientType)) LIKE '%google%'
          THEN 'Google'
        WHEN LOWER(TRIM(c.clientType)) LIKE '%walk%'
          THEN 'Walk-in'
        ELSE 'Other'
      END
    `;

    // 1. Summary counts and amounts
    const [summaryRows] = await database.execute(
      `
      SELECT
        COUNT(DISTINCT c.id) AS totalClients,

        COUNT(DISTINCT CASE
          WHEN ${sourceSQL} = 'Instragram' THEN c.id
        END) AS instagramCount,

        COUNT(DISTINCT CASE
          WHEN ${sourceSQL} = 'Google' THEN c.id
        END) AS googleCount,

        COUNT(DISTINCT CASE
          WHEN ${sourceSQL} = 'Walk-in' THEN c.id
        END) AS walkinCount,

        COALESCE(SUM(
          CASE WHEN ${sourceSQL} = 'Instragram'
          THEN CAST(td.price AS DECIMAL(12,2)) ELSE 0 END
        ), 0) AS instagramAmount,

        COALESCE(SUM(
          CASE WHEN ${sourceSQL} = 'Google'
          THEN CAST(td.price AS DECIMAL(12,2)) ELSE 0 END
        ), 0) AS googleAmount,

        COALESCE(SUM(
          CASE WHEN ${sourceSQL} = 'Walk-in'
          THEN CAST(td.price AS DECIMAL(12,2)) ELSE 0 END
        ), 0) AS walkinAmount,

        COALESCE(SUM(
          CAST(td.price AS DECIMAL(12,2))
        ), 0) AS totalAmount

      FROM clients c
      LEFT JOIN tattoodetails td ON td.clientId = c.id
      WHERE c.franchiesCode = ?
      ${dateCondition}
      `,
      params
    );

    const summary = summaryRows[0];

    // 2. Detailed client and tattoo data
    const [clientsData] = await database.execute(
      `
      SELECT
        c.id AS Client_ID,
        c.a_id AS Client_Code,
        c.name AS Client_Name,
        c.mobileno AS Mobile,
        c.email AS Email,
        c.gender AS Gender,
        c.tattooArtist AS Tattoo_Artist,
        c.clientType AS Client_Source,
        c.referallName AS Referral_Name,
        c.paymentType AS Payment_Type,
        c.address AS Address,
        c.dob AS Date_of_Birth,
        c.status AS Status,
        c.semiVIP AS Semi_VIP,
        c.VIP AS VIP,
        td.tattoodetails AS Tattoo_Details,
        td.inch AS Inch,
        td.price AS Price,
        td.tattooImage AS Tattoo_Image,
        c.created_at AS Client_Created_Date,
        td.created_at AS Tattoo_Created_Date

      FROM clients c
      LEFT JOIN tattoodetails td ON td.clientId = c.id
      WHERE c.franchiesCode = ?
      ${dateCondition}
      ORDER BY c.created_at DESC, c.id DESC
      `,
      params
    );

    // CSV escaping: handles commas, quotes and newlines
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return "";

      const text = String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };

    const csvRows = [];

    // TOP SUMMARY
    csvRows.push(["REPORT SUMMARY"]);
    csvRows.push(["Total Clients", summary.totalClients]);
    csvRows.push(["Instagram Clients", summary.instagramCount]);
    csvRows.push(["Google Clients", summary.googleCount]);
    csvRows.push(["Walk-in Clients", summary.walkinCount]);
    csvRows.push(["Total Amount", summary.totalAmount]);
    csvRows.push(["Instagram Amount", summary.instagramAmount]);
    csvRows.push(["Google Amount", summary.googleAmount]);
    csvRows.push(["Walk-in Amount", summary.walkinAmount]);

    // Blank lines between summary and detailed table
    csvRows.push([]);
    csvRows.push([]);
    csvRows.push(["CLIENT DETAILS"]);

    if (clientsData.length > 0) {
      const headers = Object.keys(clientsData[0]);
      csvRows.push(headers);

      clientsData.forEach((client) => {
        csvRows.push(headers.map((header) => client[header]));
      });
    } else {
      csvRows.push(["No client records found"]);
    }

    const csv = csvRows
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    // UTF-8 BOM helps Excel display the CSV correctly
    const csvWithBOM = "\uFEFF" + csv;

    const filename = `clients_${selectedYear || "all-years"}_${
      selectedMonth || "all-months"
    }.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    return res.status(200).send(csvWithBOM);

  } catch (error) {
    console.error("Export CSV error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to export client data",
    });
  }
};