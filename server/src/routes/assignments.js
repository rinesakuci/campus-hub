const { Router } = require("express");
const { prisma } = require("../db/prisma");
const { requireRole } = require("../middlewares/auth");
const r = Router();

r.get("/", async (req, res) => {
  const days = Number(req.query.days || 30);
  const until = new Date(Date.now() + days*24*60*60*1000);
  const items = await prisma.assignment.findMany({
    where: { dueAt: { lte: until } },
    orderBy: { dueAt: "asc" }
  });
  res.json(items);
});

r.post("/", requireRole("admin"), async (req, res) => {
  const { title, description, dueAt, courseId } = req.body;
  if(!title || !dueAt || !courseId) return res.status(400).json({ error: "title, dueAt, courseId kërkohen" });
  const it = await prisma.assignment.create({ data: { title, description, dueAt: new Date(dueAt), courseId } });
  res.json(it);
});

module.exports = r;