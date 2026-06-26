import { requireAdmin } from "../../../../lib/auth";
import { query, queryOne } from "../../../../lib/db";

async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { page = "1", search = "" } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limit = 20;
  const offset = (pageNum - 1) * limit;

  const params = [];
  let where = "WHERE role = 'client'";
  if (search) {
    where += " AND (name LIKE ? OR email LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  const countRow = await queryOne(`SELECT COUNT(*) as total FROM users ${where}`, params);
  const rows = await query(
    `SELECT id, name, email, phone, created_at,
            (SELECT COUNT(*) FROM orders WHERE user_id = users.id) as order_count
     FROM users ${where}
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return res.status(200).json({
    users: rows,
    total: countRow.total,
    totalPages: Math.ceil(countRow.total / limit),
  });
}

export default requireAdmin(handler);
