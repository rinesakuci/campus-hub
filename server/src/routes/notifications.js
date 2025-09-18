const { Router } = require("express");
const Notification = require("../models/Notification");
const r = Router();

r.get("/", async (req, res) => {
  const userId = req.user?.id;
  const q = userId ? { $or: [{ userId }, { userId: { $exists: false } }, { userId: null }] } : { userId: { $exists: false } };
  const items = await Notification.find(q).sort({ createdAt: -1 }).limit(50);
  res.json(items);
});

module.exports = r;