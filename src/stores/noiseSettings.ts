import { writable } from "svelte/store";
import type { NoiseSettings } from "../types";

export const availableSizes = [800, 1600, 3200];

const initialSettings: NoiseSettings = {
  scale: 0.003,
  redIntensity: 1,
  greenIntensity: 1,
  blueIntensity: 1,
  grainIntensity: 0.03,
  size: 800,
};

export const noiseSettings = writable(initialSettings);
