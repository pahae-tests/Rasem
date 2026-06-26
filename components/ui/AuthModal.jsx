import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { X } from "lucide-react";

export default function AuthModal({ onClose, onSuccess }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("register");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        if (!form.name || !form.email || !form.password) throw new Error("يرجى ملء جميع الحقول المطلوبة");
        if (form.password !== form.confirm) throw new Error("كلمتا المرور غير متطابقتين");
        const user = await register(form.name, form.email, form.password, form.phone);
        onSuccess && onSuccess(user);
      } else {
        if (!form.email || !form.password) throw new Error("البريد الإلكتروني وكلمة المرور مطلوبان");
        const user = await login(form.email, form.password);
        onSuccess && onSuccess(user);
      }
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
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scale-in overflow-y-auto max-h-[90vh]">
        <div className="bg-gradient-to-br from-ink-600 to-ink-800 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl font-black">ر</span>
          </div>
          <h2 className="text-xl font-bold">
            {mode === "register" ? "أنشئ حسابك مجاناً" : "مرحباً بعودتك"}
          </h2>
          <p className="text-ink-200 text-sm mt-1">
            {mode === "register" ? "سجل الآن لتتمكن من الطلب وإدارة مفضلتك" : "سجل الدخول للمتابعة"}
          </p>
        </div>

        <div className="p-6">
          <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
            <button onClick={() => setMode("register")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === "register" ? "bg-white text-ink-700 shadow-sm" : "text-gray-500"}`}>
              حساب جديد
            </button>
            <button onClick={() => setMode("login")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === "login" ? "bg-white text-ink-700 shadow-sm" : "text-gray-500"}`}>
              تسجيل الدخول
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">الاسم الكامل <span className="text-red-500">*</span></label>
                <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="أدخل اسمك الكامل"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">البريد الإلكتروني <span className="text-red-500">*</span></label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="example@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">كلمة المرور <span className="text-red-500">*</span></label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="كلمة المرور"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
            </div>
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">تأكيد كلمة المرور <span className="text-red-500">*</span></label>
                  <input name="confirm" type="password" value={form.confirm} onChange={handleChange} placeholder="أعد كتابة كلمة المرور"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم الهاتف <span className="text-gray-400 font-normal">(اختياري)</span></label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+212 6 XX XX XX XX"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" dir="ltr" />
                </div>
              </>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-ink-600 to-ink-700 hover:from-ink-700 hover:to-ink-800 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? "جارٍ المعالجة..." : mode === "register" ? "إنشاء الحساب والمتابعة" : "تسجيل الدخول"}
            </button>
          </form>

          <button onClick={onClose} className="mt-4 w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
