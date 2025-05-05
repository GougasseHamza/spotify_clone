<template>
  <div class="music-profile">
    <!-- Track Profile -->
    <div v-if="type === 'track'" class="track-profile">
      <div class="profile-header">
        <img 
          :src="item.album.images[0]?.url || '/default-album.png'" 
          :alt="item.name"
          class="profile-image"
        >
        <div class="profile-info">
          <div class="profile-type">Song</div>
          <h1 class="profile-title">{{ item.name }}</h1>
          <div class="profile-meta">
            <img 
              v-if="item.album.images[2]?.url"
              :src="item.album.images[2].url" 
              :alt="item.artists[0].name"
              class="artist-thumbnail"
            >
            <span class="artist-name">{{ item.artists[0].name }}</span>
            <span class="bullet">•</span>
            <span class="album-name">{{ item.album.name }}</span>
            <span class="bullet">•</span>
            <span class="release-date">{{ formatDate(item.album.release_date) }}</span>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <SpotifyPlayButton 
          type="track" 
          :uri="item.uri" 
          :is-currently-playing="isCurrentlyPlaying('track', item.uri)"
        />
        <button class="action-button">
          <i class="bi bi-heart"></i>
        </button>
        <button class="action-button">
          <i class="bi bi-three-dots"></i>
        </button>
      </div>

      <div class="track-details">
        <div class="detail-item">
          <span class="label">Duration</span>
          <span class="value">{{ formatDuration(item.duration_ms) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Popularity</span>
          <div class="popularity-meter">
            <div class="popularity-fill" :style="{ width: item.popularity + '%' }"></div>
          </div>
        </div>
        <div v-if="item.explicit" class="detail-item">
          <span class="explicit-badge">Explicit</span>
        </div>
      </div>
    </div>

    <!-- Artist Profile -->
    <div v-else-if="type === 'artist'" class="artist-profile">
      <div class="profile-header">
        <img 
          :src="item.images[0]?.url || '/default-artist.png'" 
          :alt="item.name"
          class="profile-image artist-image"
        >
        <div class="profile-info">
          <div class="profile-type">Artist</div>
          <h1 class="profile-title">{{ item.name }}</h1>
          <div class="profile-meta">
            <span class="followers">{{ formatNumber(item.followers.total) }} followers</span>
            <span v-if="item.genres?.length" class="genres">
              <span class="bullet">•</span>
              {{ item.genres.slice(0, 3).join(', ') }}
            </span>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <SpotifyPlayButton 
          type="artist" 
          :uri="item.uri" 
          :is-currently-playing="isCurrentlyPlaying('artist', item.uri)"
        />
        <button class="action-button">
          <i class="bi bi-person-plus"></i>
        </button>
        <button class="action-button">
          <i class="bi bi-three-dots"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSpotifyPlayer } from '~/composables/useSpotifyPlayer'

const props = defineProps<{
  type: 'track' | 'artist'
  item: any
}>()

const { currentTrack, playerState } = useSpotifyPlayer()

// Check if this item is currently playing
const isCurrentlyPlaying = (type: string, uri: string) => {
  if (!currentTrack.value || !playerState.value) return false
  
  if (type === 'track') {
    return currentTrack.value.uri === uri && !playerState.value.paused
  } else if (type === 'artist') {
    // Artists don't have specific playing status, but we can check if we're playing their track
    return currentTrack.value.artists.some((artist: any) => artist.uri === uri) && !playerState.value.paused
  }
  
  return false
}

// Format duration from milliseconds to MM:SS
const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Format date to readable format
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Format large numbers with commas
const formatNumber = (num: number) => {
  return num.toLocaleString('en-US')
}
</script>

<style scoped>
.music-profile {
  padding: 20px;
  color: white;
}

.profile-header {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.profile-image {
  width: 232px;
  height: 232px;
  object-fit: cover;
  box-shadow: 0 4px 60px rgba(0, 0, 0, .5);
}

.profile-image.artist-image {
  border-radius: 50%;
}

.profile-info {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.profile-type {
  font-size: 0.875rem;
  margin-bottom: 8px;
}

.profile-title {
  font-size: 4rem;
  font-weight: 700;
  margin: 0 0 16px;
  line-height: 1.1;
}

.profile-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.artist-thumbnail {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 4px;
}

.bullet {
  color: rgba(255, 255, 255, 0.6);
}

.action-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.play-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #1DB954;
  border: none;
  color: white;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.play-button:hover {
  transform: scale(1.05);
  background: #1ed760;
}

.action-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  color: white;
  transform: scale(1.05);
}

.track-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  width: 100px;
}

.value {
  color: white;
  font-size: 0.875rem;
}

.popularity-meter {
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.popularity-fill {
  height: 100%;
  background: #1DB954;
  transition: width 0.3s ease;
}

.explicit-badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.genres {
  color: rgba(255, 255, 255, 0.7);
}
</style> 