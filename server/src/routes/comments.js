const { Router } = require("express");
const Comment = require("../models/Comment");
const r = Router();

r.get("/", async (req, res) => {
  const { entityType, entityId } = req.query;
  const items = await Comment.find({ entityType, entityId: Number(entityId) })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(items);
});

r.post("/", async (req, res) => {
  const { entityType, entityId, author, text } = req.body;
  if (!author || !text) return res.status(400).json({ error: "author dhe text janë të detyrueshme" });
  const item = await Comment.create({ entityType, entityId, author, text });
  res.json(item);
});

module.exports = r;