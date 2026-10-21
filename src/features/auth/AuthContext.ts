import { createContext } from 'react'
import type { User } from 'firebase/auth'
import type { UserProfile } from '../../types/user'

export interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
