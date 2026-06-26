import jwt from "jsonwebtoken";
import { parse } from "cookie";

const SECRET = process.env.JWT_SECRET || "rasem_secret_key_change_me";

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req) {
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const cookies = parse(req.headers.cookie || "");
  return cookies.token || null;
}

export function getUserFromRequest(req) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(handler) {
  return async (req, res) => {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: "غير مصرح لك بالوصول" });
    }
    req.user = user;
    return handler(req, res);
  };
}

export function requireAdmin(handler) {
  return async (req, res) => {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: "غير مصرح لك بالوصول" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ error: "صلاحيات غير كافية" });
    }
    req.user = user;
    return handler(req, res);
  };
}
