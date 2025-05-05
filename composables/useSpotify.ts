import SpotifyWebApi from 'spotify-web-api-node'

export const useSpotify = () => {
  const config = useRuntimeConfig()
  
  const spotifyApi = new SpotifyWebApi({
    clientId: config.public.spotifyClientId,
    clientSecret: config.spotifyClientSecret,
    redirectUri: config.public.spotifyRedirectUri
  })

  const login = () => {
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'user-read-recently-played',
      'user-top-read',
      'playlist-read-private',
      'playlist-read-collaborative',
      'streaming'
    ]
    const state = generateRandomString(16)
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state)
    window.location.href = authorizeURL
  }

  const handleCallback = async (code: string) => {
    try {
      const data = await spotifyApi.authorizationCodeGrant(code)
      spotifyApi.setAccessToken(data.body.access_token)
      spotifyApi.setRefreshToken(data.body.refresh_token)
      return data.body
    } catch (error) {
      console.error('Error getting tokens:', error)
      throw error
    }
  }

  const getFeaturedPlaylists = async () => {
    try {
      const response = await spotifyApi.getFeaturedPlaylists()
      return response.body.playlists.items
    } catch (error) {
      console.error('Error getting featured playlists:', error)
      throw error
    }
  }

  const getMyTopArtists = async () => {
    try {
      const response = await spotifyApi.getMyTopArtists()
      return response.body.items
    } catch (error) {
      console.error('Error getting top artists:', error)
      throw error
    }
  }

  const getMyRecentlyPlayed = async () => {
    try {
      const response = await spotifyApi.getMyRecentlyPlayedTracks()
      return response.body.items
    } catch (error) {
      console.error('Error getting recently played tracks:', error)
      throw error
    }
  }

  const searchTracks = async (query: string) => {
    try {
      const response = await spotifyApi.searchTracks(query)
      return response.body.tracks?.items || []
    } catch (error) {
      console.error('Error searching tracks:', error)
      throw error
    }
  }

  // Helper function to generate random string for state
  const generateRandomString = (length: number) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const values = crypto.getRandomValues(new Uint8Array(length))
    return values.reduce((acc, x) => acc + possible[x % possible.length], '')
  }

  return {
    login,
    handleCallback,
    getFeaturedPlaylists,
    getMyTopArtists,
    getMyRecentlyPlayed,
    searchTracks,
    spotifyApi
  }
} 