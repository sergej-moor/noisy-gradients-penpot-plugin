<script lang="ts">
  import type { PluginMessageEvent } from './types';
  import { onMount } from 'svelte';

  let theme = $state("");
  let canvas: HTMLCanvasElement;
  let scale = $state(0.007);
  let redIntensity = $state(1);
  let greenIntensity = $state(1);
  let blueIntensity = $state(1);

  // Initial theme from URL
  const url = new URL(window.location.href);
  const initialTheme = url.searchParams.get('theme');
  if (initialTheme) theme = initialTheme;

  // Handle incoming messages
  const handleMessage = (event: MessageEvent) => {
    const message = event.data as PluginMessageEvent;
    if (message.type === 'theme') {
      theme = message.content;
    }
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

  function generateNoise() {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d')!;
    const size = 200;
    
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        
        // Generate different noise values for each color channel
        const r = noise(x * scale, y * scale);
        const g = noise((x + size) * scale, y * scale);
        const b = noise(x * scale, (y + size) * scale);
        
        // Convert noise values to color (0-255) with intensity adjustment
        data[i] = Math.floor((r + 1) * 128 * redIntensity);     // Red
        data[i + 1] = Math.floor((g + 1) * 128 * greenIntensity); // Green
        data[i + 2] = Math.floor((b + 1) * 128 * blueIntensity); // Blue
        data[i + 3] = 255;                       // Alpha
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  function regenerateNoise() {
    initPermutation();
    generateNoise();
  }

  onMount(() => {
    canvas.width = 200;
    canvas.height = 200;
    initPermutation();
    generateNoise();
  });

  $effect(() => {
    generateNoise();
  });
</script>

<svelte:window onmessage={handleMessage} />

<main data-theme={theme}>
  <div class="container">
    <h2>Noise Gradient</h2>
    <canvas bind:this={canvas}></canvas>
    
    <div class="controls">
      <label>
        Scale: {scale.toFixed(3)}
        <input type="range" bind:value={scale} min="0.001" max="0.1" step="0.001">
      </label>
      
      <label>
        Red: {redIntensity.toFixed(2)}
        <input type="range" bind:value={redIntensity} min="0" max="2" step="0.1">
      </label>
      
      <label>
        Green: {greenIntensity.toFixed(2)}
        <input type="range" bind:value={greenIntensity} min="0" max="2" step="0.1">
      </label>
      
      <label>
        Blue: {blueIntensity.toFixed(2)}
        <input type="range" bind:value={blueIntensity} min="0" max="2" step="0.1">
      </label>
      
      <button onclick={regenerateNoise}>Regenerate</button>
    </div>
  </div>
</main>

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem;
    align-items: center;
    max-width: 200px;
    margin: 0 auto;
  }

  h2 {
    font-size: 1.2rem;
    margin: 0;
  }

  canvas {
    width: 200px;
    height: 200px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
  }

  input[type="range"] {
    width: 100%;
  }

  button {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background-color: #0284c7;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
  }

  button:hover {
    background-color: #0369a1;
  }
</style>

