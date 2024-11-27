<script lang="ts">

  import type { NoiseSettings } from './types';
  import { onMount } from 'svelte';
 
  let theme = $state(getTheme());
  let canvas: HTMLCanvasElement;
  function getTheme() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("theme") === "light" ? "light" : "dark";
}
  // Noise settings
  const availableSizes = [800, 1200, 2000, 2400, 4000];
  
  let settings: NoiseSettings = $state({
    scale: 0.007,
    redIntensity: 1,
    greenIntensity: 1,
    blueIntensity: 1,
    size: 800
  });

  let isGenerating = $state(false);

  function handleApply() {
    if (!canvas) return;
    isGenerating = true;

    canvas.toBlob(async (blob) => {
      if (blob) {
        const buffer = await blob.arrayBuffer();
        parent.postMessage(
          {
            type: "generate-gradient",
            data: {
              buffer: new Uint8Array(buffer),
              size: settings.size,
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
    
    const ctx = canvas.getContext('2d')!;
    const fixedSize = 200;
    canvas.width = fixedSize;
    canvas.height = fixedSize;
    
    const imageData = ctx.createImageData(fixedSize, fixedSize);
    const data = imageData.data;
    
    for (let y = 0; y < fixedSize; y++) {
      for (let x = 0; x < fixedSize; x++) {
        const i = (y * fixedSize + x) * 4;
        
        const r = noise(x * settings.scale, y * settings.scale);
        const g = noise((x + fixedSize) * settings.scale, y * settings.scale);
        const b = noise(x * settings.scale, (y + fixedSize) * settings.scale);
        
        data[i] = Math.floor((r + 1) * 128 * settings.redIntensity);
        data[i + 1] = Math.floor((g + 1) * 128 * settings.greenIntensity);
        data[i + 2] = Math.floor((b + 1) * 128 * settings.blueIntensity);
        data[i + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  // Perlin noise implementation
  function noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = fade(x);
    const v = fade(y);
    
    const A = p[X] + Y;
    const B = p[X + 1] + Y;
    
    return lerp(v, 
      lerp(u, 
        grad(p[A], x, y), 
        grad(p[B], x - 1, y)
      ),
      lerp(u, 
        grad(p[A + 1], x, y - 1),
        grad(p[B + 1], x - 1, y - 1)
      )
    );
  }

  function fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  function grad(hash: number, x: number, y: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  // Permutation table
  let p = new Array(512);
  let permutation: number[];

  function initPermutation() {
    permutation = [...Array(256)].map(() => Math.floor(Math.random() * 256));
    for (let i = 0; i < 256; i++) p[256 + i] = p[i] = permutation[i];
  }

  onMount(() => {
    initPermutation();
    generateNoise();

    window.addEventListener('message', (event) => {
      if (event.data.type === 'image-success') {
        isGenerating = false;
      }
    });
  });

  $effect(() => {
    generateNoise();
  });
</script>

<main data-theme={theme}>
  <div class="canvas-container">
    <canvas 
      bind:this={canvas}>
    </canvas>
    <button 
      type="button" 
      data-appearance="secondary"
      class="new-noise-button"
      aria-label="Generate new noise pattern"
      onclick={() => {
        initPermutation();
        generateNoise();
      }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>
    </button>
  </div>
  
  <div class="controls-section">
    <label class="slider-row">
      <span class="body-s">Scale: <!-- {settings.scale.toFixed(3)} --></span>
      <input type="range" 
             bind:value={settings.scale} 
             min="0.001" max="0.015" step="0.001">
    </label>
    
    <label class="slider-row">
      <span class="body-s"><span class="color-dot red"></span>Red: <!-- {settings.redIntensity.toFixed(2)} --></span>
      <input type="range" 
             bind:value={settings.redIntensity} 
             min="0" max="3" step="0.1">
    </label>
    
    <label class="slider-row">
      <span class="body-s"><span class="color-dot green"></span>Green: <!-- {settings.greenIntensity.toFixed(2)} --></span>
      <input type="range" 
             bind:value={settings.greenIntensity} 
             min="0" max="3" step="0.1">
    </label>
    
    <label class="slider-row">
      <span class="body-s"><span class="color-dot blue"></span>Blue: <!-- {settings.blueIntensity.toFixed(2)} --></span>
      <input type="range" 
             bind:value={settings.blueIntensity} 
             min="0" max="3" step="0.1">
    </label>

    <div class="bottom-section">
      <label class="form-group">
        <span class="body-s">Size (px)</span>
        <select 
          bind:value={settings.size}
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
          <span class="body-s" style="opacity: 0.8">{settings.size}×{settings.size}px, PNG</span>
        {/if}
      </button>
    </div>
  </div>
</main>



