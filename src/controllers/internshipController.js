import Internship from "../models/Internship.js";
import asyncHandler from "express-async-handler";

// @desc   Create a new internship
// @route  POST /api/internship
// @access Private (admin)
const createInternship = asyncHandler(async (req, res) => {
  const {
    title,
    duration,
    techStack,
    role,
    tools,
    benefits,
    company,
    workMode,
    description,
    project,
    stipend,
    location,
    internshipType,
    deadline,
    skillsRequired,
    experience,
    openings,
    paid,
  } = req.body;

  if (!title || !duration || !techStack || !role || !tools) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const internship = await Internship.create({
    title,
    duration,
    techStack,
    role,
    tools,
    benefits,
    company,
    workMode,
    description,
    project,
    stipend,
    location,
    internshipType,
    deadline,
    skillsRequired,
    experience,
    openings,
    paid,
    createdBy: req.admin._id,
  });

  res.status(201).json(internship);
});

// @desc   Get all internships (admin view)
// @route  GET /api/internship
// @access Private (admin)
const getInternships = asyncHandler(async (req, res) => {
  const internships = await Internship.find().sort({ createdAt: -1 });
  res.json(internships);
});

// @desc   Get all internships (public/student view)
// @route  GET /api/internship/public
// @access Public
const getPublicInternships = asyncHandler(async (req, res) => {
  const internships = await Internship.find().sort({ createdAt: -1 });
  res.json(internships);
});

// @desc   Get single internship
// @route  GET /api/internship/:id
// @access Private (admin)
const getInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) {
    res.status(404);
    throw new Error("Internship not found");
  }
  res.json(internship);
});

// @desc   Update an internship
// @route  PUT /api/internship/:id
// @access Private (admin)
const updateInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) {
    res.status(404);
    throw new Error("Internship not found");
  }

  const {
    title,
    duration,
    techStack,
    role,
    tools,
    benefits,
    company,
    workMode,
    description,
    stipend,
    location,
    internshipType,
    deadline,
    skillsRequired,
    experience,
    openings,
    paid,
  } = req.body;

  internship.title = title || internship.title;
  internship.duration = duration || internship.duration;
  internship.techStack = techStack || internship.techStack;
  internship.role = role || internship.role;
  internship.tools = tools || internship.tools;
  internship.benefits = benefits || internship.benefits;
  internship.company = company || internship.company;
  internship.workMode = workMode || internship.workMode;
  internship.description = description || internship.description;
  internship.project = typeof project === "string" && project.length > 0 ? project : internship.project;
  internship.stipend = stipend || internship.stipend;
  internship.location = location || internship.location;
  internship.internshipType = internshipType || internship.internshipType;
  internship.deadline = deadline || internship.deadline;
  internship.skillsRequired = skillsRequired || internship.skillsRequired;
  internship.experience = typeof experience === "number" ? experience : internship.experience;
  internship.openings = typeof openings === "number" ? openings : internship.openings;
  internship.paid = typeof paid === "boolean" ? paid : internship.paid;

  const updatedInternship = await internship.save();
  res.json(updatedInternship);
});

// @desc   Delete an internship
// @route  DELETE /api/internship/:id
// @access Private (admin)
const deleteInternship = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(400);
    throw new Error("Invalid internship id");
  }

  // Delete using findByIdAndDelete
  const deleted = await Internship.findByIdAndDelete(id);

  if (!deleted) {
    res.status(404);
    throw new Error("Internship not found");
  }

  res.json({ message: "Internship removed", internshipId: id });
});

export {
  createInternship,
  getInternships,
  getPublicInternships,
  getInternship,
  updateInternship,
  deleteInternship,
};
