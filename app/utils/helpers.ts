// Files in app/utils are auto-imported by Nuxt.

export const homeFor = (role?: string | null): string =>
  ({ STUDENT: '/student', COMPANY: '/company', STAFF: '/staff', ADMIN: '/admin' } as Record<string, string>)[role || ''] || '/login'

/** Allowed next statuses for company/staff (mirrors the backend rules). */
export const NEXT_STATUS: Record<string, string[]> = {
  PENDING: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['INTERVIEWED', 'REJECTED'],
  INTERVIEWED: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['COMPLETED']
}

export const fmtDateTime = (v?: string | null): string => (v ? new Date(v).toLocaleString() : '')
export const fmtDate = (v?: string | null): string => (v ? new Date(v).toLocaleDateString() : '')

export const splitList = (s: string): string[] =>
  (s || '').split(',').map((x) => x.trim()).filter(Boolean)