import { queryOne } from "../../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { id } = req.query;
  const drawingId = parseInt(id);
  if (isNaN(drawingId)) return res.status(400).end();

  const row = await queryOne(
    "SELECT main_image, main_image_mime FROM drawings WHERE id = ?",
    [drawingId]
  );

  if (!row || !row.main_image) return res.status(404).end();

  res.setHeader("Content-Type", row.main_image_mime || "image/jpeg");
  res.setHeader("Cache-Control", "public, max-age=86400");
  return res.send(row.main_image);
}
