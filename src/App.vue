<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useTerritoryStore } from '@/stores/territory'

const territoryStore = useTerritoryStore()

onMounted(() => {
  // Try to load data from localStorage on app startup
  territoryStore.loadFromStorage()
})
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<style>
/* Global styles for PWA */
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #f8fafc;
}

#app {
  min-height: 100vh;
}

/* iOS specific styles */
@supports (-webkit-touch-callout: none) {
  body {
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  /* Prevent zoom on input focus */
  input,
  select,
  textarea {
    font-size: 16px;
  }
}

/* Remove focus outline for mouse users but keep for keyboard users */
.js-focus-visible :focus:not(.focus-visible) {
  outline: none;
}
</style>
