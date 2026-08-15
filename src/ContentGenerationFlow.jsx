import React from "react";
import ContentGenerator from "./contentlab/ContentGenerator";
import { PLATFORMS } from "./contentlab/platformConfigs";

export default function ContentGenerationFlow() {
  return <ContentGenerator platform={PLATFORMS.facebook} />;
}
