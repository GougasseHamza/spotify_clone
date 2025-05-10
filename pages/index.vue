<template>
  <div class="container-fluid">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-light">Loading your music...</p>
    </div>

    <!-- Connection Status -->
    <div v-else-if="!isConnected" class="alert alert-info m-3">
      <div class="d-flex align-items-center">
        <i class="bi bi-spotify me-2"></i>
        <div>
          <strong>Connect to Spotify</strong>
          <p class="mb-0">Connect your Spotify account to see your personalized content.</p>
        </div>
      </div>
      <div class="mt-3">
        <button @click="connectSpotify" class="btn btn-success me-2" :disabled="isConnecting">
          <i class="bi bi-spotify me-2"></i>
          {{ isConnecting ? 'Connecting...' : 'Connect to Spotify' }}
        </button>
        <button @click="logout" class="btn btn-outline-light">
          <i class="bi bi-box-arrow-right me-2"></i>
          Logout
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Recently Played Section -->
      <section class="mb-5">
        <h2 class="mb-4">Recently Played</h2>
        <div class="row g-4">
          <div v-for="item in recentlyPlayed" :key="item.track.id" class="col-md-4 col-lg-3">
            <div class="card bg-dark text-white h-100">
              <img 
                :src="item.track.album.images[0].url" 
                class="card-img-top" 
                :alt="item.track.name"
              >
              <div class="card-body">
                <h5 class="card-title">{{ item.track.name }}</h5>
                <p class="card-text text-muted small">
                  {{ item.track.artists.map(a => a.name).join(', ') }}
                </p>
                <button 
                  @click="playTrack(item.track)" 
                  class="btn btn-success btn-sm"
                  :disabled="!isPlayerReady"
                >
                  <i class="bi bi-play-fill"></i> Play
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Your Playlists Section -->
      <section class="mb-5">
        <h2 class="mb-4">Your Playlists</h2>
        <div class="row g-4">
          <div v-for="playlist in userPlaylists" :key="playlist.id" class="col-md-4 col-lg-3">
            <div class="card bg-dark text-white h-100">
              <img 
                :src="playlist.images?.[0]?.url || '/img/placeholder-playlist.png'" 
                class="card-img-top" 
                :alt="playlist.name"
              >
              <div class="card-body">
                <h5 class="card-title">{{ playlist.name }}</h5>
                <p class="card-text text-muted small">
                  {{ playlist.tracks.total }} tracks • By {{ playlist.owner.display_name }}
                </p>
                <div class="d-flex gap-2">
                  <button 
                    @click="playPlaylist(playlist)" 
                    class="btn btn-success btn-sm"
                    :disabled="!isPlayerReady"
                  >
                    <i class="bi bi-play-fill"></i> Play
                  </button>
                  <NuxtLink 
                    :to="`/playlist/${playlist.id}`" 
                    class="btn btn-outline-light btn-sm"
                  >
                    <i class="bi bi-list"></i> View Tracks
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
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
  artists: Array<{ name: string }>
}

interface RecentlyPlayedItem {
  track: SpotifyTrack
  played_at: string
}

interface LikedSong {
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
  }
}

const { 
  getMyRecentlyPlayed, 
  getUserPlaylists, 
  getLikedSongs,
  login,
  logout,
  isConnected,
  isInitialized,
  play
} = useSpotify()

const { playTrack: playerPlayTrack, isPlayerReady } = useSpotifyPlayer()

const isLoading = ref(true)
const isConnecting = ref(false)
const recentlyPlayed = ref<RecentlyPlayedItem[]>([])
const userPlaylists = ref<SpotifyPlaylist[]>([])
const likedSongs = ref<LikedSong[]>([])

onMounted(async () => {
  try {
    // Wait for Spotify to initialize
    await waitFor(() => isInitialized.value)
    isLoading.value = false
    
    // Only try to load data if we have a token
    if (isConnected.value) {
      loadHomeData()
    }
  } catch (error) {
    console.error('Error in initialization:', error)
    isLoading.value = false
  }
})

// Function to wait for a condition
const waitFor = (condition: () => boolean, maxWait = 5000, interval = 100) => {
  return new Promise<void>((resolve, reject) => {
    if (condition()) {
      resolve()
      return
    }
    
    const startTime = Date.now()
    const intervalId = setInterval(() => {
      if (condition()) {
        clearInterval(intervalId)
        resolve()
        return
      }
      
      if (Date.now() - startTime > maxWait) {
        clearInterval(intervalId)
        resolve() // Resolve anyway after timeout
      }
    }, interval)
  })
}

// Load home page data
const loadHomeData = async () => {
  if (!isConnected.value) return

  try {
    isLoading.value = true

    // Load data in parallel
    const [recent, playlists] = await Promise.all([
      getMyRecentlyPlayed(),
      getUserPlaylists()
    ])

    recentlyPlayed.value = recent
    userPlaylists.value = playlists
  } catch (error) {
    console.error('Error loading home data:', error)
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

// Play a playlist
const playPlaylist = async (playlist: SpotifyPlaylist) => {
  if (!isPlayerReady.value) {
    console.warn('Player not ready')
    return
  }

  try {
    await play({ context_uri: `spotify:playlist:${playlist.id}` })
  } catch (error) {
    console.error('Error playing playlist:', error)
  }
}

// Connect to Spotify
const connectSpotify = () => {
  isConnecting.value = true
  login()
}
</script>

<style scoped>
.card {
  transition: transform 0.2s;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-4px);
}

.card-img-top {
  height: 200px;
  object-fit: cover;
}
</style> 