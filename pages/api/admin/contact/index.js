import { requireAdmin } from "../../../../lib/auth";
import { query, queryOne } from "../../../../lib/db";

async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { page = "1", unread = "" } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limit = 20;
  const offset = (pageNum - 1) * limit;

  const conditions = [];
  const params = [];
  if (unread === "1") { conditions.push("is_read = 0"); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRow = await queryOne(`SELECT COUNT(*) as total FROM contact_messages ${where}`, params);
  const rows = await query(
    `SELECT id, name, email, subject, message, is_read, created_at
     FROM contact_messages ${where}
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return res.status(200).json({
    messages: rows,
    total: countRow.total,
    totalPages: Math.ceil(countRow.total / limit),
  });
}

export default requireAdmin(handler);
