import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import Layout from "../../components/layout/Layout";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace(user.role === "admin" ? "/admin" : "/");
  }, [user, router]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) return setError("جميع الحقول مطلوبة");
    setLoading(true);
    try {
      const u = await login(form.email, form.password);
      router.push(u.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="تسجيل الدخول - رسم">
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
              <h1 className="text-2xl font-black">مرحباً بعودتك</h1>
              <p className="text-ink-200 text-sm mt-1">سجل الدخول للمتابعة</p>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="example@email.com" dir="ltr"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label>
                  <input name="password" type="password" value={form.password} onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-ink-600 to-ink-700 hover:from-ink-700 hover:to-ink-800 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-60">
                  {loading ? "جارٍ التحقق..." : "تسجيل الدخول"}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-gray-500">
                ليس لديك حساب؟{" "}
                <Link href="/auth/register" className="text-ink-600 font-semibold hover:underline">
                  أنشئ حساباً الآن
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
