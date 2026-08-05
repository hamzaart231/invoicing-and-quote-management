"use client";

import { CompanyData, DocumentData } from "@/lib/types";

import {
  ModernTemplate,
  ClassicTemplate,
  MinimalTemplate,
} from "@/templates";

interface DocumentPrintProps {
  doc: DocumentData;
  company: CompanyData;
}

export default function DocumentPrint({
  doc,
  company,
}: DocumentPrintProps) {
  switch (doc.template) {
    case "classic":
      return (
        <ClassicTemplate
          doc={doc}
          company={company}
        />
      );

    case "minimal":
      return (
        <MinimalTemplate
          doc={doc}
          company={company}
        />
      );

    case "modern":
    default:
      return (
        <ModernTemplate
          doc={doc}
          company={company}
        />
      );
  }
}
