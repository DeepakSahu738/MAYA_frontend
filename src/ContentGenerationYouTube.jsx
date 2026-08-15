import React from "react";
import ContentGenerator from "./contentlab/ContentGenerator";
import { PLATFORMS } from "./contentlab/platformConfigs";

export default function ContentGenerationYouTube() {
  return <ContentGenerator platform={PLATFORMS.youtube} />;
}
