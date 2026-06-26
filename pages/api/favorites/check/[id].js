import { requireAuth } from "../../../../lib/auth";
import { queryOne } from "../../../../lib/db";

async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const drawingId = parseInt(req.query.id);
  if (isNaN(drawingId)) return res.status(400).json({ error: "معرف غير صحيح" });

  const fav = await queryOne(
    "SELECT id FROM favorites WHERE user_id = ? AND drawing_id = ?",
    [req.user.id, drawingId]
  );

  return res.status(200).json({ isFavorite: !!fav });
}

export default requireAuth(handler);
