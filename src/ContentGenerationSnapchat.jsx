import React from "react";
import ContentGenerator from "./contentlab/ContentGenerator";
import { PLATFORMS } from "./contentlab/platformConfigs";

export default function ContentGenerationSnapchat() {
  return <ContentGenerator platform={PLATFORMS.snapchat} />;
}
