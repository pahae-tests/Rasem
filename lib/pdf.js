import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function generateInvoicePDF(order) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  doc.setFont("helvetica");

  doc.setFillColor(109, 40, 217);
  doc.rect(0, 0, 210, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text("RASEM", 20, 25);
  doc.setFontSize(11);
  doc.text("rasem.ma | contact@rasem.ma", 20, 33);

  doc.setFontSize(18);
  doc.text(`Invoice #${order.id}`, 190, 25, { align: "right" });

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(11);

  const infoY = 55;
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 20, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(order.customer_name, 20, infoY + 7);
  doc.text(order.customer_phone, 20, infoY + 14);
  doc.text(order.address, 20, infoY + 21);
  doc.text(order.city, 20, infoY + 28);

  doc.setFont("helvetica", "bold");
  doc.text("Date:", 130, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(order.created_at).toLocaleDateString("fr-MA"), 150, infoY);

  doc.setFont("helvetica", "bold");
  doc.text("Status:", 130, infoY + 7);
  doc.setFont("helvetica", "normal");
  doc.text("Confirmed", 150, infoY + 7);

  autoTable(doc, {
    startY: infoY + 40,
    head: [["Drawing", "Unit Price", "Qty", "Total"]],
    body: [
      [
        order.drawing_title || "Custom Drawing",
        `${Number(order.price_snapshot).toFixed(2)} MAD`,
        "1",
        `${Number(order.price_snapshot).toFixed(2)} MAD`,
      ],
    ],
    styles: { font: "helvetica", fontSize: 11 },
    headStyles: { fillColor: [109, 40, 217], textColor: 255 },
    footStyles: { fillColor: [240, 240, 240] },
    foot: [["", "", "Total", `${Number(order.price_snapshot).toFixed(2)} MAD`]],
  });

  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFillColor(245, 243, 255);
  doc.roundedRect(15, finalY, 180, 25, 3, 3, "F");
  doc.setFontSize(10);
  doc.setTextColor(109, 40, 217);
  doc.text(
    "Merci pour votre commande ! Nous vous contacterons bientôt.",
    105,
    finalY + 13,
    { align: "center" }
  );

  return doc.output("arraybuffer");
}
