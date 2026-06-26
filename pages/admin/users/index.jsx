import { useEffect, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import Pagination from "../../../components/ui/Pagination";
import { Search, Trash2 } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, search });
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((d) => { setUsers(d.users || []); setTotal(d.total || 0); setTotalPages(d.totalPages || 1); setLoading(false); });
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const handleDelete = async (id, name) => {
    if (!confirm(`حذف المستخدم "${name}"؟`)) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) fetchUsers();
  };

  return (
    <AdminLayout title="إدارة المستخدمين">
      <div className="mb-5">
        <div className="relative w-full sm:w-72">
          <input type="text" placeholder="بحث بالاسم أو البريد..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">{total} مستخدم</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-ink-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">👥</div><p>لا توجد مستخدمون</p>
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="divide-y divide-gray-50 sm:hidden">
              {users.map((u) => (
                <div key={u.id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ink-100 text-ink-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate" dir="ltr">{u.email}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{u.order_count} طلب · {new Date(u.created_at).toLocaleDateString("ar-MA")}</p>
                  </div>
                  <button onClick={() => handleDelete(u.id, u.name)}
                    className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-all shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-right font-semibold">المستخدم</th>
                    <th className="px-5 py-3 text-right font-semibold">الهاتف</th>
                    <th className="px-5 py-3 text-right font-semibold">الطلبات</th>
                    <th className="px-5 py-3 text-right font-semibold">تاريخ التسجيل</th>
                    <th className="px-5 py-3 text-right font-semibold">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-ink-100 text-ink-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-400" dir="ltr">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600" dir="ltr">{u.phone || "—"}</td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-ink-700 bg-ink-50 px-2.5 py-1 rounded-full">
                          {u.order_count} طلب
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString("ar-MA")}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => handleDelete(u.id, u.name)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all">
                          <Trash2 className="w-3 h-3" />حذف
                        </button>
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
