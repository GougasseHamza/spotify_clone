<template>
  <div class="container-fluid">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-light">Loading artist details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger m-3">
      {{ error }}
    </div>

    <!-- Artist Content -->
    <div v-else>
      <!-- Artist Header -->
      <div class="artist-header mb-5">
        <div class="row align-items-end">
          <div class="col-auto">
            <img 
              :src="artist.images[0]?.url" 
              :alt="artist.name"
              class="artist-image rounded"
            >
          </div>
          <div class="col">
            <h1 class="display-4 mb-2">{{ artist.name }}</h1>
            <p class="text-muted mb-0">
              {{ artist.followers.total.toLocaleString() }} followers
            </p>
          </div>
        </div>
      </div>

      <!-- Top Tracks -->
      <section class="mb-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>Popular</h2>
          <button 
            @click="playArtistTopTracks" 
            class="btn btn-success"
            :disabled="!isPlayerReady"
          >
            <i class="bi bi-play-fill me-2"></i>Play All
          </button>
        </div>

        <div class="tracks-list">
          <div 
            v-for="(track, index) in topTracks" 
            :key="track.id"
            class="track-item d-flex align-items-center p-3 rounded"
            :class="{ 'active': currentTrack?.id === track.id }"
          >
            <div class="track-number me-3" style="width: 30px">
              {{ index + 1 }}
            </div>
            <img 
              :src="track.album.images[0]?.url" 
              :alt="track.name"
              class="track-image me-3"
              width="40"
              height="40"
            >
            <div class="track-info flex-grow-1">
              <div class="track-name">{{ track.name }}</div>
              <div class="track-artists text-muted small">
                {{ track.artists.map(a => a.name).join(', ') }}
              </div>
            </div>
            <div class="track-duration text-muted me-3">
              {{ formatDuration(track.duration_ms) }}
            </div>
            <button 
              @click="playTrack(track)"
              class="btn btn-link text-white p-0"
              :disabled="!isPlayerReady"
            >
              <i class="bi bi-play-fill"></i>
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSpotify } from '~/composables/useSpotify'
import { useSpotifyPlayer } from '~/composables/useSpotifyPlayer'

interface SpotifyTrack {
  id: string
  name: string
  uri: string
  duration_ms: number
  album: {
    images: { url: string }[]
  }
  artists: Array<{ name: string }>
}

interface SpotifyArtist {
  id: string
  name: string
  images: { url: string }[]
  followers: {
    total: number
  }
}

const route = useRoute()
const { getArtist, getArtistTopTracks, play } = useSpotify()
const { playTrack: playerPlayTrack, isPlayerReady, currentTrack } = useSpotifyPlayer()

const isLoading = ref(true)
const error = ref('')
const artist = ref<SpotifyArtist | null>(null)
const topTracks = ref<SpotifyTrack[]>([])

// Load artist data
const loadArtistData = async () => {
  const artistId = route.params.id as string
  if (!artistId) {
    error.value = 'No artist ID provided'
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    const [artistData, tracksData] = await Promise.all([
      getArtist(artistId),
      getArtistTopTracks(artistId)
    ])
    
    artist.value = artistData
    topTracks.value = tracksData
  } catch (err) {
    console.error('Error loading artist data:', err)
    error.value = 'Failed to load artist data'
  } finally {
    isLoading.value = false
  }
}

// Play a single track
const playTrack = (track: SpotifyTrack) => {
  if (!isPlayerReady.value) {
    console.warn('Player not ready')
    return
  }
  
  playerPlayTrack(track.uri)
}

// Play all top tracks
const playArtistTopTracks = async () => {
  if (!isPlayerReady.value || !artist.value) {
    console.warn('Player not ready or no artist data')
    return
  }

  try {
    await play({ context_uri: `spotify:artist:${artist.value.id}` })
  } catch (error) {
    console.error('Error playing artist tracks:', error)
  }
}

// Format duration in mm:ss
const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

onMounted(loadArtistData)
</script>

<style scoped>
.artist-header {
  padding: 2rem 0;
}

.artist-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}

.track-item {
  transition: background-color 0.2s;
  cursor: pointer;
}

.track-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.track-item.active {
  background-color: rgba(255, 255, 255, 0.1);
}

.track-image {
  border-radius: 4px;
}

.track-name {
  font-weight: 500;
}

.track-artists {
  font-size: 0.875rem;
}
</style> 