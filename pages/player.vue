<template>
  <div class="player-page">
    <div v-if="!isPlayerReady" class="loading-state">
      <div v-if="playerError" class="error-message">
        {{ playerError }}
      </div>
      <div v-else class="loading-message">
        <div class="spinner"></div>
        <p>Initializing player...</p>
      </div>
    </div>
    
    <div v-else class="player-content">
      <div class="current-track">
        <img 
          :src="currentTrack?.album?.images[0]?.url || '/images/placeholder.png'" 
          :alt="currentTrack?.name || 'No track playing'"
          class="track-image"
        />
        <div class="track-info">
          <h2>{{ currentTrack?.name || 'No track playing' }}</h2>
          <p class="artists">{{ currentTrack?.artists?.map((artist: SpotifyArtist) => artist.name).join(', ') || 'No artist' }}</p>
          <p class="album">{{ currentTrack?.album?.name || 'No album' }}</p>
        </div>
      </div>

      <div class="progress-bar">
        <span class="time current">{{ formatTime(currentTrack?.progress_ms || 0) }}</span>
        <div class="progress-track">
          <div 
            class="progress-fill" 
            :style="{ width: `${(currentTrack?.progress_ms || 0) / (currentTrack?.duration_ms || 1) * 100}%` }"
          ></div>
        </div>
        <span class="time total">{{ formatTime(currentTrack?.duration_ms || 0) }}</span>
      </div>

      <div class="player-controls">
        <button 
          @click="previousTrack" 
          class="control-button"
          :disabled="!isPlayerReady"
        >
          <i class="fas fa-step-backward"></i>
        </button>
        
        <button 
          @click="isPlaying ? pause() : play()" 
          class="control-button play-button"
          :disabled="!isPlayerReady"
        >
          <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
        </button>
        
        <button 
          @click="nextTrack" 
          class="control-button"
          :disabled="!isPlayerReady"
        >
          <i class="fas fa-step-forward"></i>
        </button>
      </div>

      <div class="volume-control">
        <i class="fas fa-volume-down"></i>
        <input 
          type="range" 
          :value="volume"
          min="0" 
          max="1" 
          step="0.01"
          @input="(e) => setVolume(parseFloat((e.target as HTMLInputElement).value))"
          :disabled="!isPlayerReady"
        />
        <i class="fas fa-volume-up"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSpotify } from '~/composables/useSpotify'
import { useSpotifyPlayer } from '~/composables/useSpotifyPlayer'

interface SpotifyArtist {
  id: string
  name: string
  type: string
  uri: string
}

const spotifyApi = useSpotify()
const { 
  isPlayerReady,
  playerError,
  currentTrack,
  isPlaying,
  play,
  pause,
  nextTrack,
  previousTrack,
  setVolume,
  volume
} = useSpotifyPlayer()

// Format time in milliseconds to MM:SS
const formatTime = (ms: number) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.player-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.error-message {
  color: #e74c3c;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.loading-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1DB954;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.player-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.current-track {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.track-image {
  width: 160px;
  height: 160px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.track-info {
  flex: 1;
}

.track-info h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: #fff;
  font-weight: 700;
}

.track-info .artists {
  font-size: 1.2rem;
  color: #b3b3b3;
  margin-bottom: 0.5rem;
}

.track-info .album {
  font-size: 1rem;
  color: #808080;
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
}

.progress-track {
  flex: 1;
  height: 4px;
  background: #535353;
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #1DB954;
  border-radius: 2px;
  transition: width 0.1s linear;
}

.time {
  font-size: 0.8rem;
  color: #b3b3b3;
  min-width: 40px;
}

.player-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
}

.control-button {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.control-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.play-button {
  font-size: 2rem;
  background: #1DB954;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-button:hover:not(:disabled) {
  background: #1ed760;
  transform: scale(1.1);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.volume-control input[type="range"] {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  background: #535353;
  border-radius: 2px;
  outline: none;
}

.volume-control input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: #1DB954;
  border-radius: 50%;
  cursor: pointer;
}

.volume-control input[type="range"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.volume-control i {
  color: #b3b3b3;
  font-size: 1.2rem;
}

@media (max-width: 640px) {
  .current-track {
    flex-direction: column;
    text-align: center;
  }
  
  .track-image {
    width: 200px;
    height: 200px;
  }
  
  .track-info h2 {
    font-size: 1.5rem;
  }
  
  .track-info .artists {
    font-size: 1rem;
  }
  
  .play-button {
    width: 56px;
    height: 56px;
    font-size: 1.8rem;
  }
}
</style> 