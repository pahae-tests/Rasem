import { query } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const rows = await query("SELECT id, name, slug FROM categories ORDER BY name ASC");
  return res.status(200).json({ categories: rows });
}
