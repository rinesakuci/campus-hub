require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { prisma } = require("./db/prisma");
const { connectMongo } = require("./db/mongo");
const { authRequired, requireRole } = require("./middlewares/auth");

const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const eventRoutes = require("./routes/events");
const commentRoutes = require("./routes/comments");

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

app.get("/health", (_, res) => res.json({ ok: true }));
app.use("/auth", authRoutes);

// Më poshtë: kërkohet access token
app.use(authRequired);
app.use("/courses", courseRoutes);
app.use("/events", eventRoutes);
app.use("/comments", commentRoutes);

const PORT = Number(process.env.PORT || 5000);

(async function main() {
  await connectMongo(process.env.MONGO_URI);
  await prisma.$connect();
  app.listen(PORT, () => console.log(`API running on :${PORT}`));
})().catch((e) => { console.error(e); process.exit(1); });