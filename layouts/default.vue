<template>
  <div class="spotify-app">
    <!-- Left Sidebar -->
    <nav class="sidebar bg-black">
      <div class="sidebar-header p-3">
        <h3 class="spotify-logo mb-0">Spotify</h3>
      </div>

      <!-- Main Navigation -->
      <div class="nav-section mb-4">
        <ul class="nav flex-column">
          <li class="nav-item">
            <NuxtLink to="/" class="nav-link text-white d-flex align-items-center">
              <i class="bi bi-house-door-fill me-3"></i> Home
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink to="/search" class="nav-link text-white d-flex align-items-center">
              <i class="bi bi-search me-3"></i> Search
            </NuxtLink>
          </li>
          <li class="nav-item" v-if="isAuthenticated">
            <NuxtLink to="/my-music" class="nav-link text-white d-flex align-items-center">
              <i class="bi bi-music-note-list me-3"></i> My Music
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink to="/player" class="nav-link text-white d-flex align-items-center">
              <i class="bi bi-speaker-fill me-3"></i>
              <span>Player</span>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Spotify Connection Status -->
      <div v-if="isAuthenticated && !isSpotifyConnected" class="spotify-status-panel p-3 mb-3 rounded-3 bg-dark-subtle">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h6 class="mb-0">Connect to Spotify</h6>
        </div>
        <p class="text-muted small mb-2">Connect to see your playlists and listen to music</p>
        <button @click="connectSpotify" class="btn btn-success btn-sm rounded-pill w-100">
          <i class="bi bi-spotify me-2"></i> Connect
        </button>
      </div>

      <!-- Library Section -->
      <div class="library-section">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="text-muted mb-0">YOUR LIBRARY</h6>
          <button 
            @click="createPlaylist" 
            class="btn btn-link text-white p-0"
            :disabled="!isConnected"
          >
            <i class="bi bi-plus-lg"></i>
          </button>
        </div>
        
        <!-- Playlists -->
        <div class="playlists">
          <div v-if="isLoading" class="text-center py-3">
            <div class="spinner-border spinner-border-sm text-light" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-else-if="!isConnected" class="text-center py-3">
            <p class="text-muted small mb-2">Connect to Spotify to see your playlists</p>
            <button @click="connectSpotify" class="btn btn-sm btn-success">
              <i class="bi bi-spotify me-2"></i>Connect
            </button>
          </div>
          <div v-else>
            <div v-for="playlist in userPlaylists" :key="playlist.id" class="playlist-item">
              <NuxtLink 
                :to="`/playlist/${playlist.id}`" 
                class="d-flex align-items-center text-white text-decoration-none py-2 px-3 rounded"
                :class="{ 'active': route.path === `/playlist/${playlist.id}` }"
              >
                <img 
                  :src="playlist.images?.[0]?.url || '/img/placeholder-playlist.png'" 
                  :alt="playlist.name"
                  class="playlist-cover me-3"
                >
                <div class="flex-grow-1">
                  <div class="text-truncate">{{ playlist.name }}</div>
                  <div class="text-muted small text-truncate">
                    {{ playlist.tracks.total }} tracks
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content Area -->
    <main class="main-content">
      <!-- Top Bar -->
      <header class="top-bar bg-black bg-opacity-75 p-3">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex gap-3">
            <button class="btn btn-dark rounded-circle"><i class="bi bi-chevron-left"></i></button>
            <button class="btn btn-dark rounded-circle"><i class="bi bi-chevron-right"></i></button>
          </div>
          
          <div class="search-container flex-grow-1 mx-4" style="max-width: 600px;">
            <SearchBar v-if="isAuthenticated" @select="handleTrackSelect" />
          </div>

          <div class="d-flex align-items-center gap-3">
            <button class="btn btn-dark rounded-pill">
              <i class="bi bi-download me-2"></i> Install App
            </button>
            <button class="btn btn-dark rounded-circle">
              <i class="bi bi-bell"></i>
            </button>
            <div v-if="!user" class="d-flex gap-2">
              <NuxtLink to="/login" class="btn btn-light rounded-pill px-4">Log in</NuxtLink>
              <NuxtLink to="/login?register=true" class="btn btn-outline-light rounded-pill px-4">Sign up</NuxtLink>
            </div>
            <div v-else class="d-flex align-items-center">
              <div class="dropdown me-2">
                <button class="btn btn-dark rounded-circle dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                  <img v-if="user?.photoURL" :src="user.photoURL" :alt="user?.displayName || 'User'" 
                      class="rounded-circle" width="32" height="32">
                  <i v-else class="bi bi-person"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                  <li class="dropdown-item-text text-white">{{ user?.displayName || user?.email?.split('@')[0] }}</li>
                  <li><hr class="dropdown-divider"></li>
                  <li><NuxtLink to="/profile" class="dropdown-item">Profile</NuxtLink></li>
                  <li><NuxtLink to="/debug-auth" class="dropdown-item">Debug Auth</NuxtLink></li>
                  <li><NuxtLink to="/logout" class="dropdown-item">
                    <span class="text-danger"><i class="bi bi-box-arrow-right me-2"></i>Log out</span>
                  </NuxtLink></li>
                </ul>
              </div>
              
              <!-- Direct Logout Button -->
              <NuxtLink to="/logout" class="btn btn-outline-danger rounded-pill">
                <i class="bi bi-box-arrow-right me-1"></i> Log out
              </NuxtLink>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="content-area">
        <div v-if="user && $route.path === '/'" class="welcome-banner p-4 mb-4 rounded-3 bg-success bg-opacity-25">
          <h3>Welcome back, {{ user.displayName || user.email?.split('@')[0] }}!</h3>
          <p>Continue listening to your favorite music or discover something new.</p>
        </div>
        <slot />
      </div>

      <!-- Now Playing Bar -->
      <footer class="now-playing-bar bg-black p-3">
        <div class="d-flex justify-content-between align-items-center">
          <!-- Track Info -->
          <div class="d-flex align-items-center" style="width: 30%">
            <div v-if="currentTrack">
              <img :src="currentTrack.album?.images?.[0]?.url || '/img/placeholder-album.png'" 
                   class="rounded me-3" width="56" height="56" :alt="currentTrack.name">
              <div>
                <div class="track-name">{{ currentTrack.name }}</div>
                <div class="artist-name text-muted small">{{ currentTrack.artists?.[0]?.name }}</div>
              </div>
              <div class="d-flex align-items-center">
                <button class="btn btn-link text-white ms-3">
                  <i class="bi bi-heart"></i>
                </button>
                <AddToPlaylistMenu 
                  :track-uri="currentTrack.uri" 
                  :track-name="currentTrack.name"
                  class="ms-2"
                />
              </div>
            </div>
            <div v-else class="d-flex align-items-center">
              <div class="text-muted small">Not playing</div>
              <NuxtLink to="/player" class="btn btn-link text-white ms-3" title="Open player">
                <i class="bi bi-music-player"></i>
              </NuxtLink>
            </div>
          </div>

          <!-- Player Controls -->
          <div class="player-controls d-flex align-items-center gap-3">
            <button 
              @click="previousTrack" 
              class="btn btn-link text-white p-0"
              :disabled="!isSpotifyConnected"
            >
              <i class="bi bi-skip-start-fill fs-4"></i>
            </button>
            
            <button 
              @click="togglePlay" 
              class="btn btn-link text-white p-0"
              :disabled="!isSpotifyConnected"
            >
              <i :class="isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill'" class="fs-4"></i>
            </button>
            
            <button 
              @click="nextTrack" 
              class="btn btn-link text-white p-0"
              :disabled="!isSpotifyConnected"
            >
              <i class="bi bi-skip-end-fill fs-4"></i>
            </button>
            
            <div class="volume-control d-flex align-items-center gap-2">
              <i class="bi bi-volume-down text-white"></i>
              <input 
                type="range" 
                class="form-range" 
                min="0" 
                max="100" 
                :value="volume"
                @change="updateVolume"
              >
              <i class="bi bi-volume-up text-white"></i>
            </div>
          </div>

          <!-- Volume Controls -->
          <div class="volume-controls d-flex align-items-center justify-content-end gap-3" style="width: 30%">
            <button class="btn btn-link text-white"><i class="bi bi-mic"></i></button>
            <button class="btn btn-link text-white"><i class="bi bi-list"></i></button>
            <button class="btn btn-link text-white"><i class="bi bi-volume-up"></i></button>
            <div class="progress" style="width: 100px; height: 4px">
              <input 
                type="range" 
                class="form-range" 
                min="0" 
                max="100" 
                :value="volume" 
                @change="updateVolume"
              >
            </div>
            <NuxtLink to="/player" class="btn btn-link text-white">
              <i class="bi bi-arrows-angle-expand"></i>
            </NuxtLink>
          </div>
        </div>
      </footer>
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useHead } from '#app'
import { useAuth } from '~/composables/useAuth'
import { useSpotify } from '~/composables/useSpotify'
import { useSpotifyPlayer } from '~/composables/useSpotifyPlayer'
import AddToPlaylistMenu from '~/components/AddToPlaylistMenu.vue'

