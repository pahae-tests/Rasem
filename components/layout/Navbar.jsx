import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import {
  Menu, X, Settings, ShoppingBag, Heart, User, LogOut, ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "الرئيسية" },
    { href: "/drawings", label: "الرسومات" },
    { href: "/faq", label: "الأسئلة الشائعة" },
    { href: "/contact", label: "اتصل بنا" },
  ];

  const isActive = (href) => href === "/" ? router.pathname === "/" : router.pathname.startsWith(href);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ink-600 to-ink-800 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-black text-lg leading-none">ر</span>
            </div>
            <span className="text-xl font-black text-ink-700 tracking-tight">رسم</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive(l.href) ? "bg-ink-50 text-ink-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 bg-ink-50 hover:bg-ink-100 text-ink-700 px-3 py-2 rounded-xl text-sm font-semibold transition-all">
                  <div className="w-7 h-7 rounded-full bg-ink-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                  <ChevronDown className="w-4 h-4 shrink-0" />
                </button>
                {userMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-scale-in z-50">
                    {user.role === "admin" && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-ink-50 hover:text-ink-700 font-medium">
                        <Settings className="w-4 h-4" />لوحة الإدارة
                      </Link>
                    )}
                    <Link href="/orders" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-ink-50 hover:text-ink-700 font-medium">
                      <ShoppingBag className="w-4 h-4" />طلباتي
                    </Link>
                    <Link href="/favorites" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-ink-50 hover:text-ink-700 font-medium">
                      <Heart className="w-4 h-4" />المفضلة
                    </Link>
                    <Link href="/profile" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-ink-50 hover:text-ink-700 font-medium">
                      <User className="w-4 h-4" />ملفي الشخصي
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={() => { setUserMenuOpen(false); logout(); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium text-right">
                      <LogOut className="w-4 h-4" />تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-ink-700 transition-colors">
                  تسجيل الدخول
                </Link>
                <Link href="/auth/register" className="px-4 py-2 text-sm font-semibold bg-ink-600 hover:bg-ink-700 text-white rounded-xl transition-all shadow-sm hover:shadow-md">
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1 animate-slide-up">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-semibold ${isActive(l.href) ? "bg-ink-50 text-ink-700" : "text-gray-700 hover:bg-gray-50"}`}>
              {l.label}
            </Link>
          ))}
          <hr className="border-gray-100 my-2" />
          {user ? (
            <>
              {user.role === "admin" && (
                <Link href="/admin" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-ink-700 hover:bg-ink-50">
                  <Settings className="w-4 h-4" />لوحة الإدارة
                </Link>
              )}
              <Link href="/orders" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                <ShoppingBag className="w-4 h-4" />طلباتي
              </Link>
              <Link href="/favorites" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                <Heart className="w-4 h-4" />المفضلة
              </Link>
              <Link href="/profile" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                <User className="w-4 h-4" />ملفي الشخصي
              </Link>
              <button onClick={() => { setMobileOpen(false); logout(); }}
                className="flex items-center gap-2 w-full text-right px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4" />تسجيل الخروج
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                تسجيل الدخول
              </Link>
              <Link href="/auth/register" onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold bg-ink-600 text-white text-center">
                إنشاء حساب
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
