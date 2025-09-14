const express = require("express");
const router = express.Router();
const { prisma } = require("../db/prisma");

router.get("/", async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany();
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});


router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: Number(id) },
    });
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch assignment details" });
  }
});


router.get("/by-course/:courseId", async (req, res) => {
  const { courseId } = req.params;
  try {
    const assignments = await prisma.assignment.findMany({
      where: { courseId: Number(courseId) },
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch assignments for course" });
  }
});

router.post("/", async (req, res) => {
  const { title, description, dueAt, courseId } = req.body;
  try {
    const newAssignment = await prisma.assignment.create({
      data: { title, description, dueAt, courseId },
    });
    res.status(201).json(newAssignment);
  } catch (error) {
    res.status(400).json({ error: "Failed to create assignment" });
  }
});

module.exports = router;