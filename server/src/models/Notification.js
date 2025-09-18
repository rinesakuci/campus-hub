const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userId: { type: Number, required: false },
  title: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", NotificationSchema);