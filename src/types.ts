export type PluginMessageEvent =
  | { type: "theme"; content: string }
  | { type: "image-success" }
  | {
      type: "generate-gradient";
      content: { buffer: Uint8Array; size: number };
    };

export interface NoiseSettings {
  scale: number;
  redIntensity: number;
  greenIntensity: number;
  blueIntensity: number;
  size: number;
  grainIntensity: number;
}

export interface GradientData {
  base64: string;
  size: number;
}
