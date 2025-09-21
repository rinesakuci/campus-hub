const { Router } = require("express");
const { prisma } = require("../db/prisma");
const { requireRole } = require("../middlewares/auth");
const r = Router();

r.get("/", async (req, res) => {
  const days = Number(req.query.days || 30);
  const now = new Date();
  const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

 const items = await prisma.assignment.findMany({
    where: { dueAt: { lte: until } },
    orderBy: { dueAt: "asc" },
    include: { course: { select: { id: true, name: true, code: true } } }
  });

  res.json(items);
});

r.post("/", requireRole("admin"), async (req, res) => {
  const { title, description, dueAt, courseId } = req.body;
  if (!title || !dueAt || !courseId)
    return res.status(400).json({ error: "title, dueAt, courseId kërkohen" });

  const it = await prisma.assignment.create({
    data: { title, description, dueAt: new Date(dueAt), courseId },
  });
  res.json(it);
});

r.get("/:id", async (req,res)=>{
  const id = Number(req.params.id);
  const a = await prisma.assignment.findUnique({
    where: { id },
    include: { course: { select: { id: true, name: true, code: true } } }
  });
  if(!a) return res.status(404).json({ error: "Assignment not found" });
  res.json(a);
});

r.delete("/:id", requireRole("admin"), async (req,res)=>{
  const id = Number(req.params.id);
  await prisma.assignment.delete({ where: { id } });
  res.json({ ok: true });
});


module.exports = r;