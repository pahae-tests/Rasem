import { query } from "../../lib/db";
import { isValidEmail, sanitizeString } from "../../lib/validate";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "جميع الحقول مطلوبة" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "صيغة البريد الإلكتروني غير صحيحة" });
  }

  await query(
    "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
    [sanitizeString(name), email.trim().toLowerCase(), sanitizeString(subject), sanitizeString(message)]
  );

  return res.status(201).json({ success: true });
}
