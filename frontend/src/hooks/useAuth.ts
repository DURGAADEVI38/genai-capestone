import { useStore } from '@/store/useStore'

export function useAuth() {
  const user = useStore((state) => state.user)
  const logout = useStore((state) => state.logout)

  return { user, isAuthenticated: Boolean(user), logout }
}