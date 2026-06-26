import { query } from "../../../lib/db";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { faqs } = req.body;
      let inserted = 0;
      for (const faq of faqs) {
        await query(
          "INSERT IGNORE INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)",
          [faq.question, faq.answer, faq.sort_order]
        );
        inserted++;
      }
      return res.json({ success: true, inserted });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}