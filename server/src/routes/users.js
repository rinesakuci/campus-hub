const { Router } = require("express");
const bcrypt = require("bcrypt");
const { prisma } = require("../db/prisma");
const { requireRole } = require("../middlewares/auth");

const r = Router();

r.use(requireRole("admin"));

r.get("/", async (req, res) => {
  const q = (req.query.q || "").trim();
  const where = q
    ? {
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};
  const users = await prisma.user.findMany({
    where,
    orderBy: { id: "desc" },
    select: { id: true, fullName: true, email: true, role: true, createdAt: true },
  });
  res.json(users);
});


r.post("/", async (req, res) => {
  let { fullName, email, password, role } = req.body || {};
  fullName = (fullName || "").trim();
  email = (email || "").trim().toLowerCase();
  password = (password || "").trim();
  role = (role || "student").trim();

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "fullName, email, password janë të detyrueshme" });
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: "Ky email ekziston" });

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { fullName, email, password: hash, role },
    select: { id: true, fullName: true, email: true, role: true, createdAt: true },
  });
  res.status(201).json(user);
});


r.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { fullName, email, role } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(fullName !== undefined ? { fullName } : {}),
        ...(email !== undefined ? { email: String(email).toLowerCase() } : {}),
        ...(role !== undefined ? { role } : {}),
      },
      select: { id: true, fullName: true, email: true, role: true, createdAt: true },
    });
    res.json(user);
  } catch (e) {
    if (e?.code === "P2002") {
      return res.status(409).json({ error: "Email është i zënë" });
    }
    res.status(400).json({ error: "Përditësimi dështoi" });
  }
});


r.patch("/:id/password", async (req, res) => {
  const id = Number(req.params.id);
  const password = (req.body?.password || "").trim();
  if (!password) return res.status(400).json({ error: "password kërkohet" });
  const hash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id }, data: { password: hash } });
  res.json({ ok: true });
});


r.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.refreshToken.deleteMany({ where: { userId: id } }).catch(()=>{});
  await prisma.user.delete({ where: { id } });
  res.json({ ok: true });
});

module.exports = r;