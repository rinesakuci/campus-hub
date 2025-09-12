const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  entityType: { type: String, enum: ["event", "assignment"], required: true },
  entityId: { type: Number, required: true },
  author: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Comment", CommentSchema);