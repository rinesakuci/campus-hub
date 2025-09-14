const { Router } = require("express");
const Comment = require("../models/Comment");
const { requireRole } = require("../middlewares/auth");
const r = Router();

r.get("/", async (req, res) => {
  const { entityType, entityId } = req.query;
  const items = await Comment.find({ entityType, entityId: Number(entityId) })
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(items);
});

r.post("/", requireRole("student"), async (req, res) => {
  const { entityType, entityId, text } = req.body;
  if (!text) return res.status(400).json({ error: "text i detyrueshëm" });
  const item = await Comment.create({
    entityType,
    entityId,
    text,
    userId: req.user.id,
    authorName: req.user.fullName
  });
  res.json(item);
});

module.exports = r;