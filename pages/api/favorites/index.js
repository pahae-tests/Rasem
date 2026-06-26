import { requireAuth } from "../../../lib/auth";
import { query, queryOne } from "../../../lib/db";

async function handler(req, res) {
  if (req.method === "GET") {
    const rows = await query(
      `SELECT d.id, d.title, d.price, d.average_rating, d.review_count, d.is_available
       FROM favorites f
       JOIN drawings d ON f.drawing_id = d.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    return res.status(200).json({ favorites: rows });
  }

  if (req.method === "POST") {
    const { drawing_id } = req.body || {};
    if (!drawing_id) return res.status(400).json({ error: "معرف الرسم مطلوب" });

    const drawing = await queryOne("SELECT id FROM drawings WHERE id = ?", [parseInt(drawing_id)]);
    if (!drawing) return res.status(404).json({ error: "الرسم غير موجود" });

    const existing = await queryOne(
      "SELECT id FROM favorites WHERE user_id = ? AND drawing_id = ?",
      [req.user.id, parseInt(drawing_id)]
    );

    if (existing) {
      await query("DELETE FROM favorites WHERE id = ?", [existing.id]);
      return res.status(200).json({ action: "removed" });
    } else {
      await query(
        "INSERT INTO favorites (user_id, drawing_id) VALUES (?, ?)",
        [req.user.id, parseInt(drawing_id)]
      );
      return res.status(201).json({ action: "added" });
    }
  }

  return res.status(405).end();
}

export default requireAuth(handler);
