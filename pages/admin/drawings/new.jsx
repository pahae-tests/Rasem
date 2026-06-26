import AdminLayout from "../../../components/admin/AdminLayout";
import DrawingForm from "../../../components/admin/DrawingForm";

export default function NewDrawing() {
  return (
    <AdminLayout title="إضافة رسم جديد">
      <DrawingForm />
    </AdminLayout>
  );
}
