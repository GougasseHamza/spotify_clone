<template>
  <div class="player-page">
    <div class="container">
      <div class="row">
        <div class="col-12 mb-4">
          <h1>Now Playing</h1>
        </div>
        
        <div v-if="!isConnected" class="col-12">
          <div class="connect-spotify text-center p-5">
            <h2 class="mb-4">Connect to Spotify</h2>
            <p>To use the player, you need to connect your Spotify Premium account.</p>
            <button @click="connectToSpotify" class="btn btn-lg btn-success rounded-pill mt-3">
              <i class="bi bi-spotify me-2"></i> Connect to Spotify
            </button>
          </div>
        </div>
        
        <div v-else-if="playerError" class="col-12">
          <div class="alert alert-warning">
            <h4><i class="bi bi-exclamation-triangle-fill me-2"></i> Player Error</h4>
            <p>{{ playerError }}</p>
            
            <div v-if="playerError.includes('Premium')" class="mt-3">
              <p>Spotify Web Playback SDK requires a Spotify Premium subscription.</p>
              <a href="https://www.spotify.com/premium/" target="_blank" class="btn btn-outline-success">
                Get Spotify Premium
              </a>
            </div>
          </div>
        </div>
        
        <div v-else class="col-12">
          <!-- Player Loading State -->
          <div v-if="!isPlayerReady" class="text-center p-5">
            <div class="spinner-border text-success" role="status">
              <span class="visually-hidden">Loading player...</span>
            </div>
            <p class="mt-3">Initializing Spotify player...</p>
          </div>
          
          <!-- Full Player UI -->
          <div v-else-if="currentTrack" class="player-container">
            <div class="row">
              <div class="col-md-4">
                <div class="album-cover">
                  <img 
                    :src="currentTrack.album?.images?.[0]?.url || '/img/placeholder-album.png'" 
                    :alt="currentTrack.album?.name"
                    class="img-fluid rounded shadow"
                  />
                </div>
              </div>
              
              <div class="col-md-8">
                <div class="track-info">
                  <h2 class="track-name">{{ currentTrack.name }}</h2>
                  <h3 class="track-artist">{{ currentTrack.artists?.[0]?.name }}</h3>
                  <p class="track-album text-muted">{{ currentTrack.album?.name }}</p>
                  
                  <div class="player-controls mt-5">
                    <button @click="previousTrack" class="control-btn">
                      <i class="bi bi-skip-backward-fill"></i>
                    </button>
                    <button @click="togglePlay" class="control-btn play-pause-btn">
                      <i :class="isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill'"></i>
                    </button>
                    <button @click="nextTrack" class="control-btn">
                      <i class="bi bi-skip-forward-fill"></i>
                    </button>
                  </div>
                  
                  <div class="volume-control mt-4">
                    <div class="d-flex align-items-center">
                      <i class="bi bi-volume-down me-2"></i>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        v-model="volume" 
                        @change="updateVolume"
                        class="form-range"
                      />
                      <i class="bi bi-volume-up ms-2"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- No Track Playing State -->
          <div v-else class="text-center p-5">
            <h3>No Track Playing</h3>
            <p>Play a track from your library or search results to see it here.</p>
            <div class="mt-4">
              <NuxtLink to="/search" class="btn btn-outline-success me-3">
                <i class="bi bi-search me-2"></i> Search
              </NuxtLink>
              <NuxtLink to="/my-music" class="btn btn-outline-success">
                <i class="bi bi-music-note-list me-2"></i> My Music
              </NuxtLink>
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

definePageMeta({
  middleware: ['auth']
})

const { isConnected, login } = useSpotify()
const {
  isPlayerReady, 
  isPlaying, 
  currentTrack, 
  playerError,
  togglePlay,
  previousTrack,
  nextTrack,
  setVolume
} = useSpotifyPlayer()

const volume = ref(50)

const updateVolume = () => {
  setVolume(volume.value)
}

const connectToSpotify = () => {
  login()
}

// Helper function to format track durations
const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.player-page {
  min-height: 80vh;
  padding: 2rem 0;
}

.player-container {
  background-color: #121212;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.album-cover {
  margin-bottom: 2rem;
}

.album-cover img {
  width: 100%;
  max-width: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 60px rgba(0, 0, 0, 0.5);
}

.track-info {
  margin-bottom: 2rem;
}

.track-name {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.track-artist {
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #1DB954;
}

.track-album {
  font-size: 1rem;
}

.player-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem 0;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  padding: 0.5rem;
  margin: 0 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  color: #1DB954;
  transform: scale(1.1);
}

.play-pause-btn {
  font-size: 3rem;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #1DB954;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-pause-btn:hover {
  background-color: #1ED760;
  color: black;
}

.form-range {
  accent-color: #1DB954;
}

@media (max-width: 768px) {
  .track-name {
    font-size: 2rem;
  }
  
  .track-artist {
    font-size: 1.25rem;
  }
  
  .control-btn {
    font-size: 1.5rem;
    margin: 0 0.5rem;
  }
  
  .play-pause-btn {
    font-size: 2rem;
    width: 48px;
    height: 48px;
  }
}
</style> 