import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/faqs").then((r) => r.json()).then((d) => { setFaqs(d.faqs || []); setLoading(false); });
  }, []);

  return (
    <Layout title="الأسئلة الشائعة - رسم">
      <div className="bg-gradient-to-b from-ink-900 to-ink-800 text-white py-16 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 text-ink-300" />
          <h1 className="text-4xl font-black mb-3">الأسئلة الشائعة</h1>
          <p className="text-ink-200">كل ما تحتاج معرفته عن متجر رسم</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-ink-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد أسئلة شائعة بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button onClick={() => setOpen(open === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between px-6 py-5 text-right hover:bg-gray-50 transition-colors">
                  <span className="font-bold text-gray-900 text-base leading-relaxed">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-ink-600 shrink-0 mr-4 transition-transform duration-300 ${open === faq.id ? "rotate-180" : ""}`} />
                </button>
                {open === faq.id && (
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed animate-slide-up border-t border-gray-50 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
