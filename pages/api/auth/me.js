import { getUserFromRequest } from "../../../lib/auth";
import { queryOne } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const payload = getUserFromRequest(req);
  if (!payload) return res.status(401).json({ error: "غير مصرح" });

  const user = await queryOne(
    "SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?",
    [payload.id]
  );

  if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

  return res.status(200).json({ user });
}
