import type { PluginMessageEvent } from "./types";

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
      sendMessage({ type: "image-success" });
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

// Handle messages from UI
penpot.ui.onMessage((message: PluginMessageEvent) => {
  if (message.type === "generate-gradient") {
    addGradientToCanvas(message.content);
  }
});

// Listen for theme changes and send them to UI
penpot.on("themechange", (theme: string) => {
  sendMessage({ type: "theme", content: theme });
});

function sendMessage(message: PluginMessageEvent) {
  penpot.ui.sendMessage(message);
}
