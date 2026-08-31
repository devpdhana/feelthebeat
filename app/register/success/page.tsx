"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { jsPDF } from "jspdf";
import { raceCategories } from "@/data/events";

function SuccessContent() {
  const searchParams = useSearchParams();
  const regNo = searchParams.get("regNo") || "FTB2026-000000";
  const orderId = searchParams.get("orderId") || "";
  const bibNumber = searchParams.get("bibNumber") || "";
  const bibName = searchParams.get("bibName") || "";
  const name = searchParams.get("name") || "Runner";
  const category = searchParams.get("category") || "10 KM Run";
  const schoolName = searchParams.get("schoolName") || "";
  const paymentId = searchParams.get("paymentId") || "pay_mockid";

  const matchedCategory = raceCategories.find(
    (c) =>
      c.name.toLowerCase() === category.toLowerCase() ||
      c.id.toLowerCase() === category.toLowerCase()
  );
  const startTime = matchedCategory?.startTime || "6:30 AM";
  const formattedStartTime = startTime.length === 7 ? `0${startTime}` : startTime;
  const isTimed = matchedCategory ? matchedCategory.isTimed : (category.toLowerCase().includes("5") || category.toLowerCase().includes("10"));
  const cutoffTime = matchedCategory?.cutoffTime || "7:00 AM";

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Set styling parameters
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, "F");

    // Title branding
    doc.setTextColor(6, 152, 243); // Brand blue
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("FEEL THE BEAT RUN 2026", 20, 25);

    doc.setFontSize(10);
    doc.setTextColor(95, 99, 104);
    doc.text(" OFFICIAL REGISTRATION RECEIPT", 20, 32);

    doc.setDrawColor(6, 152, 243);
    doc.line(20, 38, 190, 38);

    // Ticket Number Box
    doc.setFillColor(248, 250, 253);
    doc.rect(20, 44, 170, 32, "F");

    doc.setTextColor(95, 99, 104);
    doc.setFontSize(8);
    if (orderId) {
      doc.text("ORDER ID:", 25, 52);
      doc.setTextColor(6, 152, 243);
      doc.setFontSize(13);
      doc.text(orderId, 25, 60);
    } else {
      doc.text("REGISTRATION NO:", 25, 52);
      doc.setTextColor(6, 152, 243);
      doc.setFontSize(13);
      doc.text(regNo, 25, 60);
    }

    if (bibNumber) {
      doc.setTextColor(95, 99, 104);
      doc.setFontSize(8);
      doc.text("BIB NUMBER:", 120, 52);
      doc.setTextColor(6, 152, 243);
      doc.setFontSize(16);
      doc.text(String(bibNumber), 120, 62);
    }

    if (orderId && regNo) {
      doc.setTextColor(95, 99, 104);
      doc.setFontSize(8);
      doc.text(`REG NO: ${regNo}`, 25, 70);
    }

    // Grid fields
    let yPos = 88;
    doc.setFontSize(10);
    doc.setTextColor(95, 99, 104);
    doc.text("RUNNER NAME:", 20, yPos);
    doc.setTextColor(9, 14, 19);
    doc.text(name.toUpperCase(), 75, yPos);

    if (bibName) {
      yPos += 12;
      doc.setTextColor(95, 99, 104);
      doc.text("BIB NAME:", 20, yPos);
      doc.setTextColor(9, 14, 19);
      doc.text(bibName.toUpperCase(), 75, yPos);
    }

    yPos += 12;
    doc.setTextColor(95, 99, 104);
    doc.text("RACE CATEGORY:", 20, yPos);
    doc.setTextColor(9, 14, 19);
    doc.text(category.toUpperCase(), 75, yPos);

    yPos += 12;
    doc.setTextColor(95, 99, 104);
    doc.text("EVENT DATE:", 20, yPos);
    doc.setTextColor(9, 14, 19);
    doc.text("27 SEPTEMBER 2026", 75, yPos);

    yPos += 12;
    doc.setTextColor(95, 99, 104);
    doc.text("REPORTING TIME:", 20, yPos);
    doc.setTextColor(9, 14, 19);
    doc.text("05:00 AM", 75, yPos);

    yPos += 12;
    doc.setTextColor(95, 99, 104);
    doc.text("START TIME:", 20, yPos);
    doc.setTextColor(9, 14, 19);
    doc.text(formattedStartTime, 75, yPos);

    if (isTimed) {
      yPos += 12;
      doc.setTextColor(95, 99, 104);
      doc.text("CUT-OFF TIME:", 20, yPos);
      doc.setTextColor(9, 14, 19);
      doc.text(cutoffTime, 75, yPos);
    }

    yPos += 12;
    doc.setTextColor(95, 99, 104);
    doc.text("VENUE LOCATION:", 20, yPos);
    doc.setTextColor(9, 14, 19);
    doc.text("DEBOER GROUND VELLORE, TAMIL NADU", 75, yPos);

    yPos += 12;
    doc.setTextColor(95, 99, 104);
    doc.text("PAYMENT STATUS:", 20, yPos);
    doc.setTextColor(0, 180, 100); // Darker Green for white contrast
    doc.text("PAID", 75, yPos);

    yPos += 9;
    doc.line(20, yPos, 190, yPos);

    // Disclaimer footer
    doc.setTextColor(139, 139, 139);
    doc.setFontSize(8);
    doc.text("Please bring a printed copy or digital copy of this PDF to the Expo for BIB collection.", 20, yPos + 8);
    doc.text("Proof of identity matches birth certificates/IDs is required during distribution.", 20, yPos + 15);

    doc.save(`FTB2026-Voucher-${orderId || regNo}.pdf`);
  };

  return (
    <div className="mx-auto max-w-xl px-4 relative z-10">
      <Card className="flex flex-col gap-6 p-6 md:p-8 border border-brand-primary/12 shadow-[0_10px_30px_rgba(6,152,243,0.08)] bg-white items-center text-center rounded-2xl">

        {/* Verification pulse badge */}
        <div className="w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center relative">
          <svg className="w-8 h-8 text-brand-primary stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <div className="absolute inset-0 rounded-full border border-brand-primary/40 animate-ping opacity-25" />
        </div>

        <div className="flex flex-col gap-1.5 mt-2">
          <span className="font-mono text-[9px] text-brand-primary tracking-[0.2em] uppercase font-bold"> INBOUND_COMPLETE</span>
          <h2 className="font-display text-2xl font-black uppercase text-default tracking-tight">
            REGISTRATION SUCCESSFUL
          </h2>
        </div>

        {/* Highlight Order ID and Bib Number Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full font-mono">
          {orderId && (
            <div className="border border-brand-primary/20 bg-brand-primary/5 p-4 rounded-xl flex flex-col items-center justify-center">
              <span className="text-[9px] uppercase tracking-wider text-muted-default font-semibold">ORDER ID</span>
              <span className="text-base sm:text-lg font-black text-brand-primary mt-0.5">{orderId}</span>
            </div>
          )}
          {bibNumber && (
            <div className="border border-brand-primary/20 bg-brand-primary/5 p-4 rounded-xl flex flex-col items-center justify-center">
              <span className="text-[9px] uppercase tracking-wider text-muted-default font-semibold">BIB NUMBER</span>
              <span className="text-xl sm:text-2xl font-black text-brand-primary mt-0.5">{bibNumber}</span>
            </div>
          )}
        </div>

        {/* Invoice specifications summary */}
        <div className="border border-brand-primary/12 bg-[#F8FAFD] p-4 font-mono text-[11px] text-left text-muted-default w-full flex flex-col gap-2 rounded-xl">
          {orderId && (
            <div className="flex justify-between border-b border-brand-primary/8 pb-2 mb-1 text-default font-bold">
              <span>ORDER ID:</span>
              <span className="text-brand-primary">{orderId}</span>
            </div>
          )}
          {bibNumber && (
            <div className="flex justify-between border-b border-brand-primary/8 pb-2 mb-1 text-default font-bold">
              <span>BIB NUMBER:</span>
              <span className="text-brand-primary text-sm font-black">{bibNumber}</span>
            </div>
          )}
          {regNo && (
            <div className="flex justify-between">
              <span>REGISTRATION NO:</span>
              <span className="text-default font-semibold">{regNo}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>RUNNER NAME:</span>
            <span className="text-default font-semibold">{name.toUpperCase()}</span>
          </div>
          {bibName && (
            <div className="flex justify-between">
              <span>BIB NAME:</span>
              <span className="text-brand-primary font-bold">{bibName.toUpperCase()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>RACE CATEGORY:</span>
            <span className="text-default font-semibold">{category.toUpperCase()}</span>
          </div>
          {schoolName && (
            <div className="flex justify-between">
              <span>SCHOOL NAME:</span>
              <span className="text-default font-semibold">{schoolName.toUpperCase()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>EVENT DATE:</span>
            <span className="text-default font-semibold">27 SEPTEMBER 2026</span>
          </div>
          <div className="flex justify-between">
            <span>REPORTING TIME:</span>
            <span className="text-default font-semibold">5:00 AM</span>
          </div>
          <div className="flex justify-between">
            <span>START TIME:</span>
            <span className="text-default font-semibold">{startTime}</span>
          </div>
          {isTimed && (
            <div className="flex justify-between">
              <span>CUT-OFF TIME:</span>
              <span className="text-brand-primary font-semibold">{cutoffTime}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>VENUE:</span>
            <span className="text-default font-semibold">VELLORE, TN</span>
          </div>
          <div className="flex justify-between">
            <span>PAYMENT STATUS:</span>
            <span className="text-green-600 font-bold">PAID</span>
          </div>
        </div>


        {/* Action Triggers */}
        <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
          <button
            onClick={downloadPDF}
            className="flex-1 bg-brand-primary py-3.5 font-display text-[10px] font-black uppercase tracking-widest text-white hover:bg-brand-primary-hover transition-colors cursor-pointer text-center rounded shadow-sm"
          >
            DOWNLOAD CONFIRMATION
          </button>
          <Button href="/" variant="outline" className="flex-1 py-3.5 text-[10px] font-black tracking-widest">
            BACK TO HOME
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <div className="relative pt-40 pb-24 text-default bg-[#F5FAFF]">
      <div className="absolute inset-0 telemetry-grid opacity-[0.03] pointer-events-none" />
      <Suspense fallback={
        <div className="text-center font-mono text-xs text-muted-default"> LOADING RECEIPT...</div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
