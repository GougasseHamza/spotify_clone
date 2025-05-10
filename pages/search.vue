<template>
  <div class="container-fluid">
    <!-- Search Header -->
    <div class="search-header p-4">
      <div class="d-flex align-items-center mb-4">
        <h1 class="mb-0 me-4">Search</h1>
        <div class="search-bar flex-grow-1">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control form-control-lg bg-dark text-white border-0"
            placeholder="Search for songs, artists, or albums..."
            @input="handleSearch"
          >
        </div>
      </div>
    </div>

    <!-- Search Results -->
    <div v-if="searchQuery" class="search-results p-4">
      <!-- Tracks Section -->
      <section v-if="tracks.length > 0" class="mb-5">
        <h2 class="mb-4">Songs</h2>
        <div class="row g-4">
          <div v-for="track in tracks" :key="track.id" class="col-md-6 col-lg-4">
            <div class="card bg-dark text-white h-100">
              <div class="position-relative">
                <img 
                  :src="track.album.images[0]?.url" 
                  class="card-img-top" 
                  :alt="track.name"
                >
                <button 
                  @click="playTrack(track)"
                  class="btn btn-success position-absolute bottom-0 end-0 m-3 rounded-circle"
                  :disabled="!isPlayerReady"
                >
                  <i class="bi bi-play-fill"></i>
                </button>
              </div>
              <div class="card-body">
                <h5 class="card-title text-truncate">{{ track.name }}</h5>
                <p class="card-text text-muted">
                  {{ track.artists.map(artist => artist.name).join(', ') }}
                </p>
                <div class="d-flex gap-2">
                  <NuxtLink 
                    v-for="artist in track.artists" 
                    :key="artist.id"
                    :to="`/artist/${artist.id}`"
                    class="btn btn-outline-light btn-sm"
                  >
                    <i class="bi bi-person"></i> {{ artist.name }}
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Artists Section -->
      <section v-if="artists.length > 0" class="mb-5">
        <h2 class="mb-4">Artists</h2>
        <div class="row g-4">
          <div v-for="artist in artists" :key="artist.id" class="col-md-4 col-lg-3">
            <NuxtLink :to="`/artist/${artist.id}`" class="text-decoration-none">
              <div class="card bg-dark text-white h-100">
                <img 
                  :src="artist.images[0]?.url" 
                  :alt="artist.name"
                  class="card-img-top"
                  style="aspect-ratio: 1; object-fit: cover;"
                >
                <div class="card-body">
                  <h5 class="card-title text-truncate">{{ artist.name }}</h5>
                  <p class="card-text text-muted">Artist</p>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- No Results -->
      <div v-if="!isLoading && tracks.length === 0 && artists.length === 0" class="text-center py-5">
        <p class="text-muted">No results found for "{{ searchQuery }}"</p>
      </div>
    </div>

    <!-- Browse Categories (when no search) -->
    <div v-else class="browse-categories p-4">
      <h2 class="mb-4">Browse Categories</h2>
      <div class="row g-4">
        <div v-for="category in categories" :key="category.id" class="col-md-4 col-lg-3">
          <div class="card bg-dark text-white h-100">
            <img 
              :src="category.icons[0]?.url" 
              class="card-img-top" 
              :alt="category.name"
            >
            <div class="card-body">
              <h5 class="card-title">{{ category.name }}</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSpotify } from '~/composables/useSpotify'
import { useSpotifyPlayer } from '~/composables/useSpotifyPlayer'

interface SpotifyTrack {
  id: string
  name: string
  uri: string
  album: {
    images: { url: string }[]
  }
  artists: Array<{ id: string; name: string }>
}

interface SpotifyArtist {
  id: string
  name: string
  images: { url: string }[]
}

interface SpotifyCategory {
  id: string
  name: string
  icons: { url: string }[]
}

const { searchTracks, searchArtists, getCategories } = useSpotify()
const { playTrack: playerPlayTrack, isPlayerReady } = useSpotifyPlayer()

const searchQuery = ref('')
const tracks = ref<SpotifyTrack[]>([])
const artists = ref<SpotifyArtist[]>([])
const categories = ref<SpotifyCategory[]>([])
const isLoading = ref(false)

// Load categories on mount
onMounted(async () => {
  try {
    const response = await getCategories()
    categories.value = response.categories.items
  } catch (error) {
    console.error('Error loading categories:', error)
  }
})

// Handle search input
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    tracks.value = []
    artists.value = []
    return
  }

  try {
    isLoading.value = true
    const [tracksData, artistsData] = await Promise.all([
      searchTracks(searchQuery.value),
      searchArtists(searchQuery.value)
    ])
    
    tracks.value = tracksData
    artists.value = artistsData
  } catch (error) {
    console.error('Error searching:', error)
  } finally {
    isLoading.value = false
  }
}

// Play a track
const playTrack = (track: SpotifyTrack) => {
  if (!isPlayerReady.value) {
    console.warn('Player not ready')
    return
  }
  
  playerPlayTrack(track.uri)
}
</script>

<style scoped>
.search-header {
  background: linear-gradient(to bottom, #1db954, #191414);
}

.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-4px);
}

.card-img-top {
  height: 200px;
  object-fit: cover;
}
</style> 