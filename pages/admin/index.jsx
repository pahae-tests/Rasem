import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import Link from "next/link";
import { ShoppingBag, Users, TrendingUp, Clock } from "lucide-react";

const STATUS_LABELS = {
  pending: "قيد الانتظار", confirmed: "مؤكد",
  shipped: "مشحون", delivered: "تم التسليم", cancelled: "ملغى",
};
const STATUS_COLORS = {
  pending: "text-yellow-600 bg-yellow-50",
  confirmed: "text-blue-600 bg-blue-50",
  shipped: "text-purple-600 bg-purple-50",
  delivered: "text-green-600 bg-green-50",
  cancelled: "text-red-600 bg-red-50",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then((d) => { setStats(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <AdminLayout title="لوحة التحكم">
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-ink-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const statusMap = {};
  (stats.ordersByStatus || []).forEach((s) => { statusMap[s.status] = s.count; });

  const cards = [
    { label: "إجمالي الطلبات", value: stats.totalOrders, icon: ShoppingBag, color: "from-blue-500 to-blue-600" },
    { label: "إجمالي العملاء", value: stats.totalClients, icon: Users, color: "from-green-500 to-green-600" },
    { label: "الإيرادات (درهم)", value: Number(stats.totalRevenue).toFixed(2), icon: TrendingUp, color: "from-ink-500 to-ink-600" },
    { label: "قيد الانتظار", value: statusMap.pending || 0, icon: Clock, color: "from-yellow-500 to-yellow-600" },
  ];

  return (
    <AdminLayout title="لوحة التحكم">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium truncate">{card.label}</p>
                  <p className="text-xl sm:text-2xl font-black text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">الإيرادات الشهرية</h2>
          {stats.monthlyRevenue?.length > 0 ? (
            <div className="overflow-x-auto">
              <div style={{ minWidth: 280 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => [`${v} درهم`, "الإيرادات"]} />
                    <Line type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3, fill: "#7c3aed" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">لا توجد بيانات بعد</div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">الطلبات الشهرية</h2>
          {stats.monthlyRevenue?.length > 0 ? (
            <div className="overflow-x-auto">
              <div style={{ minWidth: 280 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => [v, "الطلبات"]} />
                    <Bar dataKey="orders" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">لا توجد بيانات بعد</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-sm sm:text-base">آخر الطلبات</h2>
            <Link href="/admin/orders" className="text-xs text-ink-600 font-semibold hover:underline">عرض الكل</Link>
          </div>
          <div className="space-y-2">
            {(stats.recentOrders || []).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">#{order.id} — {order.client_name}</p>
                  <p className="text-xs text-gray-400 truncate">{order.drawing_title}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${STATUS_COLORS[order.status] || "bg-gray-50 text-gray-600"}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
            ))}
            {!stats.recentOrders?.length && <p className="text-sm text-gray-400 text-center py-4">لا توجد طلبات بعد</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-sm sm:text-base">الرسومات الأكثر طلباً</h2>
            <Link href="/admin/drawings" className="text-xs text-ink-600 font-semibold hover:underline">إدارة</Link>
          </div>
          <div className="space-y-3">
            {(stats.popularDrawings || []).map((d, i) => (
              <div key={d.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-ink-100 text-ink-700 text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{d.title}</p>
                  <p className="text-xs text-gray-400">{d.total_orders} طلب · ⭐ {Number(d.average_rating).toFixed(1)}</p>
                </div>
              </div>
            ))}
            {!stats.popularDrawings?.length && <p className="text-sm text-gray-400 text-center py-4">لا توجد رسومات بعد</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
