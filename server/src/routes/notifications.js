const { Router } = require("express");
const Notification = require("../models/Notification");
const { requireRole } = require("../middlewares/auth");
const r = Router();

r.get("/", async (req, res) => {
  const userId = req.user?.id;
  const days = Math.max(1, Number(req.query.days || 20));
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const audience = [{ userId: null }, { userId: { $exists: false } }];
  if (userId) audience.push({ userId });

  const items = await Notification.find({
    $and: [
      { $or: audience },
      { createdAt: { $gte: cutoff } },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(50);
    
  res.json(items);
});

r.post("/", requireRole("admin"), async (req, res) => {
  const { title, message, userId } = req.body;
  if (!title || !message) return res.status(400).json({ error: "title dhe message kërkohen" });
  const it = await Notification.create({ title, message, userId: userId ?? null });
  res.json(it);
});

r.delete('/:id', requireRole('admin'), async (req,res)=>{
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = r;