// Add Bootstrap JS to head instead of in template
useHead({
  script: [
    {
      src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
      integrity: 'sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL',
      crossorigin: 'anonymous'
    }
  ]
})

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

const router = useRouter()
const route = useRoute()
const { user, isAuthenticated, logout } = useAuth()
const { 
  getUserPlaylists, 
  createPlaylist: spotifyCreatePlaylist,
  login,
  isConnected,
  isInitialized
} = useSpotify()
const { 
  currentTrack, 
  isPlaying, 
  togglePlay, 
  nextTrack,
  previousTrack,
  setVolume
} = useSpotifyPlayer()

const isSpotifyConnected = computed(() => isInitialized.value && isConnected.value)

const isLoading = ref(true)
const userPlaylists = ref<SpotifyPlaylist[]>([])
const volume = ref(50)

// Load playlists
const loadPlaylists = async () => {
  if (!isConnected.value) return
  
  try {
    isLoading.value = true
    const playlists = await getUserPlaylists()
    userPlaylists.value = playlists
  } catch (error) {
    console.error('Error loading playlists:', error)
  } finally {
    isLoading.value = false
  }
}

// Create new playlist
const createPlaylist = async () => {
  if (!isConnected.value) return
  
  try {
    const name = prompt('Enter playlist name:')
    if (!name) return
    
    const description = prompt('Enter playlist description (optional):') || undefined
    
    const playlist = await spotifyCreatePlaylist(name, description)
    if (playlist) {
      // Reload playlists
      await loadPlaylists()
      // Navigate to the new playlist
      router.push(`/playlist/${playlist.id}`)
    }
  } catch (error) {
    console.error('Error creating playlist:', error)
    alert('Failed to create playlist. Please try again.')
  }
}

