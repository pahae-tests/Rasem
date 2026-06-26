// pages/test-faqs.jsx
import { useState } from "react";

const FAQS = [
  { question: "كيف أقدم طلبي؟", answer: 'اختر الرسم الذي يعجبك، ثم انقر على زر "اطلب الآن". أدخل معلومات التوصيل وسيتم إنشاء طلبك مباشرة.', sort_order: 1 },
  { question: "ما هي مدة التوصيل؟", answer: "تتراوح مدة التوصيل بين 3 و 7 أيام عمل حسب المنطقة الجغرافية.", sort_order: 2 },
  { question: "هل يمكنني إلغاء طلبي؟", answer: 'يمكنك إلغاء طلبك فقط عندما يكون في حالة "قيد الانتظار". بعد التأكيد لا يمكن الإلغاء.', sort_order: 3 },
  { question: "هل الرسومات أصلية؟", answer: "نعم، جميع الرسومات أصلية ومرسومة يدوياً بالكامل من قِبل فنانينا المحترفين.", sort_order: 4 },
  { question: "كيف أتواصل معكم؟", answer: "يمكنك التواصل معنا عبر صفحة الاتصال أو عبر البريد الإلكتروني contact@rasem.ma", sort_order: 5 },
];

export default function TestFaqs() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleInsert() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/test/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faqs: FAQS }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus({ type: "success", message: `✅ ${data.inserted} FAQ(s) insérées avec succès` });
    } catch (e) {
      setStatus({ type: "error", message: `❌ Erreur : ${e.message}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 700 }}>
      <h1>Test — FAQs</h1>

      <button
        onClick={handleInsert}
        disabled={loading}
        style={{ background: loading ? "#9ca3af" : "#2563eb", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 8, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginBottom: 20 }}
      >
        {loading ? "Insertion en cours..." : "Insérer les FAQs en arabe"}
      </button>

      {status && (
        <div style={{ padding: 14, borderRadius: 8, marginBottom: 24, background: status.type === "success" ? "#dcfce7" : "#fee2e2", color: status.type === "success" ? "#166534" : "#991b1b" }}>
          {status.message}
        </div>
      )}

      <h3>Aperçu des FAQs à insérer :</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ padding: 16, background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb", direction: "rtl", textAlign: "right" }}>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>{faq.question}</p>
            <p style={{ color: "#6b7280", margin: 0, fontSize: 14 }}>{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}