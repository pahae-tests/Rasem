import { query, queryOne } from "../../../lib/db";
import { signToken } from "../../../lib/auth";
import { isValidEmail, sanitizeString } from "../../../lib/validate";
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, password, phone } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: "جميع الحقول المطلوبة يجب ملؤها" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "صيغة البريد الإلكتروني غير صحيحة" });
  }

  const cleanName = sanitizeString(name);
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone ? sanitizeString(phone) : null;

  const existing = await queryOne("SELECT id FROM users WHERE email = ?", [cleanEmail]);
  if (existing) {
    return res.status(409).json({ error: "هذا البريد الإلكتروني مستخدم بالفعل" });
  }

  const result = await query(
    "INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'client')",
    [cleanName, cleanEmail, cleanPhone, password]
  );

  const userId = result.insertId;
  const token = signToken({ id: userId, email: cleanEmail, role: "client", name: cleanName });

  res.setHeader(
    "Set-Cookie",
    serialize("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    })
  );

  return res.status(201).json({
    user: { id: userId, name: cleanName, email: cleanEmail, role: "client" },
    token,
  });
}
