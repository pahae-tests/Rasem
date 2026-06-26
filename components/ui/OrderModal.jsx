import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { X, ShoppingBag } from "lucide-react";

export default function OrderModal({ drawing, onClose, onSuccess }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        customer_name: user.name || "",
        customer_phone: user.phone || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.customer_name || !form.customer_phone || !form.address || !form.city) {
      return setError("يرجى ملء جميع الحقول المطلوبة");
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drawing_id: drawing.id, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ ما");
      onSuccess && onSuccess(data.orderId);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-scale-in overflow-y-auto max-h-[90vh]">
        <div className="bg-gradient-to-br from-ink-600 to-ink-800 p-6 text-white relative">
          <button onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-between pl-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">تفاصيل التوصيل</h2>
                <p className="text-ink-200 text-sm mt-0.5 line-clamp-1">{drawing.title}</p>
              </div>
            </div>
            <div className="text-left shrink-0">
              <p className="text-ink-300 text-xs">السعر</p>
              <p className="text-2xl font-black">{Number(drawing.price).toFixed(2)}<span className="text-sm font-medium mr-1">درهم</span></p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">الاسم الكامل <span className="text-red-500">*</span></label>
                <input name="customer_name" type="text" value={form.customer_name} onChange={handleChange} placeholder="اسمك الكامل"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم الهاتف <span className="text-red-500">*</span></label>
                <input name="customer_phone" type="tel" value={form.customer_phone} onChange={handleChange} placeholder="+212 6XX XXXXXX"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" dir="ltr" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">العنوان الكامل <span className="text-red-500">*</span></label>
              <textarea name="address" value={form.address} onChange={handleChange} placeholder="الشارع، الحي، الرمز البريدي..." rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all resize-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">المدينة <span className="text-red-500">*</span></label>
              <input name="city" type="text" value={form.city} onChange={handleChange} placeholder="مثال: الدار البيضاء"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">ملاحظات <span className="text-gray-400 font-normal">(اختياري)</span></label>
              <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="أي تعليمات خاصة للتوصيل..." rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex-1 py-3.5 bg-gradient-to-r from-ink-600 to-ink-700 hover:from-ink-700 hover:to-ink-800 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? "جارٍ إرسال الطلب..." : "تأكيد الطلب"}
              </button>
              <button type="button" onClick={onClose}
                className="px-5 py-3.5 text-gray-600 hover:text-gray-800 font-semibold bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
