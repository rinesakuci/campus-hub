const { Router } = require("express");
const { prisma } = require("../db/prisma");
const r = Router();

r.get("/", async (req, res) => {
  const where = {};
  if (req.query.courseId) where.courseId = Number(req.query.courseId);
  const events = await prisma.event.findMany({ where, orderBy: { date: "asc" } });
  res.json(events);
});

r.post("/", async (req, res) => {
  const { title, description, date, location, courseId } = req.body;
  if (!title || !date) return res.status(400).json({ error: "title dhe date janë të detyrueshme" });
  const event = await prisma.event.create({
    data: { title, description, date: new Date(date), location, courseId }
  });
  res.json(event);
});

module.exports = r;