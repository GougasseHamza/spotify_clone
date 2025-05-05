import { ref, shallowRef, onMounted, onUnmounted } from 'vue'
import { useSpotify } from './useSpotify'

export const useSpotifyPlayer = () => {
  const { isConnected, spotifyApi, refreshAccessToken } = useSpotify()
  
  const player = shallowRef<Spotify.Player | null>(null)
  const deviceId = ref<string | null>(null)
  const isPlayerReady = ref(false)
  const isPlaying = ref(false)
  const currentTrack = ref<any>(null)
  const playerState = ref<Spotify.PlaybackState | null>(null)
  const playerError = ref<string | null>(null)
  
  // Load the Spotify Web Playback SDK Script
  const loadSpotifyScript = () => {
    return new Promise<void>((resolve, reject) => {
      // If script already exists, don't add it again
      if (document.getElementById('spotify-player')) {
        resolve()
        return
      }
      
      const script = document.createElement('script')
      script.id = 'spotify-player'
      script.src = 'https://sdk.scdn.co/spotify-player.js'
      script.async = true
      
      script.onload = () => resolve()
      script.onerror = (error) => reject(error)
      
      document.body.appendChild(script)
    })
  }
  
  // Initialize the player
  const initializePlayer = () => {
    if (!window.Spotify) {
      console.error('Spotify SDK not loaded')
      playerError.value = 'Spotify SDK not loaded'
      return
    }
    
    const token = spotifyApi.getAccessToken()
    if (!token) {
      console.error('User not authenticated with Spotify or token is missing')
      playerError.value = 'No Spotify access token available'
      return
    }
    
    console.log('Initializing Spotify Web Player...')
    
    player.value = new window.Spotify.Player({
      name: 'Spotify Clone Web Player',
      getOAuthToken: async (cb: (token: string) => void) => {
        let token = spotifyApi.getAccessToken()
        
        // If token might be expired, refresh it
        try {
          const refreshed = await refreshAccessToken()
          if (refreshed) {
            token = spotifyApi.getAccessToken() || ''
            console.log('Token refreshed successfully for player')
          } else {
            console.warn('Token refresh was not successful')
          }
        } catch (error) {
          console.error('Error refreshing access token:', error)
        }
        
        if (!token) {
          console.error('No access token available after refresh attempt')
        }
        
        cb(token || '')
      },
      volume: 0.5
    })
    
    // Error handling
    player.value.addListener('initialization_error', ({ message }) => {
      console.error('Initialization error:', message)
      playerError.value = `Initialization error: ${message}`
    })
    
    player.value.addListener('authentication_error', ({ message }) => {
      console.error('Authentication error:', message)
      playerError.value = `Authentication error: ${message}`
    })
    
    player.value.addListener('account_error', ({ message }) => {
      console.error('Account error:', message)
      playerError.value = `Premium required: ${message}`
    })
    
    player.value.addListener('playback_error', ({ message }) => {
      console.error('Playback error:', message)
      playerError.value = `Playback error: ${message}`
    })
    
    // Playback status updates
    player.value.addListener('player_state_changed', (state) => {
      if (!state) {
        isPlaying.value = false
        return
      }
      
      playerState.value = state
      isPlaying.value = !state.paused
      
      if (state.track_window?.current_track) {
        currentTrack.value = state.track_window.current_track
      }
    })
    
    // Ready
    player.value.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id)
      deviceId.value = device_id
      isPlayerReady.value = true
    })
    
    // Not Ready
    player.value.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id)
      isPlayerReady.value = false
    })
    
    // Connect to the player
    player.value.connect()
  }
  
  // Disconnect the player
  const disconnect = () => {
    if (player.value) {
      player.value.disconnect()
      isPlayerReady.value = false
      deviceId.value = null
    }
  }
  
  // Play a track
  const playTrack = async (trackUri: string) => {
    if (!isPlayerReady.value || !deviceId.value) {
      playerError.value = 'Player not ready'
      return
    }
    
    try {
      await spotifyApi.play({
        device_id: deviceId.value,
        uris: [trackUri]
      })
    } catch (error) {
      console.error('Error playing track:', error)
      playerError.value = 'Error playing track'
    }
  }
  
  // Play an album
  const playAlbum = async (albumUri: string) => {
    if (!isPlayerReady.value || !deviceId.value) {
      playerError.value = 'Player not ready'
      return
    }
    
    try {
      await spotifyApi.play({
        device_id: deviceId.value,
        context_uri: albumUri
      })
    } catch (error) {
      console.error('Error playing album:', error)
      playerError.value = 'Error playing album'
    }
  }
  
  // Play a playlist
  const playPlaylist = async (playlistUri: string) => {
    if (!isPlayerReady.value || !deviceId.value) {
      playerError.value = 'Player not ready'
      return
    }
    
    try {
      await spotifyApi.play({
        device_id: deviceId.value,
        context_uri: playlistUri
      })
    } catch (error) {
      console.error('Error playing playlist:', error)
      playerError.value = 'Error playing playlist'
    }
  }
  
  // Toggle play/pause
  const togglePlay = async () => {
    if (!player.value) return
    
    try {
      await player.value.togglePlay()
    } catch (error) {
      console.error('Error toggling play state:', error)
      playerError.value = 'Error toggling play state'
    }
  }
  
  // Seek to position
  const seek = async (positionMs: number) => {
    if (!player.value) return
    
    try {
      await player.value.seek(positionMs)
    } catch (error) {
      console.error('Error seeking:', error)
      playerError.value = 'Error seeking'
    }
  }
  
  // Set volume
  const setVolume = async (volumePercentage: number) => {
    if (!player.value) return
    
    try {
      await player.value.setVolume(volumePercentage / 100)
    } catch (error) {
      console.error('Error setting volume:', error)
      playerError.value = 'Error setting volume'
    }
  }
  
  // Previous track
  const previousTrack = async () => {
    if (!player.value) return
    
    try {
      await player.value.previousTrack()
    } catch (error) {
      console.error('Error skipping to previous track:', error)
      playerError.value = 'Error skipping to previous track'
    }
  }
  
  // Next track
  const nextTrack = async () => {
    if (!player.value) return
    
    try {
      await player.value.nextTrack()
    } catch (error) {
      console.error('Error skipping to next track:', error)
      playerError.value = 'Error skipping to next track'
    }
  }
  
  // Initialize the player when the component is mounted
  onMounted(async () => {
    if (process.client) {
      try {
        // Wait for Spotify API to be initialized and connected
        if (!isConnected.value) {
          console.log('Waiting for Spotify connection before initializing player...')
          // Check every 1 second up to 10 times if we're connected
          for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            if (isConnected.value) break
          }
        }
        
        // Only proceed if we're connected
        if (!isConnected.value) {
          console.warn('Not connected to Spotify, not initializing player')
          return
        }
        
        await loadSpotifyScript()
        
        // Wait for the Spotify SDK to load
        window.onSpotifyWebPlaybackSDKReady = () => {
          console.log('Spotify Web Playback SDK is ready')
          initializePlayer()
        }
        
        // If the callback didn't fire, but the SDK is already loaded, initialize anyway
        if (window.Spotify) {
          initializePlayer()
        }
      } catch (error) {
        console.error('Error initializing Spotify player:', error)
        playerError.value = 'Error initializing player'
      }
    }
  })
  
  // Disconnect player when the component is unmounted
  onUnmounted(() => {
    if (player.value) {
      disconnect()
    }
  })
  
  return {
    player,
    deviceId,
    isPlayerReady,
    isPlaying,
    currentTrack,
    playerState,
    playerError,
    playTrack,
    playAlbum,
    playPlaylist,
    togglePlay,
    seek,
    setVolume,
    previousTrack,
    nextTrack,
    disconnect
  }
}

