const { Router } = require("express");
const { prisma } = require("../db/prisma");
const { requireRole } = require("../middlewares/auth");

const r = Router();

r.get("/", async (req, res) => {
  const { courseId } = req.query;
  const where = {};
  if (courseId) {
    const cid = Number(courseId);
    if (!Number.isFinite(cid)) return res.status(400).json({ error: "courseId jo valid" });
    where.courseId = cid;
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { date: "asc" },
    include: { course: { select: { id: true, name: true, code: true } } }
  });

  res.json(events);
});

r.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "id jo valid" });

  const event = await prisma.event.findUnique({
    where: { id },
    include: { course: { select: { id: true, name: true, code: true } } }
  });

  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json(event);
});

r.post("/", requireRole("admin"), async (req, res) => {
  const { title, description, date, location, courseId } = req.body;
  if (!title || !date) return res.status(400).json({ error: "title dhe date janë të detyrueshme" });

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return res.status(400).json({ error: "date jo valide" });

  let data = { title, description, date: parsedDate, location };
  if (courseId !== undefined && courseId !== null) {
    const cid = Number(courseId);
    if (!Number.isFinite(cid)) return res.status(400).json({ error: "courseId jo valid" });
    data.courseId = cid;
  }

  const event = await prisma.event.create({ data });
  res.json(event);
});

r.put("/:id", requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "id jo valid" });

  const { title, description, date, location, courseId } = req.body;

  const data = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (location !== undefined) data.location = location;
  if (date !== undefined) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return res.status(400).json({ error: "date jo valide" });
    data.date = parsedDate;
  }
  if (courseId !== undefined) {
    const cid = courseId === null ? null : Number(courseId);
    if (cid !== null && !Number.isFinite(cid)) return res.status(400).json({ error: "courseId jo valid" });
    data.courseId = cid;
  }

  const updated = await prisma.event.update({ where: { id }, data });
  res.json(updated);
});

r.delete("/:id", requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "id jo valid" });

  await prisma.event.delete({ where: { id } });
  res.json({ ok: true });
});

module.exports = r;