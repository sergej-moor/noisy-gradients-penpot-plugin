/**
 * This file contains the typescript interfaces for the plugin events.
 */

export interface ThemePluginEvent {
  type: string;
  content: string;
}

export interface PluginMessageEvent {
  type: "theme";
  content: string;
}

export interface PixelizeOptions {
  pixelSize: number;
  opacity: number;
}
