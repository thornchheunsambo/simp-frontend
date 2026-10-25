export function useToast() {
  const toast = useState<{ message: string; type: string }>('simp_toast', () => ({ message: '', type: 'ok' }))
  let timer: any

  function show(message: string, type: string) {
    toast.value = { message, type }
    clearTimeout(timer)
    timer = setTimeout(() => { toast.value = { message: '', type: 'ok' } }, 3800)
  }

  return {
    toast,
    ok: (m: string) => show(m, 'ok'),
    err: (m: string) => show(m, 'err')
  }
}