"use client";

import ModernTemplate from "./ModernTemplate";
import { DocumentTemplateProps } from "./types";

export default function MinimalTemplate(
  props: DocumentTemplateProps
) {
  return <ModernTemplate {...props} />;
}