// Declare the Spotify global namespace for TypeScript
declare global {
  interface Window {
    Spotify: {
      Player: new (options: Spotify.PlayerInit) => Spotify.Player;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

// Spotify types
declare namespace Spotify {
  interface PlayerInit {
    name: string;
    getOAuthToken: (callback: (token: string) => void) => void;
    volume?: number;
  }
  
  interface Player {
    connect: () => Promise<boolean>;
    disconnect: () => void;
    addListener: (eventName: string, callback: (state: any) => void) => void;
    removeListener: (eventName: string, callback?: (state: any) => void) => void;
    togglePlay: () => Promise<void>;
    seek: (positionMs: number) => Promise<void>;
    setVolume: (volume: number) => Promise<void>;
    previousTrack: () => Promise<void>;
    nextTrack: () => Promise<void>;
    getCurrentState: () => Promise<PlaybackState | null>;
  }
  
  interface PlaybackState {
    context: {
      uri: string;
      metadata: Record<string, unknown>;
    };
    disallows: {
      pausing: boolean;
      resuming: boolean;
      seeking: boolean;
      skipping_prev: boolean;
      skipping_next: boolean;
    };
    duration: number;
    paused: boolean;
    position: number;
    repeat_mode: number;
    shuffle: boolean;
    track_window: {
      current_track: WebPlaybackTrack;
      previous_tracks: WebPlaybackTrack[];
      next_tracks: WebPlaybackTrack[];
    };
  }
  
  interface WebPlaybackTrack {
    uri: string;
    id: string;
    type: 'track' | 'episode' | 'ad';
    media_type: 'audio' | 'video';
    name: string;
    is_playable: boolean;
    album: {
      uri: string;
      name: string;
      images: { url: string }[];
    };
    artists: {
      uri: string;
      name: string;
    }[];
  }
} 