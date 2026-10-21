import { updateProfile, type User } from 'firebase/auth'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { UserProfile } from '../types/user'

export function subscribeToUserProfile(
  uid: string,
  onChange: (profile: UserProfile | null) => void,
) {
  return onSnapshot(
    doc(db, 'users', uid),
    (snapshot) => {
      onChange(snapshot.exists() ? { username: snapshot.data().username } : null)
    },
    (error) => {
      console.error('No se pudo leer el perfil del usuario:', error)
      onChange(null)
    },
  )
}

export async function saveUsername(user: User, username: string) {
  await setDoc(doc(db, 'users', user.uid), {
    username,
    createdAt: serverTimestamp(),
  })
  await updateProfile(user, { displayName: username })
}
