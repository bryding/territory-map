<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useTerritoryStore } from '@/stores/territory'

const territoryStore = useTerritoryStore()
const baseUrl = ref(import.meta.env.BASE_URL)
const environment = ref(import.meta.env.MODE)

onMounted(() => {
  // Try to load data from localStorage on app startup
  territoryStore.loadFromStorage()
  console.log('App mounted, base URL:', import.meta.env.BASE_URL)
  console.log('Environment:', import.meta.env.MODE)
})
</script>

<template>
  <div id="app">
    <h1>Territory Pro - Debug</h1>
    <p>Base URL: {{ baseUrl }}</p>
    <p>Environment: {{ environment }}</p>
    <RouterView />
  </div>
</template>

<style>
/* Global styles for PWA */
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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
  input, select, textarea {
    font-size: 16px;
  }
}

/* Remove focus outline for mouse users but keep for keyboard users */
.js-focus-visible :focus:not(.focus-visible) {
  outline: none;
}
</style>
