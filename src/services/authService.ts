import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
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
  await sendEmailVerification(user)
}

export async function resendVerificationEmail(user: User) {
  await sendEmailVerification(user)
}

export async function refreshEmailVerification(user: User) {
  await user.reload()
  await user.getIdToken(true)
  return user.emailVerified
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
