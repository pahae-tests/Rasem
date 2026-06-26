import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import DrawingCard from "../../components/ui/DrawingCard";
import StarRating from "../../components/ui/StarRating";
import AuthModal from "../../components/ui/AuthModal";
import OrderModal from "../../components/ui/OrderModal";
import { useAuth } from "../../hooks/useAuth";
import { Heart, ShoppingBag, ChevronRight, ChevronLeft, Star, CheckCircle } from "lucide-react";

export default function DrawingDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const fetchData = () => {
    if (!id) return;
    fetch(`/api/drawings/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.drawing) setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  useEffect(() => {
    if (!id || !user) return;
    fetch(`/api/favorites/check/${id}`)
      .then((r) => r.json())
      .then((d) => setIsFav(d.isFavorite));
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => {
        const ordered = (d.orders || []).some(
          (o) =>
            o.drawing_id === parseInt(id) &&
            ["confirmed", "shipped", "delivered"].includes(o.status)
        );
        setCanReview(ordered);
      });
  }, [id, user]);

  useEffect(() => {
    if (!data || !user) return;
    const myReview = (data.reviews || []).find(
      (r) => r.user_name === user.name
    );
    if (myReview) {
      setHasReviewed(true);
      setRating(myReview.rating);
      setComment(myReview.comment || "");
    }
  }, [data, user]);

  const imageList = data
    ? [
        { type: "main", id: data.drawing.id },
        ...(data.gallery || []).map((g) => ({ type: "gallery", id: g.id })),
      ]
    : [];

  const getImgSrc = (img) =>
    img.type === "main"
      ? `/api/drawings/image/${img.id}`
      : `/api/drawings/gallery-image/${img.id}`;

  const prevImage = () =>
    setSelectedImgIndex((i) => (i === 0 ? imageList.length - 1 : i - 1));
  const nextImage = () =>
    setSelectedImgIndex((i) => (i === imageList.length - 1 ? 0 : i + 1));

  const toggleFav = async () => {
    if (!user) { setShowAuth(true); return; }
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drawing_id: id }),
    });
    const d = await res.json();
    setIsFav(d.action === "added");
  };

  const handleOrder = () => {
    if (!user) { setShowAuth(true); return; }
    setShowOrder(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    if (!rating) return setReviewError("يرجى اختيار تقييم");
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drawing_id: id, rating, comment }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setReviewSuccess(true);
      setHasReviewed(true);
      fetchData();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-ink-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!data || !data.drawing) {
    return (
      <Layout title="الرسم غير موجود">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Star className="w-10 h-10 text-gray-300" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">الرسم غير موجود</h1>
          <p className="text-gray-500">ربما تم حذف هذا الرسم</p>
        </div>
      </Layout>
    );
  }

  const { drawing, reviews, similar } = data;
  const avgStars = Number(drawing.average_rating || 0).toFixed(1);
  const currentImg = imageList[selectedImgIndex];

  return (
    <Layout title={`${drawing.title} - رسم`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Product top section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

          {/* Gallery slider */}
          <div>
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-100 shadow-lg mb-4 group">
              {currentImg && (
                <img
                  src={getImgSrc(currentImg)}
                  alt={drawing.title}
                  className="w-full h-full object-cover"
                />
              )}
              {imageList.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {imageList.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImgIndex(i)}
                        className={`h-2 rounded-full transition-all ${
                          i === selectedImgIndex ? "bg-white w-5" : "bg-white/50 w-2"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {imageList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {imageList.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImgIndex(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      i === selectedImgIndex
                        ? "border-ink-600"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img src={getImgSrc(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            {drawing.category_name && (
              <span className="inline-block bg-ink-50 text-ink-700 text-xs font-bold px-3 py-1 rounded-full mb-3 w-fit">
                {drawing.category_name}
              </span>
            )}
            <h1 className="text-3xl font-black text-gray-900 mb-4">{drawing.title}</h1>

            <div className="flex items-center gap-3 mb-4">
              <StarRating value={Math.round(drawing.average_rating || 0)} readOnly size="lg" />
              <span className="text-lg font-bold text-gray-700">{avgStars}</span>
              <span className="text-sm text-gray-400">({drawing.review_count} تقييم)</span>
            </div>

            {drawing.description && (
              <p className="text-gray-600 leading-relaxed mb-6">{drawing.description}</p>
            )}

            <div className="flex items-end gap-2 mb-6">
              <span className="text-4xl font-black text-ink-700">
                {Number(drawing.price).toFixed(2)}
              </span>
              <span className="text-lg text-gray-500 mb-1">درهم</span>
            </div>

            <div className="flex items-center gap-2 mb-6">
              {drawing.is_available && drawing.stock > 0 ? (
                <span className="flex items-center gap-1.5 text-green-600 font-semibold bg-green-50 px-3 py-1.5 rounded-full text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  متاح للطلب
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-red-600 font-semibold bg-red-50 px-3 py-1.5 rounded-full text-sm">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  غير متاح حالياً
                </span>
              )}
              <span className="text-sm text-gray-400">{drawing.total_orders} طلب</span>
            </div>

            {orderSuccess ? (
              <div className="p-5 bg-green-50 border border-green-100 rounded-2xl text-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="font-bold text-green-700">تم إرسال طلبك بنجاح!</p>
                <p className="text-sm text-green-600 mt-1">سنتواصل معك قريباً</p>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleOrder}
                  disabled={!drawing.is_available || drawing.stock < 1}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-ink-600 to-ink-700 hover:from-ink-700 hover:to-ink-800 text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  <ShoppingBag className="w-5 h-5" />
                  اطلب الآن
                </button>
                <button
                  onClick={toggleFav}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    isFav
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400"
                  }`}
                >
                  <Heart className="w-6 h-6" fill={isFav ? "currentColor" : "none"} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Reviews section ── */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            التقييمات ({reviews.length})
          </h2>

          {/* Review form — always shown when logged in */}
          {user ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Star className="w-5 h-5 text-sand-400 fill-sand-400" />
                {hasReviewed ? "تعديل تقييمك" : "أضف تقييمك"}
              </h3>

              {reviewSuccess ? (
                <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 font-medium">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  تم إرسال تقييمك بنجاح! شكراً لك.
                </div>
              ) : (
                <form onSubmit={submitReview} className="space-y-5">
                  {reviewError && (
                    <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                      {reviewError}
                    </div>
                  )}

                  {!canReview && (
                    <div className="px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
                      يمكن فقط للعملاء الذين اشتروا هذا الرسم (وتم تأكيد طلبهم) إضافة تقييم.
                    </div>
                  )}

                  {/* Star picker */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      تقييمك <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          disabled={!canReview}
                          className={`transition-transform ${canReview ? "hover:scale-110 cursor-pointer" : "cursor-not-allowed opacity-60"}`}
                        >
                          <Star
                            className={`w-9 h-9 transition-colors ${
                              s <= rating
                                ? "text-sand-400 fill-sand-400"
                                : "text-gray-200 fill-gray-200"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-sm text-gray-500 mr-3">
                        {rating === 1 && "ضعيف"}
                        {rating === 2 && "مقبول"}
                        {rating === 3 && "جيد"}
                        {rating === 4 && "جيد جداً"}
                        {rating === 5 && "ممتاز"}
                      </span>
                    </div>
                  </div>

                  {/* Comment textarea */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      تعليقك{" "}
                      <span className="text-gray-400 font-normal">(اختياري)</span>
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      disabled={!canReview}
                      rows={4}
                      placeholder="شاركنا رأيك في هذا الرسم... كيف وجدت جودته، التفاصيل، الألوان؟"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview || !canReview}
                    className="flex items-center gap-2 px-7 py-3 bg-ink-600 hover:bg-ink-700 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingReview ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        جارٍ الإرسال...
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4" />
                        {hasReviewed ? "تحديث التقييم" : "إرسال التقييم"}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Prompt for non-logged-in users */
            <div className="bg-ink-50 border border-ink-100 rounded-2xl p-6 mb-8 text-center">
              <Star className="w-10 h-10 text-ink-300 fill-ink-200 mx-auto mb-3" />
              <p className="text-ink-700 font-semibold mb-1">هل أعجبك هذا الرسم؟</p>
              <p className="text-ink-500 text-sm mb-4">سجل الدخول لتتمكن من إضافة تقييمك</p>
              <button
                onClick={() => setShowAuth(true)}
                className="px-6 py-2.5 bg-ink-600 text-white font-bold rounded-xl hover:bg-ink-700 transition-all text-sm"
              >
                تسجيل الدخول / إنشاء حساب
              </button>
            </div>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <Star className="w-12 h-12 text-gray-200 fill-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">لا توجد تقييمات بعد</p>
              <p className="text-gray-300 text-sm mt-1">كن أول من يقيّم هذا الرسم!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-ink-100 text-ink-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {r.user_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{r.user_name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(r.created_at).toLocaleDateString("ar-MA")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= r.rating
                              ? "text-sand-400 fill-sand-400"
                              : "text-gray-200 fill-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-xl px-4 py-3">
                      {r.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Similar drawings ── */}
        {similar && similar.length > 0 && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-6">رسومات مشابهة</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {similar.map((d) => (
                <DrawingCard key={d.id} drawing={d} />
              ))}
            </div>
          </div>
        )}
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => setShowAuth(false)}
        />
      )}
      {showOrder && (
        <OrderModal
          drawing={drawing}
          onClose={() => setShowOrder(false)}
          onSuccess={() => { setOrderSuccess(true); setShowOrder(false); }}
        />
      )}
    </Layout>
  );
}