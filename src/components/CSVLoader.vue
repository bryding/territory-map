<template>
  <div class="csv-loader">
    <div class="loader-card">
      <h2>Load Territory Data</h2>
      <p>Upload your CSV file to load customer and sales data.</p>

      <div
        class="upload-area"
        @click="triggerFileInput"
        @drop="handleDrop"
        @dragover.prevent
        @dragenter.prevent
      >
        <input
          ref="fileInput"
          type="file"
          accept=".csv"
          @change="handleFileSelect"
          style="display: none"
        />
        <div class="upload-icon">📄</div>
        <p>Click to select CSV file or drag and drop</p>
        <small>Supports .csv files</small>
      </div>

      <div class="divider">
        <span>or</span>
      </div>

      <button @click="loadSampleData" class="sample-button" :disabled="loading">
        Load Sample Data
      </button>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Processing CSV data...</p>
      </div>

      <div v-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="clearError" class="clear-button">Try Again</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTerritoryStore } from '@/stores/territory'
import { loadTestData } from '@/utils/testData'

const territoryStore = useTerritoryStore()
const fileInput = ref<HTMLInputElement>()
const loading = ref(false)
const error = ref<string | null>(null)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  if (file && file.type === 'text/csv') {
    processFile(file)
  } else {
    error.value = 'Please select a valid CSV file'
  }
}

async function processFile(file: File) {
  loading.value = true
  error.value = null

  try {
    const text = await file.text()
    await territoryStore.loadFromCSV(text)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load CSV file'
  } finally {
    loading.value = false
  }
}

async function loadSampleData() {
  loading.value = true
  error.value = null

  try {
    const success = await loadTestData()
    if (!success) {
      error.value = 'Failed to load sample data'
    }
  } catch {
    error.value = 'Failed to load sample data'
  } finally {
    loading.value = false
  }
}

function clearError() {
  error.value = null
}
</script>

<style scoped>
.csv-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
}

.loader-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.loader-card h2 {
  margin: 0 0 0.5rem 0;
  color: #111827;
  font-size: 1.5rem;
}

.loader-card p {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1rem;
}

.upload-area:hover {
  border-color: #2563eb;
  background: #f8fafc;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-area p {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-weight: 500;
}

.upload-area small {
  color: #6b7280;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 1rem;
  color: #dc2626;
}

.clear-button {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.clear-button:hover {
  background: #b91c1c;
}

.divider {
  position: relative;
  margin: 1.5rem 0;
  text-align: center;
}

.divider:before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
}

.divider span {
  background: white;
  color: #6b7280;
  padding: 0 1rem;
  font-size: 0.875rem;
  position: relative;
  z-index: 1;
}

.sample-button {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.sample-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.sample-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* iPhone optimizations */
@media (max-width: 480px) {
  .csv-loader {
    padding: 1rem;
    min-height: 100vh;
    align-items: flex-start;
    padding-top: 2rem;
  }

  .loader-card {
    padding: 2rem 1.5rem;
    max-width: none;
    width: 100%;
    box-shadow: none;
    border-radius: 16px;
  }

  .loader-card h2 {
    font-size: 1.75rem;
    margin-bottom: 1rem;
  }

  .loader-card p {
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 2rem;
  }

  .upload-area {
    padding: 2.5rem 1.5rem;
    margin-bottom: 1.5rem;
    border-radius: 12px;
  }

  .upload-icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
  }

  .upload-area p {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
    line-height: 1.4;
  }

  .upload-area small {
    font-size: 0.95rem;
  }

  .sample-button {
    padding: 1rem;
    font-size: 1rem;
    border-radius: 12px;
    min-height: 48px;
  }

  .divider {
    margin: 2rem 0;
  }

  .divider span {
    font-size: 1rem;
    padding: 0 1.5rem;
  }

  .loading {
    padding: 2rem 1rem;
  }

  .loading p {
    font-size: 1.1rem;
  }

  .error {
    padding: 1.5rem;
    border-radius: 12px;
    font-size: 1rem;
    line-height: 1.4;
  }

  .clear-button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    min-height: 44px;
    border-radius: 8px;
  }
}
</style>
