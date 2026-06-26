import { requireAdmin } from "../../../../lib/auth";
import { query, queryOne } from "../../../../lib/db";
import { sendMail } from "../../../../lib/mail";
import { sanitizeString } from "../../../../lib/validate";

async function handler(req, res) {
  const msgId = parseInt(req.query.id);
  if (isNaN(msgId)) return res.status(400).json({ error: "معرف غير صحيح" });

  if (req.method === "PUT") {
    const { reply, add_to_faq } = req.body || {};

    const msg = await queryOne(
      "SELECT id, name, email, subject, message FROM contact_messages WHERE id = ?",
      [msgId]
    );
    if (!msg) return res.status(404).json({ error: "الرسالة غير موجودة" });

    if (reply) {
      const replyText = sanitizeString(reply);

      await sendMail({
        to: msg.email,
        subject: `رد على رسالتك: ${msg.subject} - رسم`,
        text: `عزيزي ${msg.name}،\n\n${replyText}\n\nفريق رسم`,
        html: `
          <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f3ff;padding:20px;border-radius:12px;">
            <h2 style="color:#6d28d9;text-align:center;">رسم - متجر الرسومات الفنية</h2>
            <div style="background:#fff;padding:24px;border-radius:8px;">
              <h3 style="color:#374151;">رد على استفسارك</h3>
              <p>عزيزي <strong>${msg.name}</strong>،</p>
              <div style="background:#f5f3ff;padding:16px;border-radius:8px;margin:16px 0;border-right:4px solid #7c3aed;">
                <p style="margin:0;color:#374151;">${replyText.replace(/\n/g, "<br>")}</p>
              </div>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
              <p style="color:#6b7280;font-size:12px;"><strong>رسالتك الأصلية:</strong> ${msg.message}</p>
              <p style="color:#9ca3af;font-size:11px;margin-top:16px;">فريق رسم | contact@rasem.ma</p>
            </div>
          </div>`,
      });

      if (add_to_faq) {
        const maxOrder = await queryOne("SELECT MAX(sort_order) as max FROM faqs");
        const nextOrder = (maxOrder.max || 0) + 1;
        await query(
          "INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)",
          [sanitizeString(msg.subject), replyText, nextOrder]
        );
      }
    }

    await query("UPDATE contact_messages SET is_read = 1 WHERE id = ?", [msgId]);
    return res.status(200).json({ success: true });
  }

  if (req.method === "PATCH") {
    await query("UPDATE contact_messages SET is_read = 1 WHERE id = ?", [msgId]);
    return res.status(200).json({ success: true });
  }

  if (req.method === "DELETE") {
    await query("DELETE FROM contact_messages WHERE id = ?", [msgId]);
    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
}

export default requireAdmin(handler);
