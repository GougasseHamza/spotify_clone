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
        </ul>
      </div>

      <!-- Spotify Connection Status -->
      <div v-if="isAuthenticated && !isSpotifyConnected" class="spotify-status-panel p-3 mb-3 rounded-3 bg-dark-subtle">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h6 class="mb-0">Connect to Spotify</h6>
        </div>
        <p class="text-muted small mb-2">Connect to see your playlists and listen to music</p>
        <button @click="connectToSpotify" class="btn btn-success btn-sm rounded-pill w-100">
          <i class="bi bi-spotify me-2"></i> Connect
        </button>
      </div>

      <!-- Library Section -->
      <div class="library-section">
        <div class="d-flex align-items-center justify-content-between p-3">
          <div class="d-flex align-items-center">
            <i class="bi bi-collection me-2"></i>
            <span>Your Library</span>
          </div>
          <div>
            <button class="btn btn-link text-white p-1"><i class="bi bi-plus"></i></button>
            <button class="btn btn-link text-white p-1"><i class="bi bi-arrow-right"></i></button>
          </div>
        </div>

        <!-- Playlists -->
        <div class="playlists-container p-2">
          <div v-if="!user" class="playlist-cta p-3 rounded-3 bg-dark-subtle mb-3">
            <h6 class="mb-2">Create your first playlist</h6>
            <p class="text-muted small mb-2">It's easy, we'll help you</p>
            <button class="btn btn-light btn-sm rounded-pill">Create playlist</button>
          </div>

          <!-- Playlist Items -->
          <div class="playlist-item p-2 rounded-2 hover-bg-dark" v-for="playlist in playlists" :key="playlist.id">
            <div class="d-flex align-items-center">
              <img :src="playlist.imageUrl" class="rounded-2 me-3" width="48" height="48" :alt="playlist.name">
              <div>
                <div class="playlist-name">{{ playlist.name }}</div>
                <div class="text-muted small">Playlist • {{ playlist.owner }}</div>
              </div>
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
          
          <div class="search-container" v-if="$route.path === '/search'">
            <div class="input-group">
              <span class="input-group-text bg-dark border-0">
                <i class="bi bi-search"></i>
              </span>
              <input type="text" class="form-control bg-dark border-0 text-white" placeholder="What do you want to play?">
            </div>
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
            <img src="https://placeholder.co/56" class="rounded me-3" width="56" height="56" alt="">
            <div>
              <div class="track-name">Track Name</div>
              <div class="artist-name text-muted small">Artist Name</div>
            </div>
            <button class="btn btn-link text-white ms-3">
              <i class="bi bi-heart"></i>
            </button>
          </div>

          <!-- Player Controls -->
          <div class="player-controls text-center" style="width: 40%">
            <div class="d-flex justify-content-center align-items-center gap-3 mb-2">
              <button class="btn btn-link text-white"><i class="bi bi-shuffle"></i></button>
              <button class="btn btn-link text-white"><i class="bi bi-skip-start-fill"></i></button>
              <button class="btn btn-link text-white rounded-circle play-button">
                <i class="bi bi-play-fill fs-4"></i>
              </button>
              <button class="btn btn-link text-white"><i class="bi bi-skip-end-fill"></i></button>
              <button class="btn btn-link text-white"><i class="bi bi-repeat"></i></button>
            </div>
            <div class="progress" style="height: 4px">
              <div class="progress-bar bg-white" role="progressbar" style="width: 25%"></div>
            </div>
          </div>

          <!-- Volume Controls -->
          <div class="volume-controls d-flex align-items-center justify-content-end gap-3" style="width: 30%">
            <button class="btn btn-link text-white"><i class="bi bi-mic"></i></button>
            <button class="btn btn-link text-white"><i class="bi bi-list"></i></button>
            <button class="btn btn-link text-white"><i class="bi bi-volume-up"></i></button>
            <div class="progress" style="width: 100px; height: 4px">
              <div class="progress-bar bg-white" role="progressbar" style="width: 60%"></div>
            </div>
            <button class="btn btn-link text-white"><i class="bi bi-arrows-angle-expand"></i></button>
          </div>
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const { user, isAuthenticated, logout } = useAuth()
const { isConnected, isInitialized, login: spotifyLogin } = useSpotify()
const router = useRouter()

const isSpotifyConnected = computed(() => isInitialized.value && isConnected.value)

// Mock playlists data
const playlists = ref([
  {
    id: '1',
    name: 'Liked Songs',
    owner: 'You',
    imageUrl: 'https://misc.scdn.co/liked-songs/liked-songs-640.png'
  },
  {
    id: '2',
    name: 'Your Top Songs 2023',
    owner: 'Spotify',
    imageUrl: 'https://wrapped-images.spotifycdn.com/image/yts-2023/default/your-top-songs-2023_default_en.jpg'
  }
])

const login = async () => {
  try {
    // Navigate to login page instead of direct Google login
    navigateTo('/login')
  } catch (error) {
    console.error('Login error:', error)
  }
}

// Connect to Spotify
const connectToSpotify = () => {
  spotifyLogin()
}

// Handle logout
const handleLogout = async () => {
  try {
    await logout()
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
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
  background-color: #282828;
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
</style> 