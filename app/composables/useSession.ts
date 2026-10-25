// Keeps the logged-in user + JWT in shared state and in localStorage (this app is client-side only).
export function useSession() {
  const token = useState<string | null>('simp_token', () =>
    import.meta.client ? localStorage.getItem('simp_token') : null)
  const user = useState<{ id: number; email: string; role: string } | null>('simp_user', () => {
    if (!import.meta.client) return null
    try { return JSON.parse(localStorage.getItem('simp_user') || 'null') } catch { return null }
  })

  function set(res: any) {
    token.value = res.token
    user.value = { id: res.userId, email: res.email, role: res.role }
    localStorage.setItem('simp_token', res.token)
    localStorage.setItem('simp_user', JSON.stringify(user.value))
  }

  function clear() {
    token.value = null
    user.value = null
    if (import.meta.client) {
      localStorage.removeItem('simp_token')
      localStorage.removeItem('simp_user')
    }
  }

  return { token, user, set, clear }
}