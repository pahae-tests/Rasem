import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/layout/Layout";
import { useAuth } from "../hooks/useAuth";
import Link from "next/link";
import { ShoppingBag, Package, Truck, CheckCircle, XCircle, Clock, Palette } from "lucide-react";

const STATUS_MAP = {
  pending:   { label: "قيد الانتظار", color: "bg-yellow-50 text-yellow-700 border-yellow-200", Icon: Clock },
  confirmed: { label: "مؤكد",          color: "bg-blue-50 text-blue-700 border-blue-200",       Icon: Package },
  shipped:   { label: "تم الشحن",      color: "bg-purple-50 text-purple-700 border-purple-200", Icon: Truck },
  delivered: { label: "تم التسليم",    color: "bg-green-50 text-green-700 border-green-200",    Icon: CheckCircle },
  cancelled: { label: "ملغى",          color: "bg-red-50 text-red-700 border-red-200",           Icon: XCircle },
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/auth/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/orders").then((r) => r.json()).then((d) => { setOrders(d.orders || []); setLoading(false); });
  }, [user]);

  const cancelOrder = async (id) => {
    if (!confirm("هل أنت متأكد من إلغاء هذا الطلب؟")) return;
    const res = await fetch(`/api/orders/${id}/cancel`, { method: "POST" });
    if (res.ok) setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "cancelled" } : o));
  };

  if (authLoading || !user) return null;

  return (
    <Layout title="طلباتي - رسم">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black text-gray-900 mb-8">طلباتي</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-ink-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <h3 className="font-bold text-gray-900 mb-2">لا توجد طلبات بعد</h3>
            <p className="text-gray-500 text-sm mb-6">ابدأ باستعراض رسوماتنا الفنية</p>
            <Link href="/drawings" className="px-6 py-3 bg-ink-600 text-white font-bold rounded-xl hover:bg-ink-700 transition-all">
              استعرض الرسومات
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
              const StatusIcon = st.Icon;
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img src={`/api/drawings/image/${order.drawing_id}`} alt={order.drawing_title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }} />
                      </div>
                      <div>
                        <Link href={`/drawings/${order.drawing_id}`}
                          className="font-bold text-gray-900 hover:text-ink-700 transition-colors">
                          {order.drawing_title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-0.5">
                          طلب #{order.id} · {new Date(order.created_at).toLocaleDateString("ar-MA")}
                        </p>
                        <p className="text-sm text-gray-500">{order.city}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${st.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {st.label}
                      </span>
                      <span className="text-lg font-black text-ink-700">
                        {Number(order.price_snapshot).toFixed(2)} <span className="text-sm font-medium text-gray-500">درهم</span>
                      </span>
                    </div>
                  </div>

                  {order.status === "cancelled" && order.cancel_reason && (
                    <div className="mt-4 px-4 py-3 bg-red-50 rounded-xl text-sm text-red-600">
                      <strong>سبب الإلغاء:</strong> {order.cancel_reason}
                    </div>
                  )}

                  {order.status === "pending" && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button onClick={() => cancelOrder(order.id)}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-xl hover:bg-red-50 transition-all">
                        <XCircle className="w-4 h-4" />إلغاء الطلب
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
