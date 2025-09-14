const jwt = require("jsonwebtoken");


function authRequired(req, res, next){
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
    if(!token) return res.status(401).json({ error: "Missing access token" });
        try{
            const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.user = { id: payload.id, role: payload.role, fullName: payload.fullName };
            next();
        }catch(e){
            return res.status(401).json({ error: "Invalid/expired access token" });
        }
}


function requireRole(role){
    return (req,res,next)=>{
    if(!req.user) return res.status(401).json({ error: "Unauthenticated" });
    const ok = Array.isArray(role) ? role.includes(req.user.role) : req.user.role===role;
    if(!ok) return res.status(403).json({ error: "Forbidden" });
        next();
    };
}


module.exports = { authRequired, requireRole };