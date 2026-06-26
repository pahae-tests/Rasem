import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../components/layout/Layout";
import DrawingCard from "../components/ui/DrawingCard";
import { useAuth } from "../hooks/useAuth";

export default function Home() {
  const { user } = useAuth();
  const [popular, setPopular] = useState([]);
  const [latest, setLatest] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/drawings?sort=popular&limit=8").then((r) => r.json()),
      fetch("/api/drawings?sort=newest&limit=8").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([pop, lat, cats]) => {
      setPopular(pop.drawings || []);
      setLatest(lat.drawings || []);
      setCategories(cats.categories || []);
      setLoading(false);
    });
  }, []);

  return (
    <Layout title="رسم - متجر الرسومات الفنية الأصيلة">
      <section className="relative overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-ink-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-sand-300 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-ink-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
            <span className="w-2 h-2 bg-sand-400 rounded-full animate-pulse" />
            رسومات فنية أصيلة ومرسومة يدوياً
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
            اكتشف جمال
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sand-300 to-sand-500 py-2">
              الفن الأصيل
            </span>
          </h1>
          <p className="text-ink-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            كل رسم قصة، كل لوحة عالم. اختر رسمك المفضل واطلبه مباشرة لتوصيله إلى باب منزلك.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/drawings"
              className="px-8 py-4 bg-white text-ink-700 font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
            >
              استعرض الرسومات
            </Link>
            {!user && (
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all border border-white/30 backdrop-blur-sm"
              >
                أنشئ حسابك مجاناً
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { iconPath: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", title: "فن أصيل 100%", desc: "كل رسم مرسوم يدوياً بعناية فائقة" },
              { iconPath: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4", title: "توصيل سريع", desc: "التوصيل في 3-7 أيام عمل" },
              { iconPath: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z", title: "جودة مضمونة", desc: "رضا العميل أولويتنا دائماً" },
            ].map((item) => (
              <div key={item.title} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-ink-50 transition-colors group">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-ink-100 group-hover:bg-ink-200 flex items-center justify-center transition-colors">
                  <svg className="w-7 h-7 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.iconPath} />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-ink-700">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-black text-gray-900 mb-8 text-center">تصفح حسب التصنيف</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/drawings?category=${cat.slug}`}
                  className="px-5 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-ink-600 hover:text-white hover:border-ink-600 transition-all shadow-sm"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {!loading && popular.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900">الأكثر طلباً</h2>
                <p className="text-gray-500 mt-1">الرسومات الأكثر شعبية لدى عملائنا</p>
              </div>
              <Link href="/drawings?sort=popular" className="text-ink-600 hover:text-ink-700 font-semibold text-sm hover:underline">
                عرض الكل ←
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {popular.map((d) => <DrawingCard key={d.id} drawing={d} />)}
            </div>
          </div>
        </section>
      )}

      {!loading && latest.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900">أحدث الرسومات</h2>
                <p className="text-gray-500 mt-1">تم إضافتها مؤخراً لمجموعتنا</p>
              </div>
              <Link href="/drawings?sort=newest" className="text-ink-600 hover:text-ink-700 font-semibold text-sm hover:underline">
                عرض الكل ←
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {latest.map((d) => <DrawingCard key={d.id} drawing={d} />)}
            </div>
          </div>
        </section>
      )}

      {loading && (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-ink-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </Layout>
  );
}
