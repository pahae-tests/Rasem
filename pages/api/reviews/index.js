import { requireAuth } from "../../../lib/auth";
import { queryOne, query } from "../../../lib/db";
import { sanitizeString } from "../../../lib/validate";

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { drawing_id, rating, comment } = req.body || {};

  if (!drawing_id || !rating) {
    return res.status(400).json({ error: "معرف الرسم والتقييم مطلوبان" });
  }

  const ratingNum = parseInt(rating);
  if (ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: "التقييم يجب أن يكون بين 1 و 5" });
  }

  const order = await queryOne(
    `SELECT id FROM orders
     WHERE user_id = ? AND drawing_id = ? AND status IN ('confirmed','shipped','delivered')
     LIMIT 1`,
    [req.user.id, parseInt(drawing_id)]
  );

  if (!order) {
    return res.status(403).json({ error: "يمكن فقط للعملاء الذين اشتروا هذا الرسم إضافة تقييم" });
  }

  const existing = await queryOne(
    "SELECT id FROM reviews WHERE user_id = ? AND drawing_id = ?",
    [req.user.id, parseInt(drawing_id)]
  );

  if (existing) {
    await query(
      "UPDATE reviews SET rating = ?, comment = ? WHERE id = ?",
      [ratingNum, comment ? sanitizeString(comment) : null, existing.id]
    );
  } else {
    await query(
      "INSERT INTO reviews (user_id, drawing_id, order_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
      [
        req.user.id,
        parseInt(drawing_id),
        order.id,
        ratingNum,
        comment ? sanitizeString(comment) : null,
      ]
    );
  }

  await query(
    `UPDATE drawings SET
       average_rating = (SELECT AVG(rating) FROM reviews WHERE drawing_id = ?),
       review_count   = (SELECT COUNT(*) FROM reviews WHERE drawing_id = ?)
     WHERE id = ?`,
    [parseInt(drawing_id), parseInt(drawing_id), parseInt(drawing_id)]
  );

  return res.status(200).json({ success: true });
}

export default requireAuth(handler);
