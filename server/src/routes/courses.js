const { Router } = require("express");
const { prisma } = require("../db/prisma");
const { requireRole } = require("../middlewares/auth");
const r = Router();

r.get("/", async (req, res) => {
  const data = await prisma.course.findMany({ orderBy: { id: "desc" } });
  res.json(data);
});

r.post("/", requireRole("admin"), async (req, res) => {
  const { name, code, description } = req.body;
  if (!name || !code) return res.status(400).json({ error: "name dhe code janë të detyrueshme" });
  const course = await prisma.course.create({ data: { name, code, description } });
  res.json(course);
});

r.put("/:id", requireRole("admin"), async (req,res)=>{
  const id = Number(req.params.id);
  const { name, code, description } = req.body;
  const updated = await prisma.course.update({ where:{ id }, data:{ name, code, description } });
  res.json(updated);
});

r.delete("/:id", requireRole("admin"), async (req,res)=>{
  const id = Number(req.params.id);
  await prisma.course.delete({ where:{ id } });
  res.json({ ok:true });
});

module.exports = r;