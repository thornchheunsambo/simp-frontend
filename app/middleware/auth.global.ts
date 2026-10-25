// Runs on every navigation: login check + role check.
export default defineNuxtRouteMiddleware((to) => {
  const { token, user } = useSession()
  const publicPaths = ['/login', '/register']
  const isPublic = publicPaths.includes(to.path)

  if (!token.value) {
    return isPublic ? undefined : navigateTo('/login')
  }

  const home = homeFor(user.value?.role)
  if (isPublic || to.path === '/') return navigateTo(home)

  const rules: Array<[string, string[]]> = [
    ['/student', ['STUDENT']],
    ['/company', ['COMPANY']],
    ['/staff', ['STAFF', 'ADMIN']],
    ['/admin', ['ADMIN']]
  ]
  for (const [prefix, roles] of rules) {
    if (to.path.startsWith(prefix) && !roles.includes(user.value?.role || '')) {
      return navigateTo(home)
    }
  }
})