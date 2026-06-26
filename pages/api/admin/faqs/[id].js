import { requireAdmin } from "../../../../lib/auth";
import { query, queryOne } from "../../../../lib/db";

async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();

  const faqId = parseInt(req.query.id);
  if (isNaN(faqId)) return res.status(400).json({ error: "معرف غير صحيح" });

  const faq = await queryOne("SELECT id FROM faqs WHERE id = ?", [faqId]);
  if (!faq) return res.status(404).json({ error: "السؤال غير موجود" });

  await query("DELETE FROM faqs WHERE id = ?", [faqId]);
  return res.status(200).json({ success: true });
}

export default requireAdmin(handler);
