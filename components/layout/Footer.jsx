import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ink-500 to-ink-700 flex items-center justify-center">
                <span className="text-white font-black text-lg">ر</span>
              </div>
              <span className="text-xl font-black text-white">رسم</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              متجر الرسومات الفنية الأصيلة. نقدم لك أجمل الرسومات المرسومة يدوياً بعناية من قِبل فنانينا الموهوبين.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">روابط سريعة</h3>
            <ul className="space-y-2">
              {[
                { href: "/drawings", label: "استعرض الرسومات" },
                { href: "/faq", label: "الأسئلة الشائعة" },
                { href: "/contact", label: "اتصل بنا" },
                { href: "/auth/register", label: "إنشاء حساب" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-gray-500 shrink-0" />contact@rasem.ma
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-gray-500 shrink-0" />+212 6 00 00 00 00
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-gray-500 shrink-0" />المغرب
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} رسم. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
