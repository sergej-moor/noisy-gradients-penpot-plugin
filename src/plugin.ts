import type { PluginMessageEvent } from "./types";
import type { Shape } from "@penpot/plugin-types";

// Initialize plugin with slightly less height since canvas is now more compact
penpot.ui.open("Noise Gradient", `?theme=${penpot.theme}`, {
  width: 264,
  height: 500,
});

async function addGradientToCanvas(data: { buffer: Uint8Array; size: number }) {
  const blockId = penpot.history.undoBlockBegin();
  try {
    const image = await penpot.uploadMediaData(
      "gradient",
      data.buffer,
      "image/png"
    );

    if (image) {
      penpot.ui.sendMessage({ type: "image-success" });
    }

    const rect = penpot.createRectangle();
    rect.x = penpot.viewport.center.x;
    rect.y = penpot.viewport.center.y;
    rect.resize(data.size, data.size);
    rect.fills = [{ fillOpacity: 1, fillImage: image }];
  } finally {
    penpot.history.undoBlockFinish(blockId);
  }
}

// Listen for theme changes
penpot.on("themechange", (theme) => {
  penpot.ui.sendMessage({
    source: "penpot",
    type: "themechange",
    theme,
  });
});

// Handle messages from UI
penpot.ui.onMessage<{
  type: string;
  data: any;
}>((message) => {
  if (message.type === "generate-gradient") {
    addGradientToCanvas(message.data);
  }
});
