import { query } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const rows = await query("SELECT id, question, answer FROM faqs ORDER BY sort_order ASC");
  return res.status(200).json({ faqs: rows });
}
