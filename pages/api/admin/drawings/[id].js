import { requireAdmin } from "../../../../lib/auth";
import { query, queryOne } from "../../../../lib/db";
import { parseForm } from "../../../../lib/parse-form";
import { sanitizeString } from "../../../../lib/validate";

export const config = { api: { bodyParser: false } };

async function handler(req, res) {
  const drawingId = parseInt(req.query.id);
  if (isNaN(drawingId)) return res.status(400).json({ error: "معرف غير صحيح" });

  if (req.method === "PUT") {
    const { fields, files } = await parseForm(req);
    const { title, description, price, stock, category_id, is_available } = fields;

    if (!title || !price) {
      return res.status(400).json({ error: "العنوان والسعر مطلوبان" });
    }

    const mainImage = files.main_image;
    const hasNewMainImage = mainImage && mainImage.buffer && mainImage.buffer.length > 0;

    if (hasNewMainImage) {
      await query(
        `UPDATE drawings SET title=?, description=?, price=?, stock=?, category_id=?,
         is_available=?, main_image=?, main_image_mime=?, updated_at=NOW() WHERE id=?`,
        [
          sanitizeString(title),
          description ? sanitizeString(description) : null,
          parseFloat(price),
          parseInt(stock || "1"),
          category_id ? parseInt(category_id) : null,
          is_available === "0" ? 0 : 1,
          mainImage.buffer,
          mainImage.mimetype,
          drawingId,
        ]
      );
    } else {
      await query(
        `UPDATE drawings SET title=?, description=?, price=?, stock=?, category_id=?, is_available=?, updated_at=NOW() WHERE id=?`,
        [
          sanitizeString(title),
          description ? sanitizeString(description) : null,
          parseFloat(price),
          parseInt(stock || "1"),
          category_id ? parseInt(category_id) : null,
          is_available === "0" ? 0 : 1,
          drawingId,
        ]
      );
    }

    const galleryKeys = Object.keys(files).filter((k) => k.startsWith("gallery_"));
    for (let i = 0; i < galleryKeys.length; i++) {
      const file = files[galleryKeys[i]];
      if (file && file.buffer && file.buffer.length > 0) {
        await query(
          "INSERT INTO drawing_gallery (drawing_id, image, image_mime, sort_order) VALUES (?, ?, ?, ?)",
          [drawingId, file.buffer, file.mimetype, i]
        );
      }
    }

    return res.status(200).json({ success: true });
  }

  if (req.method === "DELETE") {
    const drawing = await queryOne("SELECT id FROM drawings WHERE id = ?", [drawingId]);
    if (!drawing) return res.status(404).json({ error: "الرسم غير موجود" });
    await query("DELETE FROM drawing_gallery WHERE drawing_id = ?", [drawingId]);
    await query("DELETE FROM drawings WHERE id = ?", [drawingId]);
    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
}

export default requireAdmin(handler);
