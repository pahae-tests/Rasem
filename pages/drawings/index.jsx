import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import DrawingCard from "../../components/ui/DrawingCard";
import Pagination from "../../components/ui/Pagination";

const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "popular", label: "الأكثر طلباً" },
  { value: "rating", label: "الأعلى تقييماً" },
  { value: "price_asc", label: "السعر: من الأقل" },
  { value: "price_desc", label: "السعر: من الأعلى" },
];

export default function DrawingsPage() {
  const router = useRouter();
  const [drawings, setDrawings] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const searchTimer = useRef(null);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    if (router.isReady) {
      setCategory(router.query.category || "");
      setSort(router.query.sort || "newest");
    }
  }, [router.isReady, router.query.category, router.query.sort]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, sort, limit: 12 });
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    fetch(`/api/drawings?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setDrawings(d.drawings || []);
        setTotal(d.total || 0);
        setTotalPages(d.totalPages || 1);
        setLoading(false);
      });
  }, [search, category, sort, page, minPrice, maxPrice]);

  const handleSearchChange = (e) => {
    const v = e.target.value;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(v);
      setPage(1);
    }, 400);
  };

  return (
    <Layout title="الرسومات - رسم">
      <div className="bg-gradient-to-b from-ink-900 to-ink-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-black mb-4">مجموعة الرسومات</h1>
          <p className="text-ink-200">اكتشف مئات الرسومات الفنية الأصيلة</p>
          <div className="mt-6 max-w-lg mx-auto relative">
            <input
              type="text"
              onChange={handleSearchChange}
              placeholder="ابحث عن رسم..."
              className="w-full px-5 py-4 pr-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all"
            />
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">التصنيف</h3>
                <div className="space-y-1.5">
                  <button
                    onClick={() => { setCategory(""); setPage(1); }}
                    className={`w-full text-right px-3 py-2 rounded-xl text-sm font-medium transition-all ${!category ? "bg-ink-50 text-ink-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    جميع التصنيفات
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setCategory(cat.slug); setPage(1); }}
                      className={`w-full text-right px-3 py-2 rounded-xl text-sm font-medium transition-all ${category === cat.slug ? "bg-ink-50 text-ink-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">نطاق السعر (درهم)</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="من"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="إلى"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none"
                  />
                </div>
              </div>

              {(category || minPrice || maxPrice) && (
                <button
                  onClick={() => { setCategory(""); setMinPrice(""); setMaxPrice(""); setPage(1); }}
                  className="w-full py-2 text-sm text-red-500 hover:text-red-600 font-medium border border-red-100 rounded-xl hover:bg-red-50 transition-all"
                >
                  مسح الفلاتر
                </button>
              )}
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                {loading ? "جارٍ التحميل..." : `${total} رسم`}
              </p>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none bg-white"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : drawings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="text-5xl mb-4">🎨</div>
                <h3 className="font-bold text-gray-900 mb-2">لا توجد نتائج</h3>
                <p className="text-gray-500 text-sm">جرب تغيير معايير البحث</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  {drawings.map((d) => <DrawingCard key={d.id} drawing={d} />)}
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
