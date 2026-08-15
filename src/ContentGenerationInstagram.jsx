import React from "react";
import ContentGenerator from "./contentlab/ContentGenerator";
import { PLATFORMS } from "./contentlab/platformConfigs";

export default function ContentGenerationInstagram() {
  return <ContentGenerator platform={PLATFORMS.instagram} />;
}
