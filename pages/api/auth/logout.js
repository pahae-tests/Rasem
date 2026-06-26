import { serialize } from "cookie";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  res.setHeader(
    "Set-Cookie",
    serialize("token", "", { httpOnly: true, path: "/", maxAge: 0, sameSite: "lax" })
  );

  return res.status(200).json({ success: true });
}
