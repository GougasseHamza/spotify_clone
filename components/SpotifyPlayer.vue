<template>
  <div class="spotify-player">
    <!-- Loading and Error States -->
    <div v-if="!isPlayerReady && !playerError" class="player-loading">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading player...</span>
      </div>
      <span class="ms-2">Initializing player...</span>
    </div>
    
    <div v-if="playerError" class="player-error alert alert-warning">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <span>{{ playerError }}</span>
      <button v-if="playerError.includes('Premium')" class="btn btn-sm btn-outline-success ms-3" @click="openSpotifyPremium">
        Get Premium
      </button>
    </div>
    
    <!-- Player UI -->
    <div v-if="isPlayerReady && currentTrack" class="player-ui">
      <div class="player-track-info">
        <img 
          v-if="currentTrack.album?.images?.[0]?.url" 
          :src="currentTrack.album.images[0].url" 
          alt="Album artwork"
          class="track-image"
        />
        <div class="track-details">
          <h5 class="track-name">{{ currentTrack.name }}</h5>
          <p class="track-artist">{{ currentTrack.artists?.[0]?.name }}</p>
          <p class="track-album">{{ currentTrack.album?.name }}</p>
        </div>
      </div>
      
      <div class="player-controls">
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
      
      <!-- Volume Control -->
      <div class="volume-control">
        <i class="bi bi-volume-down"></i>
        <input 
          type="range" 
          min="0" 
          max="100" 
          step="1" 
          v-model="volume" 
          @change="updateVolume"
          class="volume-slider"
        />
        <i class="bi bi-volume-up"></i>
      </div>
    </div>
    
    <!-- If player is ready but no track is playing -->
    <div v-else-if="isPlayerReady && !currentTrack" class="player-ready-message">
      <p>Ready to play! Select a track to begin.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useSpotifyPlayer } from '@/composables/useSpotifyPlayer'

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

const openSpotifyPremium = () => {
  window.open('https://www.spotify.com/premium/', '_blank')
}

onMounted(() => {
  // If the player is already initialized, this will do nothing
  // The initialization happens automatically in the useSpotifyPlayer composable
})
</script>

<style scoped>
.spotify-player {
  background-color: #282828;
  color: white;
  padding: 16px;
  border-radius: 8px;
  margin: 20px 0;
  max-width: 800px;
}

.player-loading, .player-error, .player-ready-message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  min-height: 100px;
}

.player-track-info {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.track-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  margin-right: 16px;
}

.track-details {
  flex: 1;
}

.track-name {
  margin-bottom: 4px;
  font-weight: bold;
}

.track-artist, .track-album {
  margin: 0;
  font-size: 0.9rem;
  color: #b3b3b3;
}

.player-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  padding: 8px;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 8px;
  transition: transform 0.2s;
}

.control-btn:hover {
  color: #1db954;
  transform: scale(1.1);
}

.play-pause-btn {
  width: 48px;
  height: 48px;
  background-color: #1db954;
  color: black;
}

.play-pause-btn:hover {
  background-color: #1ed760;
  color: black;
}

.volume-control {
  display: flex;
  align-items: center;
  justify-content: center;
}

.volume-slider {
  width: 100px;
  margin: 0 10px;
  accent-color: #1db954;
}
</style> 