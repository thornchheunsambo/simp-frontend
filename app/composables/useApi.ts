export function useApi() {
  const config = useRuntimeConfig()
  const session = useSession()
  const base = String(config.public.apiBase).replace(/\/$/, '')

  async function api<T = any>(path: string, opts: any = {}): Promise<T> {
    const headers: Record<string, string> = { ...(opts.headers || {}) }
    if (session.token.value) headers.Authorization = `Bearer ${session.token.value}`
    try {
      return await $fetch<T>(base + path, { ...opts, headers })
    } catch (e: any) {
      const status = e?.response?.status ?? e?.statusCode
      if (status === 401 && session.token.value) {
        session.clear()
        await navigateTo('/login')
      }
      throw new Error(
        e?.data?.message ||
          (status
            ? `Request failed (${status})`
            : 'Cannot reach the server. On the free Render plan it may be waking up - wait a minute and try again.')
      )
    }
  }

  const EXT: Record<string, string> = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'text/csv': '.csv'
  }

  /** Downloads a protected file (needs the Authorization header, so a plain link will not work). */
  async function download(path: string, baseName: string) {
    const headers: Record<string, string> = {}
    if (session.token.value) headers.Authorization = `Bearer ${session.token.value}`
    try {
      const res: any = await $fetch.raw(base + path, { headers, responseType: 'blob' })
      const blob: Blob = res._data
      const ext = EXT[(blob.type || '').split(';')[0]] || ''
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = baseName + ext
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      throw new Error(e?.data?.message || 'Download failed')
    }
  }

  return { api, download }
}