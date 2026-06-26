import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Upload, X, ImagePlus } from "lucide-react";

export default function DrawingForm({ initialData = null, drawingId = null }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    stock: initialData?.stock ?? 1,
    category_id: initialData?.category_id || "",
    is_available: initialData?.is_available !== undefined ? (initialData.is_available ? 1 : 0) : 1,
  });
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.categories || []));
    if (drawingId) {
      fetch(`/api/drawings/${drawingId}`).then((r) => r.json()).then((d) => {
        if (d.gallery) setExistingGallery(d.gallery);
      });
    }
  }, [drawingId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const toggleAvailable = () => {
    setForm((f) => ({ ...f, is_available: f.is_available ? 0 : 1 }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMainImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setMainImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.price) return setError("العنوان والسعر مطلوبان");
    if (!drawingId && !mainImage) return setError("الصورة الرئيسية مطلوبة");

    setLoading(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description || "");
    fd.append("price", form.price);
    fd.append("stock", form.stock);
    fd.append("category_id", form.category_id || "");
    fd.append("is_available", form.is_available);

    if (mainImage) fd.append("main_image", mainImage);
    galleryImages.forEach((f, i) => fd.append(`gallery_${i}`, f));

    try {
      const url = drawingId ? `/api/admin/drawings/${drawingId}` : "/api/admin/drawings";
      const method = drawingId ? "PUT" : "POST";
      const res = await fetch(url, { method, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ ما");
      router.push("/admin/drawings");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteGalleryImage = async (imgId) => {
    if (!confirm("حذف هذه الصورة؟")) return;
    const res = await fetch(`/api/admin/gallery/${imgId}`, { method: "DELETE" });
    if (res.ok) setExistingGallery((prev) => prev.filter((g) => g.id !== imgId));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main fields */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-gray-900">المعلومات الأساسية</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">العنوان <span className="text-red-500">*</span></label>
              <input name="title" type="text" value={form.title} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">الوصف</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">السعر (درهم) <span className="text-red-500">*</span></label>
                <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">المخزون</label>
                <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all" />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ImagePlus className="w-5 h-5 text-ink-600" />الصور
            </h3>

            {/* Main image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الصورة الرئيسية {!drawingId && <span className="text-red-500">*</span>}
                {drawingId && <span className="text-gray-400 font-normal"> (اختر صورة جديدة لتغيير الحالية)</span>}
              </label>
              <div className="flex gap-4 items-start flex-wrap">
                {drawingId && !mainImagePreview && (
                  <div className="relative">
                    <img src={`/api/drawings/image/${drawingId}`} alt="current"
                      className="w-24 h-24 object-cover rounded-xl border-2 border-ink-200" />
                    <span className="absolute -top-2 -right-2 bg-ink-600 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">حالية</span>
                  </div>
                )}
                {mainImagePreview && (
                  <div className="relative">
                    <img src={mainImagePreview} alt="new" className="w-24 h-24 object-cover rounded-xl border-2 border-green-400" />
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">جديدة</span>
                    <button type="button" onClick={() => { setMainImage(null); setMainImagePreview(null); }}
                      className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 hover:border-ink-400 rounded-xl cursor-pointer transition-colors bg-gray-50 hover:bg-ink-50">
                  <Upload className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">رفع صورة</span>
                  <input type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Gallery */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">صور المعرض (متعددة)</label>
              {existingGallery.length > 0 && (
                <div className="flex gap-3 flex-wrap mb-3">
                  {existingGallery.map((g) => (
                    <div key={g.id} className="relative group">
                      <img src={`/api/drawings/gallery-image/${g.id}`} alt=""
                        className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                      <button type="button" onClick={() => deleteGalleryImage(g.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 hover:border-ink-400 rounded-xl cursor-pointer transition-colors bg-gray-50 hover:bg-ink-50 w-fit">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">إضافة صور للمعرض</span>
                <input type="file" accept="image/*" multiple onChange={(e) => setGalleryImages(Array.from(e.target.files))} className="hidden" />
              </label>
              {galleryImages.length > 0 && (
                <p className="text-xs text-green-600 mt-2 font-medium">✓ تم اختيار {galleryImages.length} صورة جديدة</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-gray-900">التصنيف والحالة</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">التصنيف</label>
              <select name="category_id" value={form.category_id} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100 outline-none text-sm transition-all bg-white">
                <option value="">بدون تصنيف</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* RTL-safe toggle: label on right, switch on left */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-gray-700">متاح للبيع</span>
              <button type="button" onClick={toggleAvailable}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${form.is_available ? "bg-ink-600" : "bg-gray-200"}`}
                dir="ltr">
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${form.is_available ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-ink-600 to-ink-700 hover:from-ink-700 hover:to-ink-800 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />جارٍ الحفظ...</>
            ) : (
              drawingId ? "حفظ التعديلات" : "إضافة الرسم"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
