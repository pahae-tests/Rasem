import { requireAdmin } from "../../../../lib/auth";
import { query, queryOne } from "../../../../lib/db";

async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { page = "1", status = "", search = "" } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limit = 20;
  const offset = (pageNum - 1) * limit;

  const conditions = [];
  const params = [];

  if (status) {
    conditions.push("o.status = ?");
    params.push(status);
  }
  if (search) {
    conditions.push("(u.name LIKE ? OR u.email LIKE ? OR d.title LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRow = await queryOne(
    `SELECT COUNT(*) as total FROM orders o
     JOIN users u ON o.user_id = u.id
     JOIN drawings d ON o.drawing_id = d.id
     ${where}`,
    params
  );

  const rows = await query(
    `SELECT o.id, o.status, o.price_snapshot, o.customer_name, o.customer_phone,
            o.city, o.address, o.notes, o.cancel_reason, o.created_at, o.updated_at,
            u.name as client_name, u.email as client_email,
            d.id as drawing_id, d.title as drawing_title
     FROM orders o
     JOIN users u ON o.user_id = u.id
     JOIN drawings d ON o.drawing_id = d.id
     ${where}
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return res.status(200).json({
    orders: rows,
    total: countRow.total,
    totalPages: Math.ceil(countRow.total / limit),
  });
}

export default requireAdmin(handler);
