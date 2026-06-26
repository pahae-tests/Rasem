import { requireAdmin } from "../../../../lib/auth";
import { query, queryOne } from "../../../../lib/db";

async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();

  const userId = parseInt(req.query.id);
  if (isNaN(userId)) return res.status(400).json({ error: "معرف غير صحيح" });

  const user = await queryOne("SELECT id, role FROM users WHERE id = ?", [userId]);
  if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });
  if (user.role === "admin") return res.status(403).json({ error: "لا يمكن حذف مدير النظام" });

  await query("DELETE FROM users WHERE id = ?", [userId]);
  return res.status(200).json({ success: true });
}

export default requireAdmin(handler);
