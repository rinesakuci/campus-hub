const { Router } = require("express");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const { prisma } = require("../db/prisma");
const { signAccess, newRefreshValue, hashToken, refreshCookieOptions } = require("../utils/tokens");

const r = Router();
r.use(cookieParser());

// helper: issue refresh (rotate) + return access
async function issueTokens(res, user, replaceHash){
  const accessToken = signAccess(user);
  const value = newRefreshValue();
  const tokenHash = hashToken(value);
  const ttlDays = Number(process.env.REFRESH_TOKEN_TTL_DAYS||7);
  const expiresAt = new Date(Date.now() + ttlDays*24*60*60*1000);

  // revoke old (if provided)
  if(replaceHash){
    await prisma.refreshToken.updateMany({
      where: { tokenHash: replaceHash, userId: user.id, revokedAt: null },
      data: { revokedAt: new Date(), replacedByToken: tokenHash }
    });
  }

  await prisma.refreshToken.create({ data: { userId: user.id, tokenHash, expiresAt } });
  res.cookie("refresh_token", value, refreshCookieOptions());
  return accessToken;
}

r.post("/register", async (req,res)=>{
  const { fullName, email, password, role } = req.body;
  if(!fullName || !email || !password) return res.status(400).json({ error: "Missing fields" });
  const exists = await prisma.user.findUnique({ where: { email } });
  if(exists) return res.status(409).json({ error: "Email exists" });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { fullName, email, password: hash, role: role||"student" } });
  res.json({ id: user.id });
});

r.post("/login", async (req,res)=>{
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if(!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(401).json({ error: "Invalid credentials" });
  const accessToken = await issueTokens(res, user);
  res.json({ accessToken, user: { id:user.id, fullName:user.fullName, email:user.email, role:user.role } });
});

r.post("/refresh", async (req,res)=>{
  const value = req.cookies?.refresh_token;
  if(!value) return res.status(401).json({ error: "Missing refresh" });
  const tokenHash = hashToken(value);
  const record = await prisma.refreshToken.findFirst({ where: { tokenHash, revokedAt: null } });
  if(!record || record.expiresAt < new Date()) return res.status(401).json({ error: "Invalid refresh" });
  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  if(!user) return res.status(401).json({ error: "Invalid user" });
  const accessToken = await issueTokens(res, user, tokenHash); // rotate
  res.json({ accessToken, user: { id:user.id, fullName:user.fullName, email:user.email, role:user.role } });
});

r.post("/logout", async (req,res)=>{
  const value = req.cookies?.refresh_token;
  if(value){
    const tokenHash = hashToken(value);
    await prisma.refreshToken.updateMany({ where:{ tokenHash, revokedAt: null }, data:{ revokedAt: new Date() } });
  }
  res.clearCookie("refresh_token", refreshCookieOptions());
  res.json({ ok: true });
});

module.exports = r;