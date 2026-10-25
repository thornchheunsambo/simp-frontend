export function useAuth() {
  const session = useSession()
  const { api } = useApi()

  async function login(email: string, password: string) {
    const res = await api('/api/auth/login', { method: 'POST', body: { email, password } })
    session.set(res)
    return res
  }

  async function register(body: any) {
    const res = await api('/api/auth/register', { method: 'POST', body })
    session.set(res)
    return res
  }

  async function logout() {
    session.clear()
    await navigateTo('/login')
  }

  return { token: session.token, user: session.user, login, register, logout }
}