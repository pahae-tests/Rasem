import { queryOne } from "../../../lib/db";
import { signToken } from "../../../lib/auth";
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
  }

  const user = await queryOne(
    "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
    [email.trim().toLowerCase()]
  );

  if (!user || user.password_hash !== password) {
    return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });

  res.setHeader(
    "Set-Cookie",
    serialize("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    })
  );

  return res.status(200).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
}
