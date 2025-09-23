const { Router } = require("express");
const Notification = require("../models/Notification");
const { requireRole } = require("../middlewares/auth");

const r = Router();

r.get("/", async (req, res) => {
  const days = Math.max(1, Number(req.query.days || 30));
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const items = await Notification.find({ createdAt: { $gte: cutoff } })
    .sort({ createdAt: -1 })
    .limit(100);

  res.json(items);
});

r.post("/", requireRole("admin"), async (req, res) => {
  let { title, message } = req.body;
  title = (title || "").trim();
  message = (message || "").trim();
  if (!title || !message) return res.status(400).json({ error: "title dhe message kërkohen" });

  const doc = await Notification.create({
    title,
    message,
  });

  res.status(201).json(doc);
});

r.delete("/:id", requireRole("admin"), async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = r;