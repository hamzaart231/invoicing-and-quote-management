"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";
import { DocumentData, CompanyData } from "@/lib/types";
import DocumentPrint from "@/components/DocumentPrint";
import Link from "next/link";
import { ArrowLeft, Edit2, Printer, Trash2 } from "lucide-react";

export default function DocumentViewPage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLang();
  const router = useRouter();
  const [doc, setDoc] = useState<DocumentData | null>(null);
const [company, setCompany] = useState<CompanyData>({ name: "", address: "", phone: "", email: "", ice: "", logo: "", currency: "MAD" });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      fetch(`/api/documents/${id}`).then(r => r.json()),
      fetch("/api/company").then(r => r.json()),
    ]).then(([docData, compData]) => {
      setDoc(docData.document ?? null);
      if (compData.company) setCompany(compData.company);
      setLoading(false);
    });
  }, [id]);

const handlePrint = () => {
  const printContent = document.getElementById("print-doc");
  if (!printContent) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
<!DOCTYPE html>
<html lang="${doc?.language}" dir="${doc?.language === "ar" ? "rtl" : "ltr"}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>${doc?.number}</title>

<script src="https://cdn.tailwindcss.com"></script>

<style>
@page{
    size:A4;
    margin:10mm;
}

html,body{
    margin:0;
    padding:0;
    background:#ffffff;
    font-family:Arial,"Noto Sans Arabic",sans-serif;
}

*{
    -webkit-print-color-adjust:exact !important;
    print-color-adjust:exact !important;
    color-adjust:exact !important;
}

table{
    width:100%;
    border-collapse:collapse;
}

th,td{
    border:1px solid #d1d5db;
}

img{
    max-width:100%;
}

.shadow-xl,
.shadow-md,
.shadow-sm{
    box-shadow:none !important;
}
</style>

</head>

<body>

${printContent.innerHTML}

<script>
window.onload=function(){
setTimeout(()=>{
window.print();
},500);
}
<\/script>

</body>
</html>
`);

  printWindow.document.close();
};

  const handleDelete = async () => {
    if (!window.confirm(t(lang, "deleteConfirm"))) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    router.push("/documents");
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!doc) {
    return <div className="text-center py-16 text-gray-400">Document not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Toolbar - no-print */}
      <div className="flex items-center gap-3 mb-6 no-print flex-wrap">
        <button onClick={() => router.push("/documents")} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition">
          <ArrowLeft size={18} className={lang === "ar" ? "rotate-180" : ""} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1">{doc.number}</h1>
        <Link href={`/documents/${id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
          <Edit2 size={16} />
          {t(lang, "edit")}
        </Link>
        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition">
          <Printer size={16} />
          {t(lang, "print")}
        </button>
        <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition">
          <Trash2 size={16} />
          {t(lang, "delete")}
        </button>
      </div>

      {/* Document */}
      <div id="print-doc" className="shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <DocumentPrint doc={doc} company={company} />
      </div>
    </div>
  );
}
