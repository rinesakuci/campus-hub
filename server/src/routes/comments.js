const { Router } = require("express");
const Comment = require("../models/Comment");
const { authRequired, requireRole } = require("../middlewares/auth");

const r = Router();

r.get("/", authRequired, async (req, res) => {
  const { entityType, entityId } = req.query;
  if (!entityType || !entityId) {
    return res.status(400).json({ error: "entityType dhe entityId kërkohen" });
  }

  const items = await Comment.find({
    entityType,
    entityId: Number(entityId)
  })
    .sort({ createdAt: -1 })
    .limit(100);

  res.json(items);
});

r.post("/", authRequired, requireRole(["student", "admin"]), async (req, res) => {
  const { entityType, entityId, text } = req.body;
  if (!entityType || !entityId || !text?.trim()) {
    return res.status(400).json({ error: "entityType, entityId dhe text kërkohen" });
  }

  const doc = await Comment.create({
    entityType,
    entityId: Number(entityId),
    text: text.trim(),
    userId: req.user.id,
    authorName: req.user.fullName
  });

  res.json(doc);
});

r.delete("/:id", authRequired, async (req, res) => {
  const id = req.params.id;

  const doc = await Comment.findById(id);
  if (!doc) return res.status(404).json({ error: "Koment nuk u gjet" });

  const isOwner = doc.userId === req.user.id;
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: "Nuk keni leje për të fshirë këtë koment" });
  }

  await Comment.findByIdAndDelete(id);
  res.json({ ok: true });
});

module.exports = r;