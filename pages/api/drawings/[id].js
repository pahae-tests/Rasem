import { queryOne, query } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { id } = req.query;
  const drawingId = parseInt(id);
  if (isNaN(drawingId)) return res.status(400).json({ error: "معرف غير صحيح" });

  const drawing = await queryOne(
    `SELECT d.id, d.title, d.description, d.price, d.stock, d.is_available,
            d.average_rating, d.review_count, d.total_orders, d.created_at,
            c.name as category_name, c.slug as category_slug
     FROM drawings d
     LEFT JOIN categories c ON d.category_id = c.id
     WHERE d.id = ?`,
    [drawingId]
  );

  if (!drawing) return res.status(404).json({ error: "الرسم غير موجود" });

  const gallery = await query(
    "SELECT id, sort_order FROM drawing_gallery WHERE drawing_id = ? ORDER BY sort_order ASC",
    [drawingId]
  );

  const reviews = await query(
    `SELECT r.id, r.rating, r.comment, r.created_at, r.updated_at,
            u.name as user_name
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.drawing_id = ?
     ORDER BY r.created_at DESC`,
    [drawingId]
  );

  const similar = await query(
    `SELECT d.id, d.title, d.price, d.average_rating, d.review_count
     FROM drawings d
     WHERE d.category_id = (SELECT category_id FROM drawings WHERE id = ?)
       AND d.id != ? AND d.is_available = 1
     ORDER BY d.total_orders DESC LIMIT 4`,
    [drawingId, drawingId]
  );

  return res.status(200).json({ drawing, gallery, reviews, similar });
}
