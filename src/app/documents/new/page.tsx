"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DocumentForm from "@/components/DocumentForm";

function NewDocumentContent() {
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") ?? "invoice") as "invoice" | "quote";

  return <DocumentForm mode="create" initial={{ type }} />;
}

export default function NewDocumentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div></div>}>
      <NewDocumentContent />
    </Suspense>
  );
}
