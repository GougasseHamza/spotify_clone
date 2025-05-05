<template>
  <div class="search-container">
    <div class="search-input-wrapper">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search for tracks..."
        class="search-input"
        @input="handleSearch"
      >
      <div class="search-icon">
        <i class="bi bi-search"></i>
      </div>
    </div>
    
    <!-- Search Results -->
    <div v-if="showResults && searchResults.length > 0" class="search-results">
      <div
        v-for="track in searchResults"
        :key="track.id"
        class="search-result-item"
        @click="selectTrack(track)"
      >
        <img
          :src="track.album.images[2]?.url || '/default-album.png'"
          :alt="track.album.name"
          class="track-thumbnail"
        >
        <div class="track-info">
          <div class="track-name">{{ track.name }}</div>
          <div class="track-artist">{{ track.artists[0].name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSpotify } from '~/composables/useSpotify'
import debounce from 'lodash/debounce'

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const showResults = ref(false)
const { searchTracks } = useSpotify()

// Create a debounced search function
const debouncedSearch = debounce(async (query: string) => {
  if (!query.trim()) {
    searchResults.value = []
    return
  }
  
  try {
    const results = await searchTracks(query)
    searchResults.value = results || []
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = []
  }
}, 300)

// Handle search input
const handleSearch = () => {
  showResults.value = true
  debouncedSearch(searchQuery.value)
}

// Handle track selection
const selectTrack = (track: any) => {
  console.log('Selected track:', track)
  // Emit the selected track
  emit('select', track)
  // Clear the search
  searchQuery.value = ''
  searchResults.value = []
  showResults.value = false
}

// Close results when clicking outside
const closeResults = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.search-container')) {
    showResults.value = false
  }
}

// Setup click outside listener
onMounted(() => {
  document.addEventListener('click', closeResults)
})

onUnmounted(() => {
  document.removeEventListener('click', closeResults)
})

// Define emits
const emit = defineEmits<{
  (event: 'select', track: any): void
}>()
</script>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: none;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: #282828;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-result-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.track-thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  margin-right: 12px;
}

.track-info {
  flex: 1;
}

.track-name {
  color: white;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.track-artist {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

/* Scrollbar styling */
.search-results::-webkit-scrollbar {
  width: 8px;
}

.search-results::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.search-results::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}
</style> 