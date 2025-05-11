<template>
  <div class="add-to-playlist">
    <button 
      class="btn btn-success btn-sm rounded-pill" 
      @click="toggleMenu" 
      ref="menuTrigger"
      title="Add to playlist"
    >
      <i class="bi bi-plus-circle me-1"></i>
      Add to playlist
    </button>
    
    <!-- Dropdown Menu -->
    <div 
      v-if="isOpen" 
      class="playlists-dropdown" 
      :style="dropdownPosition"
    >
      <div class="dropdown-header">
        <strong>Add to playlist</strong>
        <button @click="toggleMenu" class="close-btn">
          <i class="bi bi-x"></i>
        </button>
      </div>
      
      <div class="dropdown-content">
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-3">
          <div class="spinner-border spinner-border-sm text-light" role="status">
            <span class="visually-hidden">Loading playlists...</span>
          </div>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="text-center py-3">
          <p class="text-danger mb-0">{{ error }}</p>
          <button @click="loadUserPlaylists" class="btn btn-sm btn-outline-light mt-2">
            Try Again
          </button>
        </div>
        
        <!-- No Playlists -->
        <div v-else-if="userPlaylists.length === 0" class="text-center py-3">
          <p class="text-muted small mb-2">You don't have any playlists yet</p>
          <button @click="createNewPlaylist" class="btn btn-sm btn-success">
            <i class="bi bi-plus-circle me-1"></i> Create Playlist
          </button>
        </div>
        
        <!-- Playlist List -->
        <div v-else class="playlist-list">
          <div 
            v-for="playlist in userPlaylists" 
            :key="playlist.id" 
            class="playlist-item"
            @click="addToPlaylist(playlist.id)"
          >
            <img 
              :src="playlist.images?.[0]?.url || '/img/placeholder-playlist.png'" 
              :alt="playlist.name" 
              class="playlist-cover"
            />
            <span class="playlist-name">{{ playlist.name }}</span>
          </div>
          
          <div class="playlist-item create-new" @click="createNewPlaylist">
            <div class="plus-icon">
              <i class="bi bi-plus-lg"></i>
            </div>
            <span class="playlist-name">Create New Playlist</span>
          </div>
        </div>
      </div>
      
      <!-- Success Notification -->
      <div v-if="successMessage" class="success-notification">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSpotify } from '~/composables/useSpotify'

// Props
const props = defineProps({
  trackUri: {
    type: String,
    required: true
  },
  trackName: {
    type: String,
    required: true
  }
})

// Component state
const { 
  getUserPlaylists, 
  createPlaylist: spotifyCreatePlaylist,
  addTrackToPlaylist 
} = useSpotify()

const isOpen = ref(false)
const isLoading = ref(false)
const error = ref('')
const userPlaylists = ref<any[]>([])
const menuTrigger = ref<HTMLElement | null>(null)
const dropdownPosition = ref({})
const successMessage = ref('')

// Load user playlists
const loadUserPlaylists = async () => {
  if (isLoading.value) return
  
  try {
    isLoading.value = true
    error.value = ''
    const playlists = await getUserPlaylists()
    userPlaylists.value = playlists || []
  } catch (err) {
    console.error('Error loading playlists:', err)
    error.value = 'Failed to load your playlists'
  } finally {
    isLoading.value = false
  }
}

// Toggle menu visibility
const toggleMenu = () => {
  if (!isOpen.value) {
    // Position dropdown
    if (menuTrigger.value) {
      const rect = menuTrigger.value.getBoundingClientRect()
      dropdownPosition.value = {
        top: `${rect.bottom + window.scrollY + 5}px`,
        left: `${rect.left + window.scrollX - 130}px`
      }
    }
    
    isOpen.value = true
    // Load playlists when menu opens
    loadUserPlaylists()
  } else {
    isOpen.value = false
    successMessage.value = ''
  }
}

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (isOpen.value && menuTrigger.value && !menuTrigger.value.contains(event.target as Node)) {
    const dropdown = document.querySelector('.playlists-dropdown')
    if (dropdown && !dropdown.contains(event.target as Node)) {
      isOpen.value = false
    }
  }
}

// Create a new playlist
const createNewPlaylist = async () => {
  try {
    const name = prompt('Enter playlist name:', 'My Playlist')
    if (!name) return // User cancelled
    
    const description = prompt('Enter playlist description (optional):')
    
    isLoading.value = true
    const playlist = await spotifyCreatePlaylist(name, description || undefined)
    
    if (playlist && playlist.id) {
      // Add current track to the new playlist
      await addTrackToPlaylist(playlist.id, [props.trackUri])
      successMessage.value = `Added to "${name}"`
      
      // Reload playlists
      await loadUserPlaylists()
    }
  } catch (err) {
    console.error('Error creating playlist:', err)
    error.value = 'Failed to create playlist'
  } finally {
    isLoading.value = false
  }
}

// Add track to existing playlist
const addToPlaylist = async (playlistId: string) => {
  try {
    isLoading.value = true
    await addTrackToPlaylist(playlistId, [props.trackUri])
    
    // Find playlist name
    const playlist = userPlaylists.value.find(p => p.id === playlistId)
    const playlistName = playlist ? playlist.name : 'playlist'
    
    successMessage.value = `Added to "${playlistName}"`
    setTimeout(() => {
      isOpen.value = false
      successMessage.value = ''
    }, 2000)
  } catch (err) {
    console.error('Error adding track to playlist:', err)
    error.value = 'Failed to add track to playlist'
  } finally {
    isLoading.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.add-to-playlist {
  position: relative;
  display: inline-block;
}

.playlists-dropdown {
  position: absolute;
  width: 280px;
  background-color: #282828;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #333;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.close-btn {
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
}

.close-btn:hover {
  color: white;
}

.dropdown-content {
  max-height: 300px;
  overflow-y: auto;
}

.playlist-list {
  padding: 8px 0;
}

.playlist-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.playlist-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.playlist-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  margin-right: 12px;
}

.playlist-name {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plus-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  margin-right: 12px;
}

.create-new {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 8px;
  padding-top: 12px;
}

.success-notification {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background-color: #1DB954;
  color: white;
  text-align: center;
  border-radius: 0 0 8px 8px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style> 