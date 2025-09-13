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