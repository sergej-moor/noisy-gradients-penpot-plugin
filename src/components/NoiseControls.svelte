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
    <div class="form-group">
      
      <div class="radio-group" >
        {#each availableSizes as size}
          <div class="radio-container">
            <input 
              type="radio" 
              class="radio-input" 
              id="size-{size}" 
              name="size" 
              value={size}
              bind:group={$noiseSettings.size}>
            <label class="radio-label body-s"for="size-{size}">{size}</label>
          </div>
        {/each}
      </div>
    </div>
    <button 
      type="button"
      data-appearance="primary"
      class="insert-button"
      style="text-transform: none;"
      onclick={onApply}
      disabled={isGenerating}>
      {#if isGenerating}
        Generating...
      {:else}
        <span class="body-m" >Insert</span>
       <span class="body-s" style="opacity: 0.8">{$noiseSettings.size}×{$noiseSettings.size}px, PNG</span> 
      {/if}
    </button>
  </div>
</div> 
<style>
    
/* Controls layout */
.controls-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}


/* Slider layout */
.slider-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  width: 100%;
  padding: var(--spacing-4) 0;
}

.slider-row .body-s {
  min-width: 80px;
}

.slider-row input[type="range"] {
  flex: 1;
}

/* Bottom section */
.bottom-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  margin-top: var(--spacing-8);
  padding-top: var(--spacing-16);
  border-top: 1px solid var(--db-quaternary);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  flex: 1;
}

.select {
  width: 100%;
}

/* Insert button */
.insert-button {
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: var(--spacing-12) var(--spacing-8);
}

/* Color indicators */
.color-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}

.color-dot.red {
  background-color: #ff0000;
}
.color-dot.green {
  background-color: #00ff00;
}
.color-dot.blue {
  background-color: #0000ff;
}

.radio-group {
  display: flex;
  justify-content: space-between;
  align-items: start;
}

</style>