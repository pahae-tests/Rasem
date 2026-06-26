import { useState } from "react";
import Layout from "../components/layout/Layout";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.subject || !form.message) return setError("يرجى ملء جميع الحقول");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const infoItems = [
    { Icon: Mail, title: "البريد الإلكتروني", value: "contact@rasem.ma" },
    { Icon: Phone, title: "الهاتف", value: "+212 6 00 00 00 00" },
    { Icon: MapPin, title: "الموقع", value: "المغرب" },
    { Icon: Clock, title: "ساعات العمل", value: "الاثنين – الجمعة: 9ص – 6م" },
  ];

  return (
    <Layout title="اتصل بنا - رسم">
      <div className="bg-gradient-to-b from-ink-900 to-ink-800 text-white py-16 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <Mail className="w-12 h-12 mx-auto mb-4 text-ink-300" />
          <h1 className="text-4xl font-black mb-3">اتصل بنا</h1>
          <p className="text-ink-200">نحن هنا للإجابة على جميع استفساراتك</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-4">
            {infoItems.map((item) => {
              const Icon = item.Icon;
              return (
                <div key={item.title} className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-ink-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-gray-500 text-sm mt-0.5">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6">أرسل لنا رسالة</h2>

              {success ? (
                <div className="text-center py-10 animate-scale-in">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h3 className="font-bold text-gray-900 text-xl mb-2">تم إرسال رسالتك بنجاح!</h3>
                  <p className="text-gray-500">سنتواصل معك في أقرب وقت ممكن.</p>
                  <button onClick={() => setSuccess(false)}
                    className="mt-6 px-6 py-3 bg-ink-600 text-white font-bold rounded-xl hover:bg-ink-700 transition-all">
                    إرسال رسالة أخرى
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم <span className="text-red-500">*</span></label>
                      <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="اسمك الكامل"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني <span className="text-red-500">*</span></label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="example@email.com" dir="ltr"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">الموضوع <span className="text-red-500">*</span></label>
                    <input name="subject" type="text" value={form.subject} onChange={handleChange} placeholder="موضوع رسالتك"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">الرسالة <span className="text-red-500">*</span></label>
                    <textarea name="message" value={form.message} onChange={handleChange} rows={5} placeholder="اكتب رسالتك هنا..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all resize-none" />
                  </div>
                  <button type="submit" disabled={loading}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-ink-600 to-ink-700 hover:from-ink-700 hover:to-ink-800 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-60">
                    <Send className="w-4 h-4" />
                    {loading ? "جارٍ الإرسال..." : "إرسال الرسالة"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
