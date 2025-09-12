const { Router } = require("express");
const { prisma } = require("../db/prisma");
const r = Router();

r.get("/", async (req, res) => {
  const data = await prisma.course.findMany({ orderBy: { id: "desc" } });
  res.json(data);
});

r.post("/", async (req, res) => {
  const { name, code, description } = req.body;
  if (!name || !code) return res.status(400).json({ error: "name dhe code janë të detyrueshme" });
  const course = await prisma.course.create({ data: { name, code, description } });
  res.json(course);
});

module.exports = r;