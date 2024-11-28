<script lang="ts">
  import { noiseSettings, availableSizes } from '../stores/noiseSettings';

  export let onApply: () => void;
  export let isGenerating: boolean;
</script>

<div class="controls-section">

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
  <label class="slider-row">
    <span class="body-s">Grain:</span>
    <input type="range" 
           bind:value={$noiseSettings.grainIntensity} 
           min="0" max="0.1" step="0.01">
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
      onclick={onApply}
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