// Connect to Spotify
const connectSpotify = () => {
  login()
}

// Watch for connection changes
watch(isConnected, (newValue) => {
  if (newValue) {
    loadPlaylists()
  }
})

// Load playlists on mount if connected
onMounted(async () => {
  if (isConnected.value) {
    await loadPlaylists()
  }
})

// Handle logout
const handleLogout = async () => {
  try {
    await logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Handle track selection
const handleTrackSelect = (track: any) => {
  console.log('Selected track:', track)
  // TODO: Implement track playback
}

// Update volume
const updateVolume = (event: Event) => {
  const value = parseInt((event.target as HTMLInputElement).value)
  if (!isNaN(value)) {
    volume.value = value
    // Debounce volume changes to prevent rapid calls
    clearTimeout(volumeTimeout)
    volumeTimeout = setTimeout(() => {
      setVolume(value)
    }, 100)
  }
}

let volumeTimeout: NodeJS.Timeout
</script>

<style scoped>
.spotify-app {
  display: grid;
  grid-template-columns: auto 1fr;
  height: 100vh;
  background-color: #000000;
  color: white;
}

.sidebar {
  width: 300px;
  height: 100%;
  overflow-y: auto;
  background-color: #000000;
  border-right: 1px solid #282828;
}

.main-content {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  background: linear-gradient(to bottom, #1e1e1e, #121212);
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 1000;
}

.content-area {
  overflow-y: auto;
  padding: 20px;
}

.now-playing-bar {
  border-top: 1px solid #282828;
}

.nav-link {
  color: #b3b3b3;
  transition: color 0.2s;
}

.nav-link:hover, .nav-link.active {
  color: white !important;
}

.play-button {
  background-color: #1DB954;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-button:hover {
  transform: scale(1.1);
  background-color: #1ed760;
}

.progress {
  cursor: pointer;
  background-color: #4d4d4d;
}

.progress:hover .progress-bar {
  background-color: #1DB954;
}

.playlist-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.playlist-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.playlist-item.active {
  background-color: rgba(255, 255, 255, 0.1);
}

.playlist-cover {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.hover-bg-dark:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 6px;
  border: 3px solid #000000;
}

::-webkit-scrollbar-thumb:hover {
  background: #888;
}

.spotify-logo {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: -1px;
}

.search-container {
  position: relative;
  min-width: 300px;
}
</style> 