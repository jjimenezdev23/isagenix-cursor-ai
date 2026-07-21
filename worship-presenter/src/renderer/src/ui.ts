import { create } from 'zustand'

interface ToastState {
  message: string | null
  kind: 'info' | 'error'
  show(message: string, kind?: 'info' | 'error'): void
  clear(): void
}

let timer: ReturnType<typeof setTimeout> | null = null

export const useToast = create<ToastState>((set) => ({
  message: null,
  kind: 'info',
  show(message, kind = 'info') {
    set({ message, kind })
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => set({ message: null }), kind === 'error' ? 6000 : 3000)
  },
  clear() {
    set({ message: null })
  }
}))

export function toast(message: string, kind: 'info' | 'error' = 'info'): void {
  useToast.getState().show(message, kind)
}

export function errorToast(err: unknown): void {
  const message = err instanceof Error ? err.message : String(err)
  toast(message, 'error')
}
