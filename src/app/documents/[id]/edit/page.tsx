"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DocumentForm from "@/components/DocumentForm";
import { DocumentData, DocumentItem } from "@/lib/types";

export default function EditDocumentPage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.document) {
          const d = data.document;
          setDoc({
            ...d,
            taxRate: parseFloat(d.taxRate) || 20,
            discount: parseFloat(d.discount) || 0,
            items: (d.items ?? []) as DocumentItem[],
          });
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!doc) {
    return <div className="text-center py-16 text-gray-400">Document not found</div>;
  }

  return <DocumentForm mode="edit" initial={doc} />;
}
