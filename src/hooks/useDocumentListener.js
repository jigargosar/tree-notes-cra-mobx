import { useEffect } from 'react'

export function useDocumentListener(name, fn, deps = []) {
  useEffect(() => {
    document.addEventListener(name, fn)

    return () => {
      document.removeEventListener(name, fn)
    }
  }, deps)
}
