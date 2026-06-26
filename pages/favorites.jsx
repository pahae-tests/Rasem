import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/layout/Layout";
import DrawingCard from "../components/ui/DrawingCard";
import { useAuth } from "../hooks/useAuth";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/auth/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/favorites").then((r) => r.json()).then((d) => { setFavorites(d.favorites || []); setLoading(false); });
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <Layout title="المفضلة - رسم">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black text-gray-900 mb-8">المفضلة لديّ</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-ink-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <h3 className="font-bold text-gray-900 mb-2">قائمة المفضلة فارغة</h3>
            <p className="text-gray-500 text-sm mb-6">أضف الرسومات التي تعجبك إلى المفضلة</p>
            <Link href="/drawings" className="px-6 py-3 bg-ink-600 text-white font-bold rounded-xl hover:bg-ink-700 transition-all">
              استعرض الرسومات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {favorites.map((d) => <DrawingCard key={d.id} drawing={d} />)}
          </div>
        )}
      </div>
    </Layout>
  );
}
