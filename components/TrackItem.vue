<template>
  <div 
    class="track-item"
    :class="{ 'is-playing': isCurrentTrack }"
    @dblclick="playTrack(track.uri)"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="track-number">
      <span v-if="!isHovered && !isCurrentTrack">{{ index + 1 }}</span>
      <button 
        v-else
        class="play-button" 
        @click="playTrack(track.uri)"
        :aria-label="isPlaying && isCurrentTrack ? 'Pause' : 'Play'"
      >
        <i :class="isPlaying && isCurrentTrack ? 'bi bi-pause-fill' : 'bi bi-play-fill'"></i>
      </button>
    </div>
    
    <div class="track-info">
      <div class="d-flex align-items-center">
        <img 
          v-if="track.album?.images?.[0]?.url" 
          :src="track.album?.images?.[0]?.url" 
          :alt="track.album?.name" 
          class="track-image me-3"
        />
        <div>
          <div :class="['track-title', { 'text-success': isCurrentTrack }]">{{ track.name }}</div>
          <div class="track-artist">
            <span v-for="(artist, i) in track.artists" :key="artist.id">
              <NuxtLink :to="`/artist/${artist.id}`" class="artist-link">
                {{ artist.name }}
              </NuxtLink>
              <span v-if="i < track.artists.length - 1">, </span>
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="track-album">
      <NuxtLink :to="`/album/${track.album?.id}`" class="album-link">
        {{ track.album?.name }}
      </NuxtLink>
    </div>
    
    <div class="track-duration">
      <div class="d-flex align-items-center">
        <!-- Add to Playlist Button -->
        <div 
          class="track-actions"
          :class="{ 'visible': isHovered || isCurrentTrack }"
        >
          <AddToPlaylistMenu 
            :track-uri="track.uri" 
            :track-name="track.name" 
          />
        </div>
        
        <!-- Duration -->
        <span>{{ formatDuration(track.duration_ms) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, onMounted, watch } from 'vue'
import { useSpotifyPlayer } from '~/composables/useSpotifyPlayer'
import AddToPlaylistMenu from '~/components/AddToPlaylistMenu.vue'

const props = defineProps({
  track: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

const isHovered = ref(false)
const { currentTrack, isPlaying, playTrack } = useSpotifyPlayer()

// Check if this track is currently playing
const isCurrentTrack = computed(() => {
  return currentTrack.value?.id === props.track.id
})

// Format duration from milliseconds to MM:SS
const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Mouse event handlers
const handleMouseEnter = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
}
</script>

<style scoped>
.track-item {
  display: grid;
  grid-template-columns: 50px 4fr 3fr 90px;
  align-items: center;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.track-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.track-item.is-playing {
  background-color: rgba(29, 185, 84, 0.1);
}

.track-number {
  width: 30px;
  color: #b3b3b3;
  font-size: 14px;
  text-align: center;
}

.play-button {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.track-info {
  display: flex;
  align-items: center;
  min-width: 0;
}

.track-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 2px;
}

.track-title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.track-artist {
  color: #b3b3b3;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-album {
  color: #b3b3b3;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 16px;
}

.track-duration {
  text-align: right;
  color: #b3b3b3;
  font-size: 14px;
  display: flex;
  justify-content: flex-end;
}

.track-actions {
  margin-right: 16px;
  opacity: 0;
  transition: opacity 0.2s;
}

.track-actions.visible {
  opacity: 1;
}

.artist-link,
.album-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;
}

.artist-link:hover,
.album-link:hover {
  color: white;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .track-item {
    grid-template-columns: 40px 1fr auto;
  }
  
  .track-album {
    display: none;
  }
}
</style> 