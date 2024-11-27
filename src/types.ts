/**
 * This file contains the typescript interfaces for the plugin events.
 */

export interface ThemePluginEvent {
  type: string;
  content: string;
}

export interface PluginMessageEvent {
  type: "theme" | "generate-gradient";
  data: any;
}

export interface NoiseSettings {
  scale: number;
  redIntensity: number;
  greenIntensity: number;
  blueIntensity: number;
  size: number;
}

export interface GradientData {
  base64: string;
  size: number;
}
