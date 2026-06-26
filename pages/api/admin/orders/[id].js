import { requireAdmin } from "../../../../lib/auth";
import { query, queryOne } from "../../../../lib/db";
import { sanitizeString } from "../../../../lib/validate";
import { sendMail } from "../../../../lib/mail";
import { generateInvoicePDF } from "../../../../lib/pdf";

async function handler(req, res) {
  if (req.method !== "PUT") return res.status(405).end();

  const orderId = parseInt(req.query.id);
  if (isNaN(orderId)) return res.status(400).json({ error: "معرف غير صحيح" });

  const { status, cancel_reason } = req.body || {};

  const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "حالة غير صحيحة" });
  }

  if (status === "cancelled" && !cancel_reason) {
    return res.status(400).json({ error: "سبب الإلغاء مطلوب" });
  }

  const order = await queryOne(
    `SELECT o.*, u.email as client_email, u.name as client_name, d.title as drawing_title
     FROM orders o
     JOIN users u ON o.user_id = u.id
     JOIN drawings d ON o.drawing_id = d.id
     WHERE o.id = ?`,
    [orderId]
  );

  if (!order) return res.status(404).json({ error: "الطلب غير موجود" });

  if (status === "cancelled") {
    await query(
      "UPDATE orders SET status = 'cancelled', cancel_reason = ? WHERE id = ?",
      [sanitizeString(cancel_reason), orderId]
    );

    await sendMail({
      to: order.client_email,
      subject: `تم إلغاء طلبك #${orderId} - رسم`,
      text: `عزيزي ${order.client_name}، تم إلغاء طلبك رقم #${orderId}. السبب: ${cancel_reason}`,
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f3ff;padding:20px;border-radius:12px;">
          <h2 style="color:#6d28d9;text-align:center;">رسم - متجر الرسومات الفنية</h2>
          <div style="background:#fff;padding:24px;border-radius:8px;">
            <h3 style="color:#dc2626;">تم إلغاء طلبك</h3>
            <p>عزيزي <strong>${order.client_name}</strong>،</p>
            <p>نأسف لإعلامك بأنه تم إلغاء طلبك رقم <strong>#${orderId}</strong>.</p>
            <p><strong>السبب:</strong> ${cancel_reason}</p>
            <p>للاستفسار يرجى التواصل معنا عبر contact@rasem.ma</p>
          </div>
        </div>`,
    });
  } else if (status === "confirmed") {
    const pdfBuffer = generateInvoicePDF(order);

    await query(
      "UPDATE orders SET status = 'confirmed', invoice_pdf = ? WHERE id = ?",
      [Buffer.from(pdfBuffer), orderId]
    );

    await sendMail({
      to: order.client_email,
      subject: `تأكيد طلبك #${orderId} - رسم`,
      text: `عزيزي ${order.client_name}، تم تأكيد طلبك رقم #${orderId} بنجاح.`,
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f3ff;padding:20px;border-radius:12px;">
          <h2 style="color:#6d28d9;text-align:center;">رسم - متجر الرسومات الفنية</h2>
          <div style="background:#fff;padding:24px;border-radius:8px;">
            <h3 style="color:#16a34a;">تم تأكيد طلبك بنجاح! 🎨</h3>
            <p>عزيزي <strong>${order.client_name}</strong>،</p>
            <p>يسعدنا إخبارك بأنه تم تأكيد طلبك رقم <strong>#${orderId}</strong>.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr style="background:#f5f3ff;">
                <td style="padding:8px;border:1px solid #ddd;"><strong>الرسم</strong></td>
                <td style="padding:8px;border:1px solid #ddd;">${order.drawing_title}</td>
              </tr>
              <tr>
                <td style="padding:8px;border:1px solid #ddd;"><strong>السعر</strong></td>
                <td style="padding:8px;border:1px solid #ddd;">${Number(order.price_snapshot).toFixed(2)} درهم</td>
              </tr>
              <tr style="background:#f5f3ff;">
                <td style="padding:8px;border:1px solid #ddd;"><strong>عنوان التوصيل</strong></td>
                <td style="padding:8px;border:1px solid #ddd;">${order.address}، ${order.city}</td>
              </tr>
            </table>
            <p style="color:#6d28d9;">سيتم التواصل معك قريباً لترتيب عملية التسليم.</p>
            <p>شكراً لثقتك في رسم!</p>
          </div>
        </div>`,
    });
  } else {
    await query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
  }

  return res.status(200).json({ success: true });
}

export default requireAdmin(handler);
