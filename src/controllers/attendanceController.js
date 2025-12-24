import Attendance from "../models/Attendance.js";
import MyDbUser from "../models/MyDbUser.js";

// Get attendance records
export const getAttendanceRecords = async (req, res) => {
  try {
    const records = await Attendance.find({})
      .populate('intern', 'name email')
      .sort({ date: -1 })
      .lean();
    
    // Convert dates to ISO strings for frontend
    const formattedRecords = records.map(record => ({
      ...record,
      date: record.date.toISOString().split('T')[0]
    }));
    
    res.status(200).json(formattedRecords);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance records", error: error.message });
  }
};

// Get all interns
export const getAllUsers = async (req, res) => {
  try {
    const users = await MyDbUser.find({}).select("name email").sort({ name: 1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

// Mark or update attendance
export const markAttendance = async (req, res) => {
  try {
    const { intern, date, status } = req.body;

    if (!intern || !date || !status) {
      return res.status(400).json({ message: "Please provide intern, date, and status" });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    let record = await Attendance.findOne({ intern, date: attendanceDate });

    if (record) {
      record.status = status;
      await record.save();
      return res.status(200).json({ message: "Attendance updated", data: record });
    }

    const newRecord = await Attendance.create({
      intern,
      date: attendanceDate,
      status,
    });

    res.status(201).json({ message: "Attendance marked", data: newRecord });
  } catch (error) {
    res.status(500).json({ message: "Error marking attendance", error: error.message });
  }
};

// Get attendance for specific date
export const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const records = await Attendance.find({
      date: { $gte: start, $lte: end },
    });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance", error: error.message });
  }
};

// Get attendance by intern
export const getAttendanceByIntern = async (req, res) => {
  try {
    const { internId } = req.params;

    const records = await Attendance.find({ intern: internId }).sort({ date: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance", error: error.message });
  }
};

// Get attendance statistics
export const getAttendanceStats = async (req, res) => {
  try {
    const { period } = req.params;
    
    let startDate = new Date();
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const stats = await Attendance.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance stats", error: error.message });
  }
};

// Get total number of unique students in attendance list
export const getAttendanceRecordsCount = async (req, res) => {
  try {
    // Import Application model to get approved students
    const Application = (await import("../../models/Application.js")).default;
    
    // Get students with approved applications
    const approvedApplications = await Application.find({ status: 'Approved' });
    const approvedStudentIds = approvedApplications.map(app => app.studentId);
    
    // Get attendance records for approved students only
    const attendanceRecords = await Attendance.find({
      intern: { $in: approvedStudentIds }
    }).distinct('intern');
    
    // Get the actual user details for these interns
    const users = await MyDbUser.find({ 
      _id: { $in: attendanceRecords } 
    }).select('name email');

    res.status(200).json({
      totalAttendance: users.length,
      students: users
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance count", error: error.message });
  }
};

// Date range summary
export const getAttendanceSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const records = await Attendance.find({
      date: { $gte: start, $lte: end },
    });

    res.status(200).json({
      totalRecords: records.length,
      present: records.filter((r) => r.status === "Present").length,
      absent: records.filter((r) => r.status === "Absent").length,
      records,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching summary", error: error.message });
  }
};
