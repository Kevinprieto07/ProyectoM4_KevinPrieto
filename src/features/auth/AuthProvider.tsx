import { useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../../services/firebase'
import { subscribeToUserProfile } from '../../services/userService'
import type { UserProfile } from '../../types/user'
import { AuthContext } from './AuthContext'

interface LoadedProfile {
  uid: string
  profile: UserProfile | null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loadedProfile, setLoadedProfile] = useState<LoadedProfile | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setAuthLoading(false)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!user) return
    return subscribeToUserProfile(user.uid, (profile) => {
      setLoadedProfile({ uid: user.uid, profile })
    })
  }, [user])

  const profileReady = user !== null && loadedProfile?.uid === user.uid
  const profile = profileReady ? loadedProfile.profile : null
  const loading = authLoading || (user !== null && !profileReady)

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
