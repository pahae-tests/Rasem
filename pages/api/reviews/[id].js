import { requireAuth } from "../../../lib/auth";
import { queryOne, query } from "../../../lib/db";

async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();

  const reviewId = parseInt(req.query.id);
  if (isNaN(reviewId)) return res.status(400).json({ error: "معرف غير صحيح" });

  const review = await queryOne("SELECT id, user_id, drawing_id FROM reviews WHERE id = ?", [reviewId]);
  if (!review) return res.status(404).json({ error: "التقييم غير موجود" });
  if (review.user_id !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "غير مصرح" });
  }

  const drawingId = review.drawing_id;
  await query("DELETE FROM reviews WHERE id = ?", [reviewId]);

  await query(
    `UPDATE drawings SET
       average_rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE drawing_id = ?), 0),
       review_count   = (SELECT COUNT(*) FROM reviews WHERE drawing_id = ?)
     WHERE id = ?`,
    [drawingId, drawingId, drawingId]
  );

  return res.status(200).json({ success: true });
}

export default requireAuth(handler);
