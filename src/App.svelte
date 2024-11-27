<script lang="ts">
  import type { PluginMessageEvent } from './types';

  let theme = $state("");

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
</script>

<svelte:window onmessage={handleMessage} />

<main data-theme={theme}>
  <div class="container">
    <h2>Penpot Plugin Template</h2>
    <p>Your plugin content goes here</p>
  </div>
</main>

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
</style>

