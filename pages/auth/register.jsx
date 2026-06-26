import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import Layout from "../../components/layout/Layout";

export default function RegisterPage() {
  const { register, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) router.replace("/"); }, [user, router]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) return setError("يرجى ملء جميع الحقول المطلوبة");
    if (form.password !== form.confirm) return setError("كلمتا المرور غير متطابقتين");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="إنشاء حساب - رسم">
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-br from-ink-700 to-ink-900 p-8 text-white text-center">
              <Link href="/" className="inline-flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="font-black text-xl">ر</span>
                </div>
                <span className="font-black text-2xl">رسم</span>
              </Link>
              <h1 className="text-2xl font-black">أنشئ حسابك</h1>
              <p className="text-ink-200 text-sm mt-1">انضم إلى عائلة رسم مجاناً</p>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="اسمك الكامل"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    كلمة المرور <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="كلمة المرور"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    تأكيد كلمة المرور <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="confirm"
                    type="password"
                    value={form.confirm}
                    onChange={handleChange}
                    placeholder="أعد كتابة كلمة المرور"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    رقم الهاتف{" "}
                    <span className="text-gray-400 font-normal">(اختياري)</span>
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+212 6XX XXXXXX"
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-ink-600 to-ink-700 hover:from-ink-700 hover:to-ink-800 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-gray-500">
                لديك حساب بالفعل؟{" "}
                <Link href="/auth/login" className="text-ink-600 font-semibold hover:underline">
                  سجل الدخول
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}