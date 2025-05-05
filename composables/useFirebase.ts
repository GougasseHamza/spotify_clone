import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAnalytics, type Analytics } from 'firebase/analytics'

export const useFirebase = () => {
  const config = useRuntimeConfig()
  const firebaseConfig: FirebaseOptions = {
    apiKey: config.public.firebaseConfig.apiKey,
    authDomain: config.public.firebaseConfig.authDomain,
    projectId: config.public.firebaseConfig.projectId,
    storageBucket: config.public.firebaseConfig.storageBucket,
    messagingSenderId: config.public.firebaseConfig.messagingSenderId,
    appId: config.public.firebaseConfig.appId
  }

  // Add measurement ID if available
  if (process.env.FIREBASE_MEASUREMENT_ID) {
    (firebaseConfig as any).measurementId = process.env.FIREBASE_MEASUREMENT_ID
  }
  
  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)
  let analytics: Analytics | null = null

  // Initialize analytics only in client-side environment
  if (process.client && firebaseConfig.measurementId) {
    analytics = getAnalytics(app)
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      return result.user
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  return {
    auth,
    db,
    analytics,
    loginWithGoogle,
    logout
  }
} 