"use client";

import ModernTemplate from "./ModernTemplate";
import { DocumentTemplateProps } from "./types";

export default function ClassicTemplate(
  props: DocumentTemplateProps
) {
  return <ModernTemplate {...props} />;
}
