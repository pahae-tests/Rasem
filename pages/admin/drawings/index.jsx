import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "../../../components/admin/AdminLayout";
import Pagination from "../../../components/ui/Pagination";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

export default function AdminDrawings() {
  const [drawings, setDrawings] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDrawings = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, search });
    fetch(`/api/admin/drawings?${params}`)
      .then((r) => r.json())
      .then((d) => { setDrawings(d.drawings || []); setTotal(d.total || 0); setTotalPages(d.totalPages || 1); setLoading(false); });
  };

  useEffect(() => { fetchDrawings(); }, [page, search]);

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا الرسم؟")) return;
    const res = await fetch(`/api/admin/drawings/${id}`, { method: "DELETE" });
    if (res.ok) fetchDrawings();
  };

  return (
    <AdminLayout title="إدارة الرسومات">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="relative w-full sm:w-64">
          <input type="text" placeholder="بحث عن رسم..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <Link href="/admin/drawings/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-ink-600 hover:bg-ink-700 text-white font-bold rounded-xl transition-all shadow-sm text-sm shrink-0">
          <Plus className="w-4 h-4" />إضافة رسم
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">{total} رسم</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-ink-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : drawings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🎨</div><p>لا توجد رسومات</p>
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="divide-y divide-gray-50 sm:hidden">
              {drawings.map((d) => (
                <div key={d.id} className="p-4 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <img src={`/api/drawings/image/${d.id}`} alt={d.title} className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Crect fill='%23f3f4f6' width='56' height='56'/%3E%3C/svg%3E"; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{d.title}</p>
                    <p className="text-xs text-gray-500">{Number(d.price).toFixed(2)} درهم · {d.total_orders} طلب</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${d.is_available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {d.is_available ? "متاح" : "غير متاح"}
                    </span>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Link href={`/admin/drawings/${d.id}`}
                      className="p-2 bg-ink-50 text-ink-700 hover:bg-ink-100 rounded-lg transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <button onClick={() => handleDelete(d.id)}
                      className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-right font-semibold">الرسم</th>
                    <th className="px-5 py-3 text-right font-semibold">السعر</th>
                    <th className="px-5 py-3 text-right font-semibold">المخزون</th>
                    <th className="px-5 py-3 text-right font-semibold">الحالة</th>
                    <th className="px-5 py-3 text-right font-semibold">الطلبات</th>
                    <th className="px-5 py-3 text-right font-semibold">التقييم</th>
                    <th className="px-5 py-3 text-right font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {drawings.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                            <img src={`/api/drawings/image/${d.id}`} alt={d.title} className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect fill='%23f3f4f6' width='48' height='48'/%3E%3C/svg%3E"; }} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{d.title}</p>
                            <p className="text-xs text-gray-400">{d.category_name || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-gray-900">{Number(d.price).toFixed(2)} د</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{d.stock}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${d.is_available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                          {d.is_available ? "متاح" : "غير متاح"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{d.total_orders}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">⭐ {Number(d.average_rating).toFixed(1)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/drawings/${d.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-ink-50 text-ink-700 hover:bg-ink-100 rounded-lg transition-all">
                            <Pencil className="w-3 h-3" />تعديل
                          </Link>
                          <button onClick={() => handleDelete(d.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all">
                            <Trash2 className="w-3 h-3" />حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </AdminLayout>
  );
}
