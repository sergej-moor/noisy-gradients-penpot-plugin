<script lang="ts">
  import { onMount } from 'svelte';
  import { theme, updateTheme } from './stores/theme';
  import { noiseSettings } from './stores/noiseSettings';
  import { NoiseGenerator } from './lib/noise';
  import NoiseControls from './components/NoiseControls.svelte';
 
  let canvas: HTMLCanvasElement;
  let isGenerating = $state(false);
  let noiseGenerator: NoiseGenerator;
  
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'theme') {
      updateTheme(event.data.content);
    } else if (event.data.type === 'image-success') {
      isGenerating = false;
    }
  }

  function handleApply() {
    if (!canvas) return;
    isGenerating = true;

    canvas.toBlob(async (blob) => {
      if (blob) {
        const buffer = await blob.arrayBuffer();
        parent.postMessage(
          {
            type: "generate-gradient",
            content: {
              buffer: new Uint8Array(buffer),
              size: $noiseSettings.size,
            },
          },
          "*"
        );
      } else {
        console.error("Could not convert canvas to blob");
        isGenerating = false;
      }
    });
  }

  function generateNoise() {
    if (!canvas) return;
    noiseGenerator.generateNoiseToCanvas(canvas, $noiseSettings);
  }

  function handleGenerateNew() {
    noiseGenerator.initPermutation();
    generateNoise();
  }

  onMount(() => {
    noiseGenerator = new NoiseGenerator();
    generateNoise();
  });

  $effect(() => {
    generateNoise();
  });
</script>

<svelte:window onmessage={handleMessage} />

<main data-theme={$theme}>
  <div class="canvas-container">
    <canvas bind:this={canvas}></canvas>
    <button 
      type="button" 
      data-appearance="secondary"
      class="new-noise-button"
      aria-label="Generate new noise pattern"
      onclick={handleGenerateNew}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>
    </button>
  </div>
  
  <NoiseControls 
    {isGenerating}
   
    onApply={handleApply}
  />
</main>



