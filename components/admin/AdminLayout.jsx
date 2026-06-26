import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import {
  LayoutDashboard, Image, ShoppingBag, Users, MessageSquare,
  LogOut, Menu, X, ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard, exact: true },
  { href: "/admin/drawings", label: "الرسومات", icon: Image },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
  { href: "/admin/users", label: "المستخدمون", icon: Users },
  { href: "/admin/contacts", label: "الرسائل والأسئلة", icon: MessageSquare },
];

export default function AdminLayout({ children, title = "لوحة الإدارة" }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [router.pathname]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-ink-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isActive = (item) =>
    item.exact ? router.pathname === item.href : router.pathname.startsWith(item.href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ink-500 to-ink-700 flex items-center justify-center">
            <span className="text-white font-black">ر</span>
          </div>
          <span className="font-black text-lg text-white">رسم</span>
        </Link>
        <p className="text-xs text-gray-400 mt-1">لوحة الإدارة</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                active ? "bg-ink-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}>
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-ink-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-400">مدير النظام</p>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-all">
          <LogOut className="w-4 h-4" />تسجيل الخروج
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>{title} - رسم</title>
      </Head>
      <div className="min-h-screen bg-gray-50 flex" dir="rtl">
        {/* Desktop sidebar */}
        <aside className="w-64 bg-gray-900 text-white hidden lg:flex flex-col fixed inset-y-0 right-0 z-30">
          <SidebarContent />
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="absolute right-0 bottom-0 w-full bg-gray-900 text-white flex flex-col animate-slide-up">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <span className="font-black text-white text-lg">رسم — الإدارة</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarContent />
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 lg:mr-64 flex flex-col min-w-0">
          <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 flex items-center gap-4 sticky top-0 z-20">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
              <Link href="/admin" className="hover:text-ink-600 transition-colors shrink-0">الرئيسية</Link>
              {router.pathname !== "/admin" && (
                <>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                  <span className="font-semibold text-gray-900 truncate">{title}</span>
                </>
              )}
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </>
  );
}
