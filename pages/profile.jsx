import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/layout/Layout";
import { useAuth } from "../hooks/useAuth";

export default function ProfilePage() {
  const { user, loading: authLoading, refetch } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/auth/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: user.name, email: user.email, phone: user.phone || "" }));
  }, [user]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      return setError("كلمتا المرور الجديدتان غير متطابقتين");
    }
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          currentPassword: form.currentPassword || undefined,
          newPassword: form.newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("تم تحديث ملفك الشخصي بنجاح");
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "", confirmPassword: "" }));
      refetch();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <Layout title="ملفي الشخصي - رسم">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black text-gray-900 mb-8">ملفي الشخصي</h1>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-br from-ink-700 to-ink-900 p-8 text-white flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-ink-200 text-sm">{user.email}</p>
            </div>
          </div>

          <div className="p-8">
            {error && <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>}
            {success && <div className="mb-5 px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-600 font-medium">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم الكامل <span className="text-red-500">*</span></label>
                <input name="name" type="text" value={form.name} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني <span className="text-red-500">*</span></label>
                <input name="email" type="email" value={form.email} onChange={handleChange} dir="ltr"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الهاتف</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} dir="ltr"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">تغيير كلمة المرور <span className="text-gray-400 font-normal text-sm">(اختياري)</span></h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور الحالية</label>
                    <input name="currentPassword" type="password" value={form.currentPassword} onChange={handleChange} placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور الجديدة</label>
                    <input name="newPassword" type="password" value={form.newPassword} onChange={handleChange} placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">تأكيد كلمة المرور الجديدة</label>
                    <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-ink-600 to-ink-700 hover:from-ink-700 hover:to-ink-800 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-60">
                {loading ? "جارٍ الحفظ..." : "حفظ التغييرات"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
