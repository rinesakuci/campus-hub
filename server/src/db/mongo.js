const mongoose = require("mongoose");
async function connectMongo(uri) {
  if (!uri) throw new Error("Missing MONGO_URI");
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(uri);
  }
}
module.exports = { connectMongo };