import type { PluginMessageEvent } from "./types";

// Open UI with default size for our controls
penpot.ui.open("Plugin Template", `?theme=${penpot.theme}`, {
  width: 300,
  height: 400,
});

// Listen for theme changes
penpot.on("themechange", (theme) => {
  sendMessage({ type: "theme", content: theme });
});

function sendMessage(message: PluginMessageEvent) {
  penpot.ui.sendMessage(message);
}
