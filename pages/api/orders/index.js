import { requireAuth } from "../../../lib/auth";
import { query, queryOne } from "../../../lib/db";
import { sanitizeString } from "../../../lib/validate";

async function handler(req, res) {
  if (req.method === "GET") {
    const rows = await query(
      `SELECT o.id, o.status, o.price_snapshot, o.city, o.customer_name,
              o.created_at, o.cancel_reason,
              d.id as drawing_id, d.title as drawing_title
       FROM orders o
       JOIN drawings d ON o.drawing_id = d.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    return res.status(200).json({ orders: rows });
  }

  if (req.method === "POST") {
    const { drawing_id, customer_name, customer_phone, address, city, notes } = req.body || {};

    if (!drawing_id || !customer_name || !customer_phone || !address || !city) {
      return res.status(400).json({ error: "جميع الحقول المطلوبة يجب ملؤها" });
    }

    const drawing = await queryOne(
      "SELECT id, price, is_available, stock FROM drawings WHERE id = ?",
      [parseInt(drawing_id)]
    );

    if (!drawing) return res.status(404).json({ error: "الرسم غير موجود" });
    if (!drawing.is_available || drawing.stock < 1) {
      return res.status(400).json({ error: "هذا الرسم غير متاح حالياً" });
    }

    const result = await query(
      `INSERT INTO orders
       (user_id, drawing_id, customer_name, customer_phone, address, city, notes, price_snapshot, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        req.user.id,
        drawing.id,
        sanitizeString(customer_name),
        sanitizeString(customer_phone),
        sanitizeString(address),
        sanitizeString(city),
        notes ? sanitizeString(notes) : null,
        drawing.price,
      ]
    );

    await query("UPDATE drawings SET total_orders = total_orders + 1 WHERE id = ?", [drawing.id]);

    return res.status(201).json({ orderId: result.insertId, success: true });
  }

  return res.status(405).end();
}

export default requireAuth(handler);
