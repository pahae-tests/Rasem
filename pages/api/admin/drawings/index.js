import { requireAdmin } from "../../../../lib/auth";
import { query, queryOne } from "../../../../lib/db";
import { parseForm } from "../../../../lib/parse-form";
import { sanitizeString } from "../../../../lib/validate";

export const config = { api: { bodyParser: false } };

async function handler(req, res) {
  if (req.method === "GET") {
    const { page = "1", search = "" } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limit = 20;
    const offset = (pageNum - 1) * limit;

    const params = [];
    let where = "";
    if (search) {
      where = "WHERE title LIKE ?";
      params.push(`%${search}%`);
    }

    const countRow = await queryOne(`SELECT COUNT(*) as total FROM drawings ${where}`, params);
    const rows = await query(
      `SELECT d.id, d.title, d.price, d.stock, d.is_available, d.average_rating,
              d.review_count, d.total_orders, d.created_at,
              c.name as category_name
       FROM drawings d LEFT JOIN categories c ON d.category_id = c.id
       ${where}
       ORDER BY d.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.status(200).json({
      drawings: rows,
      total: countRow.total,
      totalPages: Math.ceil(countRow.total / limit),
    });
  }

  if (req.method === "POST") {
    const { fields, files } = await parseForm(req);
    const { title, description, price, stock, category_id, is_available } = fields;

    if (!title || !price) {
      return res.status(400).json({ error: "العنوان والسعر مطلوبان" });
    }

    const mainImage = files.main_image;
    if (!mainImage || !mainImage.buffer.length) {
      return res.status(400).json({ error: "الصورة الرئيسية مطلوبة" });
    }

    const result = await query(
      `INSERT INTO drawings
       (title, description, price, stock, category_id, is_available, main_image, main_image_mime)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sanitizeString(title),
        description ? sanitizeString(description) : null,
        parseFloat(price),
        parseInt(stock || "1"),
        category_id ? parseInt(category_id) : null,
        is_available === "0" ? 0 : 1,
        mainImage.buffer,
        mainImage.mimetype,
      ]
    );

    const drawingId = result.insertId;

    const galleryKeys = Object.keys(files).filter((k) => k.startsWith("gallery_"));
    for (let i = 0; i < galleryKeys.length; i++) {
      const file = files[galleryKeys[i]];
      if (file && file.buffer.length) {
        await query(
          "INSERT INTO drawing_gallery (drawing_id, image, image_mime, sort_order) VALUES (?, ?, ?, ?)",
          [drawingId, file.buffer, file.mimetype, i]
        );
      }
    }

    return res.status(201).json({ id: drawingId, success: true });
  }

  return res.status(405).end();
}

export default requireAdmin(handler);
