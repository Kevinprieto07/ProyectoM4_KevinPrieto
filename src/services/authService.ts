import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { auth } from './firebase'
import { saveUsername } from './userService'

export async function registerWithEmail(
  username: string,
  email: string,
  password: string,
) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await saveUsername(user, username)
}

export async function loginWithEmail(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password)
}

export async function loginWithGoogle() {
  await signInWithPopup(auth, new GoogleAuthProvider())
}

export async function logout() {
  await signOut(auth)
}
