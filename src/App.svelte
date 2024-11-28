<script lang="ts">
  import { onMount } from 'svelte';
  import { theme, updateTheme } from './stores/theme';
  import { noiseSettings, availableSizes } from './stores/noiseSettings';
  import { NoiseGenerator } from './lib/noise';
 
  let canvas: HTMLCanvasElement;
  let isGenerating = $state(false);
  let noiseGenerator: NoiseGenerator;
  
  // Watch for theme changes
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
      onclick={() => {
        noiseGenerator.initPermutation();
        generateNoise();
      }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>
    </button>
  </div>
  
  <div class="controls-section">
    <label class="slider-row">
      <span class="body-s">Grain:</span>
      <input type="range" 
             bind:value={$noiseSettings.grainIntensity} 
             min="0" max="0.15" step="0.01">
    </label>
    <label class="slider-row">
      <span class="body-s">Scale:</span>
      <input type="range" 
             bind:value={$noiseSettings.scale} 
             min="0.001" max="0.006" step="0.0002">
    </label>
    
    <label class="slider-row">
      <span class="body-s"><span class="color-dot red"></span>Red:</span>
      <input type="range" 
             bind:value={$noiseSettings.redIntensity} 
             min="0" max="3" step="0.1">
    </label>
    
    <label class="slider-row">
      <span class="body-s"><span class="color-dot green"></span>Green:</span>
      <input type="range" 
             bind:value={$noiseSettings.greenIntensity} 
             min="0" max="3" step="0.1">
    </label>
    
    <label class="slider-row">
      <span class="body-s"><span class="color-dot blue"></span>Blue:</span>
      <input type="range" 
             bind:value={$noiseSettings.blueIntensity} 
             min="0" max="3" step="0.1">
    </label>

 

    <div class="bottom-section">
      <label class="form-group">
        <span class="body-s">Size (px)</span>
        <select 
          bind:value={$noiseSettings.size}
          class="select">
          {#each availableSizes as size}
            <option value={size}>{size}</option>
          {/each}
        </select>
      </label>
      <button 
        type="button"
        data-appearance="primary"
        class="insert-button"
        onclick={handleApply}
        disabled={isGenerating}>
        {#if isGenerating}
          Generating...
        {:else}
          <span class="body-m">Insert</span>
          <span class="body-s" style="opacity: 0.8">{$noiseSettings.size}×{$noiseSettings.size}px, PNG</span>
        {/if}
      </button>
    </div>
  </div>
</main>



