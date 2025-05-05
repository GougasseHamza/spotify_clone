import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { ref, computed } from 'vue'

export const useAuth = () => {
  const { auth, db } = useFirebase()
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  const isLoading = ref(false)
  const authInitialized = ref(false)

  // Initialize user on auth state change
  if (process.client) {
    const unsubscribe = onAuthStateChanged(auth, (userData) => {
      user.value = userData
      authInitialized.value = true
      console.log('Auth State Changed:', { 
        user: userData ? { 
          uid: userData.uid, 
          email: userData.email,
          displayName: userData.displayName
        } : null, 
        isAuthenticated: !!userData 
      })
    })
  }

  // Register with email and password
  const registerWithEmail = async (email: string, password: string) => {
    isLoading.value = true
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await createUserProfile(userCredential.user)
      return userCredential.user
    } catch (error: any) {
      throw new Error(formatFirebaseError(error))
    } finally {
      isLoading.value = false
    }
  }

  // Login with email and password
  const loginWithEmail = async (email: string, password: string) => {
    isLoading.value = true
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error: any) {
      throw new Error(formatFirebaseError(error))
    } finally {
      isLoading.value = false
    }
  }

  // Login with Google
  const loginWithGoogle = async () => {
    isLoading.value = true
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      
      // Check if it's a new user and create profile
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
      if (!userDoc.exists()) {
        await createUserProfile(userCredential.user)
      }
      
      return userCredential.user
    } catch (error: any) {
      throw new Error(formatFirebaseError(error))
    } finally {
      isLoading.value = false
    }
  }

  // Logout
  const logout = async () => {
    isLoading.value = true
    try {
      await signOut(auth)
    } catch (error: any) {
      throw new Error(formatFirebaseError(error))
    } finally {
      isLoading.value = false
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    isLoading.value = true
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      throw new Error(formatFirebaseError(error))
    } finally {
      isLoading.value = false
    }
  }

  // Update user profile
  const updateUserProfile = async (displayName?: string, photoURL?: string) => {
    if (!user.value) return
    
    isLoading.value = true
    try {
      const updates: { displayName?: string; photoURL?: string } = {}
      if (displayName) updates.displayName = displayName
      if (photoURL) updates.photoURL = photoURL
      
      await updateProfile(user.value, updates)
      
      // Update Firestore document
      await setDoc(doc(db, 'users', user.value.uid), {
        displayName: displayName || user.value.displayName,
        photoURL: photoURL || user.value.photoURL,
        updatedAt: serverTimestamp()
      }, { merge: true })
    } catch (error: any) {
      throw new Error(formatFirebaseError(error))
    } finally {
      isLoading.value = false
    }
  }

  // Helper function to create user profile in Firestore
  const createUserProfile = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid)
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0],
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error creating user profile:', error)
    }
  }

  // Format Firebase error messages to user-friendly messages
  const formatFirebaseError = (error: any): string => {
    const errorCode = error.code || ''
    
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already in use. Please try a different one or login.'
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.'
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password. Please try again.'
      case 'auth/too-many-requests':
        return 'Too many unsuccessful login attempts. Please try again later.'
      case 'auth/popup-closed-by-user':
        return 'Login popup was closed before completion.'
      default:
        return error.message || 'An error occurred during authentication. Please try again.'
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    authInitialized,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile
  }
} 