import React from "react";
import ContentGenerator from "./contentlab/ContentGenerator";
import { PLATFORMS } from "./contentlab/platformConfigs";

export default function ContentGenerationPinterest() {
  return <ContentGenerator platform={PLATFORMS.pinterest} />;
}
