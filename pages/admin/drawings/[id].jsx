import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../../components/admin/AdminLayout";
import DrawingForm from "../../../components/admin/DrawingForm";

export default function EditDrawing() {
  const router = useRouter();
  const { id } = router.query;
  const [drawing, setDrawing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/drawings/${id}`)
      .then((r) => r.json())
      .then((d) => { setDrawing(d.drawing); setLoading(false); });
  }, [id]);

  if (loading || !drawing) {
    return (
      <AdminLayout title="تعديل الرسم">
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-ink-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`تعديل: ${drawing.title}`}>
      <DrawingForm initialData={drawing} drawingId={parseInt(id)} />
    </AdminLayout>
  );
}
