import { requireAuth } from "../../lib/auth";
import { query, queryOne } from "../../lib/db";
import { sanitizeString, isValidEmail } from "../../lib/validate";

async function handler(req, res) {
  if (req.method !== "PUT") return res.status(405).end();

  const { name, email, phone, currentPassword, newPassword } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: "الاسم والبريد الإلكتروني مطلوبان" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "صيغة البريد الإلكتروني غير صحيحة" });
  }

  const user = await queryOne("SELECT id, password_hash FROM users WHERE id = ?", [req.user.id]);
  if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

  const conflict = await queryOne(
    "SELECT id FROM users WHERE email = ? AND id != ?",
    [email.trim().toLowerCase(), req.user.id]
  );
  if (conflict) return res.status(409).json({ error: "هذا البريد الإلكتروني مستخدم بالفعل" });

  if (newPassword) {
    if (!currentPassword) return res.status(400).json({ error: "كلمة المرور الحالية مطلوبة" });
    if (user.password_hash !== currentPassword) return res.status(400).json({ error: "كلمة المرور الحالية غير صحيحة" });
    await query(
      "UPDATE users SET name = ?, email = ?, phone = ?, password_hash = ? WHERE id = ?",
      [sanitizeString(name), email.trim().toLowerCase(), phone ? sanitizeString(phone) : null, newPassword, req.user.id]
    );
  } else {
    await query(
      "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?",
      [sanitizeString(name), email.trim().toLowerCase(), phone ? sanitizeString(phone) : null, req.user.id]
    );
  }

  return res.status(200).json({ success: true });
}

export default requireAuth(handler);
