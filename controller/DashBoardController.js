import { 
  getDashboardStats, 
  getMonthlyClientGrowth, 
  getClientCalendar, 
  getCompleteDashboard 
} from "../services/dashboardService.js";

export const getDashboard = async (req, res) => {
  try {
    const franchiesId = req.user.franchiesId;

    if (!franchiesId) {
      return res.status(400).json({
        message: "Franchise ID is required"
      });
    }

    const response = await getCompleteDashboard(franchiesId);

    if (response.success) {
      return res.status(200).json({
        message: "Dashboard data retrieved successfully",
        data: response.data
      });
    } else {
      return res.status(500).json({
        message: response.message
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

export const getDashboardStats_API = async (req, res) => {
  try {
    const franchiesId = req.user.franchiesId;

    if (!franchiesId) {
      return res.status(400).json({
        message: "Franchise ID is required"
      });
    }

    const response = await getDashboardStats(franchiesId);

    if (response.success) {
      return res.status(200).json({
        message: "Dashboard stats retrieved successfully",
        data: response.data
      });
    } else {
      return res.status(500).json({
        message: response.message
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

export const getMonthlyGrowth = async (req, res) => {
  try {
    const franchiesId = req.user.franchiesId;

    if (!franchiesId) {
      return res.status(400).json({
        message: "Franchise ID is required"
      });
    }

    const response = await getMonthlyClientGrowth(franchiesId);

    if (response.success) {
      return res.status(200).json({
        message: "Monthly growth data retrieved successfully",
        data: response.data
      });
    } else {
      return res.status(500).json({
        message: response.message
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

export const getCalendar = async (req, res) => {
  try {
    const franchiesId = req.user.franchiesId;
    const { month, year } = req.query;

    if (!franchiesId) {
      return res.status(400).json({
        message: "Franchise ID is required"
      });
    }

    const response = await getClientCalendar(franchiesId, month, year);

    if (response.success) {
      return res.status(200).json({
        message: "Calendar data retrieved successfully",
        data: response.data
      });
    } else {
      return res.status(500).json({
        message: response.message
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};
