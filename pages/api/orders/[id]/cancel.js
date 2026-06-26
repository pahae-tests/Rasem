import { requireAuth } from "../../../../lib/auth";
import { queryOne, query } from "../../../../lib/db";

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const orderId = parseInt(req.query.id);
  if (isNaN(orderId)) return res.status(400).json({ error: "معرف غير صحيح" });

  const order = await queryOne(
    "SELECT id, user_id, status FROM orders WHERE id = ?",
    [orderId]
  );

  if (!order) return res.status(404).json({ error: "الطلب غير موجود" });
  if (order.user_id !== req.user.id) return res.status(403).json({ error: "غير مصرح" });
  if (order.status !== "pending") {
    return res.status(400).json({ error: "لا يمكن إلغاء الطلب بعد التأكيد" });
  }

  await query(
    "UPDATE orders SET status = 'cancelled', cancel_reason = ? WHERE id = ?",
    ["إلغاء من قِبل العميل", orderId]
  );

  return res.status(200).json({ success: true });
}

export default requireAuth(handler);
