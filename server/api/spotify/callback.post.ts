import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { code } = body

  if (!code) {
    throw createError({
      statusCode: 400,
      message: 'Authorization code is required'
    })
  }

  try {
    console.log('Attempting token exchange with code')
    
    // Exchange the code for tokens
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          `${config.public.spotifyClientId}:${config.spotifyClientSecret}`
        ).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'http://127.0.0.1:3000/callback'  // Hardcode the redirect URI to match exactly
      })
    })

    const responseText = await response.text()
    let data
    
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse response:', responseText)
      throw createError({
        statusCode: 500,
        message: 'Invalid response from Spotify'
      })
    }

    if (!response.ok) {
      console.error('Spotify token exchange failed:', data)
      throw createError({
        statusCode: response.status,
        message: data.error_description || data.error || 'Failed to exchange token'
      })
    }

    return data
  } catch (error: any) {
    console.error('Token exchange error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 