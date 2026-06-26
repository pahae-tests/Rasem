import { query } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const {
    page = "1",
    limit = "12",
    search = "",
    category = "",
    sort = "newest",
    minPrice = "",
    maxPrice = "",
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(48, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const conditions = ["d.is_available = 1"];
  const params = [];

  if (search) {
    conditions.push("(d.title LIKE ? OR d.description LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    conditions.push("c.slug = ?");
    params.push(category);
  }

  if (minPrice) {
    conditions.push("d.price >= ?");
    params.push(parseFloat(minPrice));
  }

  if (maxPrice) {
    conditions.push("d.price <= ?");
    params.push(parseFloat(maxPrice));
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const orderMap = {
    newest: "d.created_at DESC",
    oldest: "d.created_at ASC",
    price_asc: "d.price ASC",
    price_desc: "d.price DESC",
    popular: "d.total_orders DESC",
    rating: "d.average_rating DESC",
  };
  const orderBy = orderMap[sort] || orderMap.newest;

  const countRows = await query(
    `SELECT COUNT(*) as total FROM drawings d LEFT JOIN categories c ON d.category_id = c.id ${where}`,
    params
  );
  const total = countRows[0].total;

  const rows = await query(
    `SELECT d.id, d.title, d.price, d.stock, d.is_available, d.average_rating, d.review_count,
            d.total_orders, d.created_at, c.name as category_name, c.slug as category_slug
     FROM drawings d
     LEFT JOIN categories c ON d.category_id = c.id
     ${where}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    [...params, limitNum, offset]
  );

  return res.status(200).json({
    drawings: rows,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
}
