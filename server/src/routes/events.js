const { Router } = require("express");
const { prisma } = require("../db/prisma");
const { requireRole } = require("../middlewares/auth");
const r = Router();

r.get("/", async (req, res) => {
  const { courseId } = req.query;
  const where = {};
  if (courseId) where.courseId = Number(courseId);
  const events = await prisma.event.findMany({ where, orderBy: { date: "asc" } });
  res.json(events);
});

r.post("/", requireRole("admin"), async (req, res) => {
  const { title, description, date, location, courseId } = req.body;
  if (!title || !date) return res.status(400).json({ error: "title dhe date janë të detyrueshme" });
  const event = await prisma.event.create({ data: { title, description, date: new Date(date), location, courseId } });
  res.json(event);
});

r.put("/:id", requireRole("admin"), async (req,res)=>{
  const id = Number(req.params.id);
  const { title, description, date, location, courseId } = req.body;
  const updated = await prisma.event.update({ where:{ id }, data:{ title, description, date:new Date(date), location, courseId } });
  res.json(updated);
});

r.delete("/:id", requireRole("admin"), async (req,res)=>{
  const id = Number(req.params.id);
  await prisma.event.delete({ where:{ id } });
  res.json({ ok:true });
});

module.exports = r;