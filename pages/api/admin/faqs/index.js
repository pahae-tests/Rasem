import { requireAdmin } from "../../../../lib/auth";
import { query, queryOne } from "../../../../lib/db";
import { sanitizeString } from "../../../../lib/validate";

async function handler(req, res) {
  if (req.method === "GET") {
    const rows = await query("SELECT id, question, answer, sort_order FROM faqs ORDER BY sort_order ASC");
    return res.status(200).json({ faqs: rows });
  }

  if (req.method === "POST") {
    const { question, answer } = req.body || {};
    if (!question || !answer) return res.status(400).json({ error: "السؤال والجواب مطلوبان" });
    const maxOrder = await queryOne("SELECT MAX(sort_order) as max FROM faqs");
    const nextOrder = (maxOrder.max || 0) + 1;
    const result = await query(
      "INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)",
      [sanitizeString(question), sanitizeString(answer), nextOrder]
    );
    return res.status(201).json({ id: result.insertId, success: true });
  }

  return res.status(405).end();
}

export default requireAdmin(handler);
