import React from "react";
import { Composition } from "remotion";
import { FreelancerVideo } from "./video/FreelancerVideo";

export const Root: React.FC = () => (
  <Composition
    id="FreelancerVideo"
    component={FreelancerVideo}
    durationInFrames={1570}
    fps={30}
    width={1080}
    height={1080}
  />
);
