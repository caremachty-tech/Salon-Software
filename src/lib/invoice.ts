import jsPDF from "jspdf";

type InvoiceItem = { name: string; price: number; qty: number };

type InvoiceData = {
  invoiceNo: string;
  date: string;
  salonName: string;
  salonPhone?: string | null;
  customerName: string;
  customerPhone?: string | null;
  stylistName?: string | null;
  items: InvoiceItem[];
  subtotal: number;
  pointsDiscount: number;
  tax: number;
  total: number;
  pointsEarned: number;
  loyaltyBalance: number;
};

export const generateInvoicePDF = (data: InvoiceData): jsPDF => {
  const doc = new jsPDF({ unit: "mm", format: "a5" });
  const W = 148;
  let y = 0;

  const line = (yy: number) => { doc.setDrawColor(220, 220, 220); doc.line(10, yy, W - 10, yy); };
  const text = (txt: string, x: number, yy: number, opts?: { size?: number; bold?: boolean; align?: "left" | "center" | "right"; color?: [number, number, number] }) => {
    doc.setFontSize(opts?.size ?? 9);
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    if (opts?.color) doc.setTextColor(...opts.color);
    else doc.setTextColor(30, 30, 30);
    doc.text(txt, x, yy, { align: opts?.align ?? "left" });
  };

  // Header background
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, W, 28, "F");

  text(data.salonName, W / 2, 12, { size: 14, bold: true, align: "center", color: [255, 215, 0] });
  text("INVOICE", W / 2, 20, { size: 9, align: "center", color: [180, 180, 180] });
  if (data.salonPhone) text(data.salonPhone, W / 2, 25, { size: 8, align: "center", color: [150, 150, 150] });

  y = 35;
  // Invoice meta
  text(`Invoice #: ${data.invoiceNo}`, 10, y, { size: 8 });
  text(`Date: ${data.date}`, W - 10, y, { size: 8, align: "right" });
  y += 6;
  text(`Customer: ${data.customerName}`, 10, y, { size: 8, bold: true });
  if (data.customerPhone) text(`Phone: ${data.customerPhone}`, W - 10, y, { size: 8, align: "right" });
  y += 5;
  if (data.stylistName) text(`Stylist: ${data.stylistName}`, 10, y, { size: 8 });
  y += 4;
  line(y); y += 5;

  // Table header
  doc.setFillColor(245, 245, 245);
  doc.rect(10, y - 3, W - 20, 7, "F");
  text("Item", 12, y + 1, { size: 8, bold: true });
  text("Qty", W / 2, y + 1, { size: 8, bold: true, align: "center" });
  text("Price", W - 12, y + 1, { size: 8, bold: true, align: "right" });
  y += 8;

  // Items
  for (const item of data.items) {
    text(item.name, 12, y, { size: 8 });
    text(String(item.qty), W / 2, y, { size: 8, align: "center" });
    text(`Rs.${(item.price * item.qty).toFixed(2)}`, W - 12, y, { size: 8, align: "right" });
    y += 6;
  }

  y += 2; line(y); y += 5;

  // Totals
  const row = (label: string, val: string, bold = false, color?: [number, number, number]) => {
    text(label, W - 55, y, { size: 8, bold, color });
    text(val, W - 12, y, { size: 8, bold, align: "right", color });
    y += 5;
  };
  row("Subtotal", `Rs.${data.subtotal.toFixed(2)}`);
  if (data.pointsDiscount > 0) row("Points discount", `-Rs.${data.pointsDiscount.toFixed(2)}`, false, [34, 139, 34]);
  row("Tax (8%)", `Rs.${data.tax.toFixed(2)}`);
  y += 1; line(y); y += 4;
  row("TOTAL", `Rs.${data.total.toFixed(2)}`, true);

  y += 4; line(y); y += 6;

  // Loyalty footer
  doc.setFillColor(255, 250, 230);
  doc.rect(10, y - 3, W - 20, 12, "F");
  text(`Loyalty points earned: +${data.pointsEarned} pts`, 12, y + 1, { size: 8, color: [180, 120, 0] });
  text(`Balance: ${data.loyaltyBalance} pts = Rs.${(data.loyaltyBalance * 0.1).toFixed(2)}`, 12, y + 6, { size: 8, color: [180, 120, 0] });
  y += 16;

  text("Thank you for visiting! See you again.", W / 2, y, { size: 8, align: "center", color: [120, 120, 120] });

  return doc;
};

export const buildWhatsAppMessage = (data: InvoiceData): string => {
  const lines = [
    `*${data.salonName} — Invoice*`,
    `Invoice #: ${data.invoiceNo}`,
    `Date: ${data.date}`,
    ``,
    `*Customer:* ${data.customerName}`,
    data.stylistName ? `*Stylist:* ${data.stylistName}` : "",
    ``,
    `*Items:*`,
    ...data.items.map((i) => `• ${i.name} × ${i.qty} — Rs.${(i.price * i.qty).toFixed(2)}`),
    ``,
    `Subtotal: Rs.${data.subtotal.toFixed(2)}`,
    data.pointsDiscount > 0 ? `Points discount: -Rs.${data.pointsDiscount.toFixed(2)}` : "",
    `Tax (8%): Rs.${data.tax.toFixed(2)}`,
    `*Total: Rs.${data.total.toFixed(2)}*`,
    ``,
    `🎁 Points earned: +${data.pointsEarned} pts`,
    `Balance: ${data.loyaltyBalance} pts`,
    ``,
    `Thank you for visiting! 💇`,
  ].filter(Boolean).join("\n");
  return lines;
};
