<template>
  <button @click="playItem" class="btn btn-success btn-sm rounded-circle play-button mb-2"
          :disabled="!isPlayerReady || !isSpotifyConnected"
          :title="buttonTitle">
    <i :class="iconClass"></i>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSpotify } from '~/composables/useSpotify'
import { useSpotifyPlayer } from '~/composables/useSpotifyPlayer'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value: string) => ['track', 'album', 'playlist', 'artist'].includes(value)
  },
  uri: {
    type: String,
    required: true
  },
  isCurrentlyPlaying: {
    type: Boolean,
    default: false
  }
})

const { isPlayerReady, playTrack, playAlbum, playPlaylist } = useSpotifyPlayer()
const { isConnected, isInitialized } = useSpotify()

const isSpotifyConnected = computed(() => isInitialized.value && isConnected.value)

const iconClass = computed(() => {
  return props.isCurrentlyPlaying 
    ? 'bi bi-pause-fill' 
    : 'bi bi-play-fill'
})

const buttonTitle = computed(() => {
  if (!isSpotifyConnected.value) {
    return 'Connect to Spotify first'
  }
  if (!isPlayerReady.value) {
    return 'Player not ready'
  }
  return props.isCurrentlyPlaying ? 'Pause' : 'Play'
})

const playItem = async () => {
  if (!isPlayerReady.value || !isSpotifyConnected.value) return
  
  try {
    switch (props.type) {
      case 'track':
        await playTrack(props.uri)
        break
      case 'album':
        await playAlbum(props.uri)
        break
      case 'playlist':
        await playPlaylist(props.uri)
        break
      case 'artist':
        // For artists, we'll play their top tracks
        await playAlbum(props.uri)
        break
    }
  } catch (error) {
    console.error(`Error playing ${props.type}:`, error)
  }
}
</script>

<style scoped>
.play-button {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s, background-color 0.2s;
}

.play-button:hover:not(:disabled) {
  transform: scale(1.1);
  background-color: #1ed760;
}

.play-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.play-button i {
  font-size: 1.2rem;
}
</style> 