import Application from "../models/Application.js";
import asyncHandler from "express-async-handler";

const createApplication = asyncHandler(async (req, res) => {
  const { internshipId, studentId, studentName, studentEmail, githubUrl, liveUrl } = req.body || {};

  if (!internshipId || !studentId || !githubUrl || !liveUrl) {
    res.status(400);
    throw new Error("internshipId, studentId, githubUrl and liveUrl are required");
  }

  let application = await Application.findOne({ internship: internshipId, studentId });

  if (application) {
    application.githubUrl = githubUrl;
    application.liveUrl = liveUrl;
    application.studentName = studentName || application.studentName;
    application.studentEmail = studentEmail || application.studentEmail;
    application.status = "Pending";
    application = await application.save();
    return res.json(application);
  }

  application = await Application.create({
    internship: internshipId,
    studentId,
    studentName,
    studentEmail,
    githubUrl,
    liveUrl,
  });

  res.status(201).json(application);
});

const getApplications = asyncHandler(async (req, res) => {
  const { status, internshipId, startDate, endDate, studentId } = req.query;

  let filter = {};

  if (status) filter.status = status;
  if (internshipId) filter.internship = internshipId;
  if (studentId) filter.studentId = studentId;
  if (startDate || endDate) filter.createdAt = {};
  if (startDate) filter.createdAt.$gte = new Date(startDate);
  if (endDate) filter.createdAt.$lte = new Date(endDate);

  const applications = await Application.find(filter)
    .populate("internship", "title role")
    .sort({ createdAt: -1 });

  res.json(applications);
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, feedback } = req.body; 
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  application.status = status;
  if (feedback !== undefined) {
    application.feedback = feedback;
  }
  const updatedApplication = await application.save();
  res.json(updatedApplication);
});

const getStudentApplications = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  if (!studentId) {
    res.status(400);
    throw new Error("studentId is required");
  }

  const applications = await Application.find({ studentId })
    .populate("internship", "title role")
    .sort({ createdAt: -1 });

  res.json(applications);
});

const getStudentsWithApprovedApplications = asyncHandler(async (req, res) => {
  // Get all approved applications with student details
  const applications = await Application.find({ status: "Approved" })
    .sort({ createdAt: -1 });

  // Get unique students
  const uniqueStudents = [];
  const seenStudentIds = new Set();

  for (const application of applications) {
    if (!seenStudentIds.has(application.studentId)) {
      seenStudentIds.add(application.studentId);
      uniqueStudents.push({
        _id: application.studentId,
        name: application.studentName,
        email: application.studentEmail,
        applicationId: application._id,
        internshipId: application.internship,
        approvedAt: application.updatedAt
      });
    }
  }

  res.json(uniqueStudents);
});

export { createApplication, getApplications, updateApplicationStatus, getStudentApplications, getStudentsWithApprovedApplications };
