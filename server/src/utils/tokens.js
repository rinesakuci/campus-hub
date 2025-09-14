const jwt = require("jsonwebtoken");
const crypto = require("crypto");

function minutes(n){ return n*60*1000; }
function days(n){ return n*24*60*60*1000; }

function signAccess(user){
  const ttl = Number(process.env.ACCESS_TOKEN_TTL_MIN||15);
  return jwt.sign({ id: user.id, role: user.role, fullName: user.fullName }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: `${ttl}m` });
}

function newRefreshValue(){
  return crypto.randomBytes(64).toString("hex");
}

function hashToken(v){
  return crypto.createHash("sha256").update(v).digest("hex");
}

function refreshCookieOptions(){
  const isProd = process.env.NODE_ENV === "production";
  const maxAge = days(Number(process.env.REFRESH_TOKEN_TTL_DAYS||7));
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/auth/refresh",
    maxAge
  };
}

module.exports = { signAccess, newRefreshValue, hashToken, refreshCookieOptions };