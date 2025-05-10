<template>
  <div class="container-fluid playlist-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-light">Loading playlist...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger m-3">
      <div class="d-flex align-items-center">
        <i class="bi bi-exclamation-triangle me-2"></i>
        <div>
          <strong>Error</strong>
          <p class="mb-0">{{ error }}</p>
        </div>
      </div>
      <button @click="loadPlaylist" class="btn btn-danger mt-3">
        <i class="bi bi-arrow-clockwise me-2"></i>
        Retry
      </button>
    </div>

    <!-- Playlist Content -->
    <div v-else-if="playlist" class="playlist-content">
      <!-- Playlist Header -->
      <div class="playlist-header p-4" :style="headerStyle">
        <div class="d-flex align-items-end">
          <img 
            :src="playlist.images?.[0]?.url || '/img/placeholder-playlist.png'" 
            class="rounded shadow me-4" 
            width="232" 
            height="232" 
            :alt="playlist.name"
          >
          <div class="playlist-info">
            <h1 class="mb-2">{{ playlist.name }}</h1>
            <p class="text-muted mb-3">
              {{ playlist.description || 'No description' }}
            </p>
            <div class="d-flex align-items-center mb-4">
              <img 
                :src="playlist.owner.images?.[0]?.url || '/img/placeholder-user.png'" 
                class="rounded-circle me-2" 
                width="24" 
                height="24" 
                :alt="playlist.owner.display_name"
              >
              <span class="text-muted">{{ playlist.owner.display_name }}</span>
              <span class="text-muted mx-2">•</span>
              <span class="text-muted">{{ playlist.tracks.total }} songs</span>
            </div>
            <div class="d-flex gap-2">
              <button 
                @click="playPlaylist" 
                class="btn btn-success rounded-pill px-4"
                :disabled="!isPlayerReady"
              >
                <i class="bi bi-play-fill me-2"></i>
                Play
              </button>
              <button class="btn btn-outline-light rounded-pill px-4">
                <i class="bi bi-shuffle me-2"></i>
                Shuffle
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tracks List -->
      <div class="tracks-list p-4">
        <div class="list-group">
          <div 
            v-for="(item, index) in tracks" 
            :key="item.track?.id || index"
            class="list-group-item bg-dark text-white border-secondary d-flex align-items-center"
          >
            <div class="track-number me-3">{{ index + 1 }}</div>
            <img 
              :src="item.track?.album?.images?.[0]?.url || '/img/placeholder-album.png'" 
              class="rounded me-3" 
              width="40" 
              height="40" 
              :alt="item.track?.name"
            >
            <div class="flex-grow-1">
              <div class="track-name">{{ item.track?.name }}</div>
              <div class="artist-name text-muted small">
                {{ item.track?.artists?.map(artist => artist.name).join(', ') }}
              </div>
            </div>
            <div class="text-muted small me-3">
              {{ formatDate(item.added_at) }}
            </div>
            <button 
              @click="playTrack(item.track)" 
              class="btn btn-link text-white"
              :disabled="!isPlayerReady"
            >
              <i class="bi bi-play-fill"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSpotify } from '~/composables/useSpotify'
import { useSpotifyPlayer } from '~/composables/useSpotifyPlayer'

interface SpotifyTrack {
  id: string
  name: string
  uri: string
  album: {
    images: { url: string }[]
  }
  artists: Array<{ name: string }>
}

interface PlaylistTrack {
  track: SpotifyTrack
  added_at: string
}

interface SpotifyPlaylist {
  id: string
  name: string
  description: string | null
  images: { url: string }[]
  tracks: {
    total: number
  }
  owner: {
    display_name: string
    images?: { url: string }[]
  }
}

const route = useRoute()
const { getPlaylistTracks, play } = useSpotify()
const { playTrack: playerPlayTrack, isPlayerReady } = useSpotifyPlayer()

const isLoading = ref(true)
const error = ref<string | null>(null)
const playlist = ref<SpotifyPlaylist | null>(null)
const tracks = ref<PlaylistTrack[]>([])

// Compute header background style
const headerStyle = computed(() => {
  if (!playlist.value?.images?.[0]?.url) return {}
  
  return {
    background: `linear-gradient(to bottom, rgba(0,0,0,0.7), #121212), url(${playlist.value.images[0].url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
})

// Load playlist data
const loadPlaylist = async () => {
  const playlistId = route.params.id as string
  if (!playlistId) {
    error.value = 'No playlist ID provided'
    return
  }

  try {
    isLoading.value = true
    error.value = null
    
    // Load playlist tracks
    const playlistTracks = await getPlaylistTracks(playlistId)
    tracks.value = playlistTracks
    
    // Set playlist info from first track if available
    if (playlistTracks.length > 0 && playlistTracks[0].track) {
      playlist.value = {
        id: playlistId,
        name: 'Playlist', // This will be updated when we implement getPlaylist
        description: null,
        images: playlistTracks[0].track.album.images,
        tracks: {
          total: playlistTracks.length
        },
        owner: {
          display_name: 'User'
        }
      }
    }
  } catch (err) {
    console.error('Error loading playlist:', err)
    error.value = 'Failed to load playlist'
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

// Play the entire playlist
const playPlaylist = async () => {
  if (!isPlayerReady.value || !playlist.value) {
    console.warn('Player not ready or no playlist')
    return
  }

  try {
    await play({ context_uri: `spotify:playlist:${playlist.value.id}` })
  } catch (error) {
    console.error('Error playing playlist:', error)
  }
}

// Format date to relative time
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  
  const diffInMinutes = Math.floor(diffInMs / 60000)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`
  } else {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`
  }
}

onMounted(() => {
  loadPlaylist()
})
</script>

<style scoped>
.playlist-page {
  min-height: 100vh;
  background: #121212;
}

.playlist-header {
  background: linear-gradient(to bottom, rgba(0,0,0,0.7), #121212);
  padding: 2rem;
}

.playlist-info {
  color: white;
}

.tracks-list {
  background: rgba(0, 0, 0, 0.3);
}

.list-group-item {
  transition: background-color 0.2s;
}

.list-group-item:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.track-number {
  width: 30px;
  text-align: center;
  color: #b3b3b3;
}

.track-name {
  font-weight: 500;
}

.artist-name {
  color: #b3b3b3;
}
</style> 