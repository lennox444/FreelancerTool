import React from "react";
import { Composition } from "remotion";
import { DynamicComp } from "./DynamicComp";
import { FreelancerVideo } from "./video/FreelancerVideo";

const defaultCode = `import { AbsoluteFill } from "remotion";
export const MyAnimation = () => <AbsoluteFill style={{ backgroundColor: "#000" }} />;`;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* FreelancerTool Explainer Video – 30s */}
      <Composition
        id="FreelancerVideo"
        component={FreelancerVideo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Original AI-prompt template */}
      <Composition
        id="DynamicComp"
        component={DynamicComp}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ code: defaultCode }}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.durationInFrames as number,
          fps: props.fps as number,
        })}
      />
    </>
  );
};
