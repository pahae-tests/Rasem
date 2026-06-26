import { useEffect, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import Pagination from "../../../components/ui/Pagination";
import { Search, X, ChevronDown } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "جميع الحالات" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "confirmed", label: "مؤكد" },
  { value: "shipped", label: "مشحون" },
  { value: "delivered", label: "تم التسليم" },
  { value: "cancelled", label: "ملغى" },
];

const STATUS_COLORS = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS = {
  pending: "قيد الانتظار", confirmed: "مؤكد",
  shipped: "مشحون", delivered: "تم التسليم", cancelled: "ملغى",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [actionModal, setActionModal] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, status: statusFilter, search });
    fetch(`/api/admin/orders?${params}`)
      .then((r) => r.json())
      .then((d) => { setOrders(d.orders || []); setTotal(d.total || 0); setTotalPages(d.totalPages || 1); setLoading(false); });
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter, search]);

  const updateStatus = async (orderId, status) => {
    if (status === "cancelled" && !cancelReason.trim()) return setActionError("سبب الإلغاء مطلوب");
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, cancel_reason: cancelReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ ما");
      setActionModal(null);
      setCancelReason("");
      fetchOrders();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout title="إدارة الطلبات">
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <input type="text" placeholder="بحث..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm bg-white">
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">{total} طلب</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-ink-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🛍️</div><p>لا توجد طلبات</p>
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="divide-y divide-gray-50 sm:hidden">
              {orders.map((order) => (
                <div key={order.id} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">#{order.id} — {order.client_name}</p>
                      <p className="text-xs text-gray-400 truncate">{order.drawing_title}</p>
                      <p className="text-xs text-gray-400">{order.city} · {new Date(order.created_at).toLocaleDateString("ar-MA")}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full border ${STATUS_COLORS[order.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                      <span className="text-sm font-bold text-ink-700">{Number(order.price_snapshot).toFixed(2)} د</span>
                    </div>
                  </div>
                  <button onClick={() => { setActionModal(order); setActionError(""); setCancelReason(""); }}
                    className="w-full py-2 text-xs font-semibold bg-ink-50 text-ink-700 hover:bg-ink-100 rounded-xl transition-all">
                    إدارة الطلب
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-right font-semibold">#</th>
                    <th className="px-4 py-3 text-right font-semibold">العميل</th>
                    <th className="px-4 py-3 text-right font-semibold">الرسم</th>
                    <th className="px-4 py-3 text-right font-semibold">المدينة</th>
                    <th className="px-4 py-3 text-right font-semibold">السعر</th>
                    <th className="px-4 py-3 text-right font-semibold">الحالة</th>
                    <th className="px-4 py-3 text-right font-semibold">التاريخ</th>
                    <th className="px-4 py-3 text-right font-semibold">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm font-bold text-gray-500">#{order.id}</td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-gray-900">{order.client_name}</p>
                        <p className="text-xs text-gray-400">{order.client_email}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 max-w-[140px] truncate">{order.drawing_title}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{order.city}</td>
                      <td className="px-4 py-4 text-sm font-bold text-gray-900">{Number(order.price_snapshot).toFixed(2)} د</td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString("ar-MA")}</td>
                      <td className="px-4 py-4">
                        <button onClick={() => { setActionModal(order); setActionError(""); setCancelReason(""); }}
                          className="px-3 py-1.5 text-xs font-semibold bg-ink-50 text-ink-700 hover:bg-ink-100 rounded-lg transition-all">
                          إدارة
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

      {/* Action modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) { setActionModal(null); } }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-scale-in overflow-y-auto max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-gray-900">إدارة الطلب #{actionModal.id}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{actionModal.client_name} — {actionModal.drawing_title}</p>
              </div>
              <button onClick={() => setActionModal(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {actionError && (
                <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{actionError}</div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">العميل</p>
                  <p className="text-gray-600">{actionModal.customer_name}</p>
                  <p className="text-gray-500 text-xs">{actionModal.customer_phone}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">عنوان التوصيل</p>
                  <p className="text-gray-600">{actionModal.address}</p>
                  <p className="text-gray-500 text-xs">{actionModal.city}</p>
                </div>
              </div>
              {actionModal.notes && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">ملاحظات العميل:</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{actionModal.notes}</p>
                </div>
              )}
              {actionModal.status === "cancelled" && actionModal.cancel_reason && (
                <div className="px-4 py-3 bg-red-50 rounded-xl text-sm text-red-600">
                  <strong>سبب الإلغاء:</strong> {actionModal.cancel_reason}
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">تغيير الحالة:</p>
                <div className="flex flex-wrap gap-2">
                  {actionModal.status === "pending" && (
                    <button onClick={() => updateStatus(actionModal.id, "confirmed")} disabled={actionLoading}
                      className="px-4 py-2 text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition-all disabled:opacity-60">
                      ✓ تأكيد الطلب
                    </button>
                  )}
                  {actionModal.status === "confirmed" && (
                    <button onClick={() => updateStatus(actionModal.id, "shipped")} disabled={actionLoading}
                      className="px-4 py-2 text-sm font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl transition-all disabled:opacity-60">
                      🚚 تم الشحن
                    </button>
                  )}
                  {actionModal.status === "shipped" && (
                    <button onClick={() => updateStatus(actionModal.id, "delivered")} disabled={actionLoading}
                      className="px-4 py-2 text-sm font-semibold bg-green-50 text-green-700 hover:bg-green-100 rounded-xl transition-all disabled:opacity-60">
                      ✅ تم التسليم
                    </button>
                  )}
                </div>
              </div>

              {actionModal.status !== "cancelled" && actionModal.status !== "delivered" && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 mb-2">إلغاء الطلب:</p>
                  <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="سبب الإلغاء (مطلوب)..." rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none text-sm transition-all resize-none mb-2" />
                  <button onClick={() => updateStatus(actionModal.id, "cancelled")} disabled={actionLoading}
                    className="px-4 py-2 text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all disabled:opacity-60">
                    إلغاء الطلب
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
