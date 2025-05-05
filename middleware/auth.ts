export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only run on client-side to avoid issues with SSR
  if (process.client) {
    const { isAuthenticated, user, authInitialized } = useAuth()
    
    // Wait for auth state to be initialized before making decisions
    // This avoids redirecting when Firebase is still checking auth state
    if (!authInitialized.value) {
      console.log('Auth Middleware - Waiting for auth state to initialize...')
      // Wait for a short time to let Firebase initialize
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    console.log('Auth Middleware - Current state:', { 
      authInitialized: authInitialized.value,
      isAuthenticated: isAuthenticated.value,
      user: user.value ? {
        uid: user.value.uid,
        email: user.value.email,
        displayName: user.value.displayName
      } : null,
      route: to.fullPath
    })

    // If not authenticated, redirect to login page
    if (!isAuthenticated.value) {
      console.log('Auth Middleware - Redirecting to login')
      // Store the original path in the query string so we can redirect back after login
      return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
    
    console.log('Auth Middleware - User authenticated, proceeding to', to.fullPath)
  }
}) 