import React from "react";
import ContentGenerator from "./contentlab/ContentGenerator";
import { PLATFORMS } from "./contentlab/platformConfigs";

export default function ContentGenerationTikTok() {
  return <ContentGenerator platform={PLATFORMS.tiktok} />;
}
