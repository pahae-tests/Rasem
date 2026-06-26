import Link from "next/link";
import { Star, Palette } from "lucide-react";

export default function DrawingCard({ drawing }) {
  const stars = Math.round(drawing.average_rating || 0);

  return (
    <Link href={`/drawings/${drawing.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-ink-200 group-hover:-translate-y-1">
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          <img
            src={`/api/drawings/image/${drawing.id}`}
            alt={drawing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentNode.querySelector(".fallback-icon")?.classList.remove("hidden");
            }}
          />
          <div className="fallback-icon hidden absolute inset-0 flex items-center justify-center bg-gray-100">
            <Palette className="w-12 h-12 text-gray-300" />
          </div>
          {!drawing.is_available && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 text-sm font-bold px-4 py-2 rounded-full">غير متاح</span>
            </div>
          )}
          {drawing.category_name && (
            <div className="absolute top-3 right-3">
              <span className="bg-white/90 backdrop-blur-sm text-ink-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {drawing.category_name}
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-ink-700 transition-colors">
            {drawing.title}
          </h3>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-3.5 h-3.5 ${s <= stars ? "text-sand-400 fill-sand-400" : "text-gray-200 fill-gray-200"}`} />
            ))}
            {drawing.review_count > 0 && (
              <span className="text-xs text-gray-400 mr-1">({drawing.review_count})</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-ink-700">
              {Number(drawing.price).toFixed(2)}
              <span className="text-xs font-medium text-gray-500 mr-1">درهم</span>
            </span>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
              {drawing.total_orders} طلب
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
