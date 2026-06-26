import { requireAdmin } from "../../../../lib/auth";
import { query, queryOne } from "../../../../lib/db";

async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();

  const imgId = parseInt(req.query.id);
  if (isNaN(imgId)) return res.status(400).json({ error: "معرف غير صحيح" });

  const img = await queryOne("SELECT id FROM drawing_gallery WHERE id = ?", [imgId]);
  if (!img) return res.status(404).json({ error: "الصورة غير موجودة" });

  await query("DELETE FROM drawing_gallery WHERE id = ?", [imgId]);
  return res.status(200).json({ success: true });
}

export default requireAdmin(handler);
