import { database } from "../db/database.js";

export const getDashboardStats = async (franchiesId) => {
  try {
    // Total Clients for this franchise
    const [totalClientsResult] = await database.query(
      `SELECT COUNT(*) as totalClients FROM clients WHERE franchiesCode = ?`,
      [franchiesId],
    );
    const totalClients = totalClientsResult[0]?.totalClients || 0;

    // Total Clients last month for growth calculation
    const [lastMonthClientsResult] = await database.query(
      `SELECT COUNT(*) as lastMonthClients FROM clients 
       WHERE franchiesCode = ? 
       AND created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
       AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [franchiesId],
    );
    const lastMonthClients = lastMonthClientsResult[0]?.lastMonthClients || 1;
    const clientGrowth =
      totalClients > 0
        ? parseFloat(
            (
              ((totalClients - lastMonthClients) / lastMonthClients) *
              100
            ).toFixed(1),
          )
        : 0;

    // Today's Appointments (assuming appointments are tracked via clientType or a separate table)
    // If there's no appointments table, we'll count clients created today or use tattooDetails as proxy
    const [todayAppointmentsResult] = await database.query(
      `SELECT COUNT(*) as todayAppointments 
       FROM appointments WHERE franchiesCode = ? 
       AND DATE(created_at) = CURDATE()`,
      [franchiesId],
    );
    const todayAppointments =
      todayAppointmentsResult[0]?.todayAppointments || 0;

    // Today's appointments last month
    const [lastMonthAppointmentsResult] = await database.query(
      `SELECT COUNT(*) as lastMonthAppointments 
       FROM appointments 
       WHERE franchiesCode = ? 
       AND DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
      [franchiesId],
    );
    const lastMonthAppointments =
      lastMonthAppointmentsResult[0]?.lastMonthAppointments || 1;
    const appointmentGrowth =
      todayAppointments > 0
        ? parseFloat(
            (
              ((todayAppointments - lastMonthAppointments) /
                lastMonthAppointments) *
              100
            ).toFixed(1),
          )
        : 0;

    // Total Enquiries (count of clients with referralName or clientType = 'Enquiry')
    const [totalEnquiriesResult] = await database.query(
      `SELECT COUNT(*) as totalEnquiries FROM enquiry 
       WHERE franchiesCode = ? `,

      [franchiesId],
    );
    const totalEnquiries = totalEnquiriesResult[0]?.totalEnquiries || 0;

    // Enquiries last month
    const [lastMonthEnquiriesResult] = await database.query(
      `SELECT COUNT(*) as lastMonthEnquiries FROM enquiry 
       WHERE franchiesCode = ? 
       AND created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
       AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [franchiesId],
    );
    const lastMonthEnquiries =
      lastMonthEnquiriesResult[0]?.lastMonthEnquiries || 1;
    const enquiryGrowth =
      totalEnquiries > 0
        ? parseFloat(
            (
              ((totalEnquiries - lastMonthEnquiries) / lastMonthEnquiries) *
              100
            ).toFixed(1),
          )
        : 0;

    // Total Consultants (count of tattooArtists)
    const [totalArtistsResult] = await database.query(
      `SELECT COUNT(*) as totalConsultants FROM tattooArtists WHERE franchiesCode = ?`,
      [franchiesId],
    );
    const totalConsultants = totalArtistsResult[0]?.totalConsultants || 0;

    // Consultants last month
    const [lastMonthConsultantsResult] = await database.query(
      `SELECT COUNT(*) as lastMonthConsultants FROM tattooArtists 
       WHERE franchiesCode = ? 
       AND created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
       AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [franchiesId],
    );
    const lastMonthConsultants =
      lastMonthConsultantsResult[0]?.lastMonthConsultants || 1;
    const consultantGrowth =
      totalConsultants > 0
        ? parseFloat(
            (
              ((totalConsultants - lastMonthConsultants) /
                lastMonthConsultants) *
              100
            ).toFixed(1),
          )
        : 0;

    return {
      success: true,
      data: {
        totalClients: {
          count: totalClients,
          growth: `${clientGrowth >= 0 ? "+" : ""}${clientGrowth}%`,
          growthValue: clientGrowth,
          label: "last month",
        },
        todayAppointments: {
          count: todayAppointments,
          growth: `${appointmentGrowth >= 0 ? "+" : ""}${appointmentGrowth}%`,
          growthValue: appointmentGrowth,
          label: "last month",
        },
        totalEnquiries: {
          count: totalEnquiries,
          growth: `${enquiryGrowth >= 0 ? "+" : ""}${enquiryGrowth}%`,
          growthValue: enquiryGrowth,
          label: "last month",
        },
        totalConsultants: {
          count: totalConsultants,
          growth: `${consultantGrowth >= 0 ? "+" : ""}${consultantGrowth}%`,
          growthValue: consultantGrowth,
          label: "last month",
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getMonthlyClientGrowth = async (franchiesId) => {
  try {
    const monthlyData = [];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth() + 1;

      const [result] = await database.query(
        `SELECT COUNT(*) as activeClients FROM clients 
         WHERE franchiesCode = ? 
         AND YEAR(created_at) = ? 
         AND MONTH(created_at) = ?`,
        [franchiesId, year, month],
      );

      monthlyData.push({
        month: months[month - 1],
        activeClients: result[0]?.activeClients || 0,
      });
    }

    return {
      success: true,
      data: {
        title: "12-Month Client Growth",
        subtitle: "Monthly active clients",
        yoyGrowth: "+18% YoY",
        chartData: monthlyData,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getClientCalendar = async (
  franchiesId,
  month = null,
  year = null,
) => {
  try {
    // Set default to current month/year if not provided
    const today = new Date();
    const targetMonth = month !== null ? parseInt(month) : today.getMonth() + 1;
    const targetYear = year !== null ? parseInt(year) : today.getFullYear();

    // Validate month
    if (targetMonth < 1 || targetMonth > 12) {
      return {
        success: false,
        message: "Invalid month. Month should be between 1 and 12",
      };
    }

    // Get first and last day of the target month
    const firstDay = new Date(targetYear, targetMonth - 1, 1);
    const lastDay = new Date(targetYear, targetMonth, 0);

    // Get appointments for the entire month
    const [appointmentsResult] = await database.query(
      `SELECT 
        c.id as clientId,
        c.name as clientName,
        td.created_at as appointmentDate,
        td.tattoodetails as description,
        DAY(td.created_at) as dayOfMonth
      FROM tattoodetails td
      JOIN clients c ON td.clientId = c.id
      WHERE c.franchiesCode = ? 
      AND DATE(td.created_at) >= ?
      AND DATE(td.created_at) <= ?
      ORDER BY td.created_at ASC`,
      [
        franchiesId,
        firstDay.toISOString().split("T")[0],
        lastDay.toISOString().split("T")[0],
      ],
    );

    // Group by day
    const calendarData = {};
    appointmentsResult.forEach((apt) => {
      const day = apt.dayOfMonth;
      if (!calendarData[day]) {
        calendarData[day] = [];
      }
      calendarData[day].push({
        clientName: apt.clientName,
        description: apt.description || "Tattoo appointment",
      });
    });

    // Build calendar response for the entire month
    const calendarEvents = [];
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Get day of week for first day of month
    const firstDayOfWeek = new Date(targetYear, targetMonth - 1, 1).getDay();

    // Add empty days before first day of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarEvents.push({
        dayOfMonth: null,
        dayName: dayNames[i],
        appointments: [],
      });
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, targetMonth - 1, day);
      const dayName = dayNames[date.getDay()];

      calendarEvents.push({
        dayOfMonth: day,
        dayName: dayName,
        appointments: calendarData[day] || [],
      });
    }

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return {
      success: true,
      data: {
        title: "Client Calendar",
        subtitle: "Client meetings, tasks, and deadlines",
        month: monthNames[targetMonth - 1],
        year: targetYear,
        calendarEvents: calendarEvents,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getCompleteDashboard = async (franchiesId) => {
  try {
    const statsResponse = await getDashboardStats(franchiesId);
    const growthResponse = await getMonthlyClientGrowth(franchiesId);
    const calendarResponse = await getClientCalendar(franchiesId);

    if (
      !statsResponse.success ||
      !growthResponse.success ||
      !calendarResponse.success
    ) {
      return {
        success: false,
        message: "Error fetching dashboard data",
      };
    }

    return {
      success: true,
      data: {
        stats: statsResponse.data,
        monthlyGrowth: growthResponse.data,
        calendar: calendarResponse.data,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
