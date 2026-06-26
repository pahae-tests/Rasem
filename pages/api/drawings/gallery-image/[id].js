import { queryOne } from "../../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { id } = req.query;
  const imgId = parseInt(id);
  if (isNaN(imgId)) return res.status(400).end();

  const row = await queryOne(
    "SELECT image, image_mime FROM drawing_gallery WHERE id = ?",
    [imgId]
  );

  if (!row || !row.image) return res.status(404).end();

  res.setHeader("Content-Type", row.image_mime || "image/jpeg");
  res.setHeader("Cache-Control", "public, max-age=86400");
  return res.send(row.image);
}
